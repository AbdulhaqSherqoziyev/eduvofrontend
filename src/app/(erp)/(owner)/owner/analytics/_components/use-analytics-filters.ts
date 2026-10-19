'use client';
/**
 * Analytics filter state lives in the URL (spec §1.2):
 *   ?site=landing|mock|erp|all&range=today|7d|30d|custom&from=YYYY-MM-DD&to=YYYY-MM-DD
 * from/to only for range=custom. Default: site=all, range=7d. The last choice is mirrored to
 * localStorage['ers.analytics.filters'] and restored when the URL has no filter params (URL wins).
 * Every change is router.replace (never push).
 */
import { useCallback, useEffect, useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { AnalyticsSiteOrAll, IsoDate } from '@/lib/api/owner-analytics.types';
import { addDays, daysBetween, tashToday } from './format';
import { TABS_FOR, TAB_HREF, TAB_PAIR, tabOfPath, type TabKey } from './labels';

export type RangeKey = 'today' | '7d' | '30d' | 'custom';
const SITES: AnalyticsSiteOrAll[] = ['landing', 'mock', 'erp', 'all'];
const RANGES: RangeKey[] = ['today', '7d', '30d', 'custom'];
const LS_KEY = 'ers.analytics.filters';
const ISO_RE = /^\d{4}-\d{2}-\d{2}$/;
export const MAX_DAYS = 366;

export interface AnalyticsFilters {
  site: AnalyticsSiteOrAll;
  range: RangeKey;
  from: IsoDate;
  to: IsoDate;
  today: IsoDate;
  /** Current query string ("?site=…&range=…"), appended unchanged to tab links. */
  qs: string;
  tab: TabKey;
}

/** Quick range → [from, to] (to = today; spec §1.4). */
export function quickRange(r: Exclude<RangeKey, 'custom'>, today: IsoDate): [IsoDate, IsoDate] {
  if (r === 'today') return [today, today];
  return [addDays(today, r === '7d' ? -6 : -29), today];
}

/** null = ok, otherwise the spec's message. */
export function rangeError(from: string, to: string, today: IsoDate): string | null {
  if (!ISO_RE.test(from) || !ISO_RE.test(to) || from > to || to > today) return "Sanalar oralig'i noto'g'ri";
  if (daysBetween(from, to) + 1 > MAX_DAYS) return 'Davr 366 kundan oshmasin';
  return null;
}

function parse(sp: URLSearchParams, today: IsoDate) {
  const s = sp.get('site');
  const site = (SITES as string[]).includes(s ?? '') ? (s as AnalyticsSiteOrAll) : 'all';
  const r = sp.get('range');
  let range: RangeKey = (RANGES as string[]).includes(r ?? '') ? (r as RangeKey) : '7d';
  let from: IsoDate, to: IsoDate;
  if (range === 'custom') {
    from = sp.get('from') ?? '';
    to = sp.get('to') ?? '';
    // a hand-typed URL with a broken range falls back to the default period
    if (rangeError(from, to, today)) { range = '7d'; [from, to] = quickRange('7d', today); }
  } else {
    [from, to] = quickRange(range, today);
  }
  return { site, range, from, to };
}

export function buildQs(site: AnalyticsSiteOrAll, range: RangeKey, from?: string, to?: string, extra?: Record<string, string | undefined>) {
  const p = new URLSearchParams({ site, range });
  if (range === 'custom' && from && to) { p.set('from', from); p.set('to', to); }
  for (const [k, v] of Object.entries(extra ?? {})) if (v) p.set(k, v);
  return `?${p.toString()}`;
}

export function useAnalyticsFilters() {
  const sp = useSearchParams();
  const router = useRouter();
  const path = usePathname();
  const today = tashToday();
  const tab = tabOfPath(path);
  const { site, range, from, to } = useMemo(() => parse(new URLSearchParams(sp.toString()), today), [sp, today]);
  const qs = buildQs(site, range, from, to);

  /** Replace the URL, keeping tab-local params (view, sort, lang…) unless told otherwise. */
  const go = useCallback((nextTab: TabKey, nextQs: string) => router.replace(`${TAB_HREF[nextTab]}${nextQs}`, { scroll: false }), [router]);

  const setSite = useCallback((next: AnalyticsSiteOrAll) => {
    let t: TabKey = tab;
    if (!TABS_FOR[next].includes(t)) t = TAB_PAIR[t] && TABS_FOR[next].includes(TAB_PAIR[t]!) ? TAB_PAIR[t]! : 'overview';
    go(t, buildQs(next, range, from, to));
  }, [tab, range, from, to, go]);

  const setRange = useCallback((r: RangeKey, f?: IsoDate, tt?: IsoDate) => {
    const keep = new URLSearchParams(sp.toString());
    const extra = Object.fromEntries([...keep.entries()].filter(([k]) => !['site', 'range', 'from', 'to'].includes(k)));
    go(tab, buildQs(site, r, f, tt, extra));
  }, [sp, site, tab, go]);

  /** Set/clear a tab-local param (view, sort, lang, filter…). */
  const setParams = useCallback((next: Record<string, string | null>) => {
    const p = new URLSearchParams(sp.toString());
    for (const [key, value] of Object.entries(next)) { if (value) p.set(key, value); else p.delete(key); }
    router.replace(`${path}?${p.toString()}`, { scroll: false });
  }, [sp, path, router]);
  const setParam = useCallback((key: string, value: string | null) => setParams({ [key]: value }), [setParams]);

  // mirror to localStorage; restore when the URL carries no filter (URL wins)
  useEffect(() => {
    const hasFilter = sp.has('site') || sp.has('range');
    if (!hasFilter) {
      try {
        const saved = JSON.parse(localStorage.getItem(LS_KEY) ?? 'null') as { site?: string; range?: string; from?: string; to?: string } | null;
        if (saved && (SITES as string[]).includes(saved.site ?? '') && (RANGES as string[]).includes(saved.range ?? '')) {
          const p = new URLSearchParams(sp.toString());
          p.set('site', saved.site!); p.set('range', saved.range!);
          if (saved.range === 'custom' && saved.from && saved.to) { p.set('from', saved.from); p.set('to', saved.to); }
          router.replace(`${path}?${p.toString()}`, { scroll: false });
          return;
        }
      } catch { /* storage blocked — defaults stay */ }
      return;
    }
    try { localStorage.setItem(LS_KEY, JSON.stringify({ site, range, from: range === 'custom' ? from : undefined, to: range === 'custom' ? to : undefined })); } catch { /* ignore */ }
  }, [sp, site, range, from, to, path, router]);

  // a tab this site does not have (direct URL, "Hammasi") → its pair or Umumiy, period kept (§1.1)
  useEffect(() => {
    if (TABS_FOR[site].includes(tab)) return;
    const pair = TAB_PAIR[tab];
    go(pair && TABS_FOR[site].includes(pair) ? pair : 'overview', qs);
  }, [site, tab, qs, go]);

  const filters: AnalyticsFilters = { site, range, from, to, today, qs, tab };
  return { ...filters, filters, setSite, setRange, setParam, setParams, param: (k: string) => sp.get(k) };
}
