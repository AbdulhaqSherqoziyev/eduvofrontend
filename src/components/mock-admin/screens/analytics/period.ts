/**
 * Period model of the Analitika section (§1.2, §2.4). Everything is Asia/Tashkent (UTC+5, no DST).
 * Custom ranges are hour-precise strings "YYYY-MM-DDTHH": `from` included, `to` excluded.
 */
import { addDays, dayLabel, tashkentDay, tashkentHour } from '@/lib/admin-mock/format';
import type { Query } from '@/lib/admin-mock/http';
import type { AnRangeKey } from '@/lib/admin-mock/types';
import { T } from './texts';

export type TabKey = 'now' | 'overview' | 'pages' | 'sources' | 'geo' | 'hours' | 'exams' | 'pay';
export const TAB_KEYS: readonly TabKey[] = ['now', 'overview', 'pages', 'sources', 'geo', 'hours', 'exams', 'pay'];
export type RangeOpt = AnRangeKey | 'custom';

/** §2.4: segment options per tab (null = no period row) and the default. */
export const TAB_PERIODS: Record<TabKey, readonly RangeOpt[] | null> = {
  now: null,
  overview: ['today', '7d', '30d', 'custom'],
  pages: ['today', '7d', '30d', 'custom'],
  sources: ['today', '7d', '30d', 'custom'],
  geo: ['today', '7d', '30d', 'custom'],
  hours: ['7d', '28d', '90d', 'custom'],
  exams: ['7d', '30d', '90d', 'custom'],
  pay: ['7d', '30d', '90d', 'custom'],
};
export const TAB_DEFAULT: Record<TabKey, RangeOpt> = {
  now: '7d', overview: '7d', pages: '7d', sources: '7d', geo: '7d', hours: '28d', exams: '30d', pay: '30d',
};

export const asTab = (v: string): TabKey => ((TAB_KEYS as readonly string[]).includes(v) ? (v as TabKey) : 'now');

/** URL `range` → the tab's option (unknown or not offered on this tab → its default). */
export function effectiveRange(tab: TabKey, range: string): RangeOpt {
  const opts = TAB_PERIODS[tab];
  if (opts && (opts as readonly string[]).includes(range)) return range as RangeOpt;
  return TAB_DEFAULT[tab];
}

const HOUR_MS = 3_600_000;
const pad = (n: number) => String(n).padStart(2, '0');
/** "YYYY-MM-DDTHH" → epoch ms (Tashkent) */
export const stampMs = (s: string) => Date.parse(`${s}:00:00+05:00`);
export const isStamp = (s: string) => /^\d{4}-\d{2}-\d{2}T\d{2}$/.test(s) && !Number.isNaN(stampMs(s));
/** epoch ms → "YYYY-MM-DDTHH" (Tashkent) */
export function msStamp(ms: number) {
  const d = new Date(ms + 5 * HOUR_MS);
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}T${pad(d.getUTCHours())}`;
}
/** end of the current hour = the latest allowed `to` ("hozir") */
export const nowEndStamp = (now = Date.now()) => msStamp(stampMs(`${tashkentDay(new Date(now))}T${pad(tashkentHour(new Date(now)))}`) + HOUR_MS);

/** §2.4: Dan = yesterday 00:00, Gacha = now */
export function defaultCustom(now = Date.now()) {
  const today = tashkentDay(new Date(now));
  return { from: `${addDays(today, -1)}T00`, to: nowEndStamp(now) };
}

/** tabs whose data comes from the raw tracker window (hour precision only for the last 90 days) */
export const TRACKER_TABS: readonly TabKey[] = ['overview', 'pages', 'sources', 'geo'];

/**
 * §2.4 validation; null = OK. `tracker`: contract §0.4 — an hour-precise (not day-aligned) range that
 * starts before today−89 00:00 is refused by the tracker endpoints (HOUR_RANGE_TOO_OLD).
 */
export function customError(from: string, to: string, now = Date.now(), tracker = false): string | null {
  if (!isStamp(from) || !isStamp(to)) return T.period.errOrder;
  const a = stampMs(from), b = stampMs(to);
  if (a >= b) return T.period.errOrder;
  const nowEnd = nowEndStamp(now);
  if (b > stampMs(nowEnd)) return T.period.errFuture;
  if (b - a > 366 * 24 * HOUR_MS) return T.period.errMax;
  if (tracker) {
    const aligned = from.endsWith('T00') && (to.endsWith('T00') || to === nowEnd);
    const oldest = stampMs(`${addDays(tashkentDay(new Date(now)), -89)}T00`);
    if (!aligned && a < oldest) return T.period.errHourOld;
  }
  return null;
}

/** "21 okt, 14:00" */
export const stampLabel = (s: string) => `${dayLabel(s.slice(0, 10))}, ${s.slice(11, 13)}:00`;

export interface Period {
  tab: TabKey;
  range: RangeOpt;
  from: string;
  to: string;
  /** API query (range or from/to) — null while the custom range is invalid */
  query: Query | null;
  error: string | null;
  /** "28 kun" / "20 okt, 14:00 – 21 okt, 09:00" (legend "… ichidagi jami") */
  label: string;
  /** whole days the period spans (custom: rounded up) */
  days: number;
  /** "kechaning shu vaqtiga nisbatan" for today */
  deltaNote: string;
}

const RANGE_DAYS: Record<AnRangeKey, number> = { today: 1, '7d': 7, '28d': 28, '30d': 30, '90d': 90 };

export function makePeriod(tab: TabKey, rangeParam: string, fromParam: string, toParam: string, now = Date.now()): Period {
  const range = effectiveRange(tab, rangeParam);
  if (range !== 'custom') {
    return {
      tab, range, from: '', to: '', query: { range }, error: null,
      label: T.period[range], days: RANGE_DAYS[range],
      deltaNote: range === 'today' ? T.delta.vsYesterday : T.delta.vsPrev,
    };
  }
  const def = defaultCustom(now);
  const from = isStamp(fromParam) ? fromParam : def.from;
  const to = isStamp(toParam) ? toParam : def.to;
  const error = customError(from, to, now, TRACKER_TABS.includes(tab));
  const hours = Math.max(1, Math.round((stampMs(to) - stampMs(from)) / HOUR_MS));
  return {
    tab, range, from, to, error,
    query: error ? null : { from, to },
    label: `${stampLabel(from)} – ${stampLabel(to)}`,
    days: Math.max(1, Math.ceil(hours / 24)),
    deltaNote: T.delta.vsPrev,
  };
}

/** a period shorter than `days` (offer "30 kunni ko'rish" / "90 kunni ko'rish") */
export const shorterThan = (p: Period, days: number) => p.range === 'today' || p.days < days;

/** start of the period (ms, Tashkent) — for the 90-day retention and "before tracking" checks */
export function periodStartMs(p: Period, now = Date.now()) {
  if (p.range === 'custom') return stampMs(p.from);
  const today = tashkentDay(new Date(now));
  if (p.range === 'today') return stampMs(`${today}T00`);
  return stampMs(`${addDays(today, -p.days + 1)}T00`);
}
export function periodEndMs(p: Period, now = Date.now()) {
  return p.range === 'custom' ? stampMs(p.to) : stampMs(nowEndStamp(now));
}

/** 'YYYY-MM-DD' (Tashkent day) or an ISO instant → ms */
export const dayStartMs = (v: string) => (/^\d{4}-\d{2}-\d{2}$/.test(v) ? stampMs(`${v}T00`) : Date.parse(v));

/** tracker data for this period: never tracked / period ended before tracking / ok */
export function trackState(trackingSince: string | null, p: Period): 'none' | 'before' | 'ok' {
  if (trackingSince === null) return 'none';
  return periodEndMs(p) <= dayStartMs(trackingSince) ? 'before' : 'ok';
}

/** title of a "—" value: retention (> 90 days old) or simply no data */
export const nullTitle = (p: Period, now = Date.now()) => (periodStartMs(p, now) < now - 90 * 86_400_000 ? T.state.old90 : T.state.noData);
