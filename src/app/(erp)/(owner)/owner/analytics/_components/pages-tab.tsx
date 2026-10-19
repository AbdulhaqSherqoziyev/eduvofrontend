'use client';
/** Tab "Sahifalar" (spec §8): web all/entry/exit views (+ mock language filter), ERP pages with errors. */
import type { InfiniteData, UseInfiniteQueryResult } from '@tanstack/react-query';
import { AlertTriangle } from 'lucide-react';
import { RowsSkeleton } from '@/components/shared/skeleton';
import { StatusPill } from '@/components/shared/status-pill';
import { Section } from '@/components/owner/section';
import { NmSegmented } from '@/components/ui/nm-segmented';
import { NmSelect } from '@/components/ui/nm-select';
import type {
  AnalyticsSite, Paged, PageRowAll, PageRowEntry, PageRowErp, PageRowExit, PagesResponse,
} from '@/lib/api/owner-analytics.types';
import { useAnalyticsPages } from '@/lib/hooks/use-owner-analytics';
import { fmtInt } from './format';
import { localeName, pageName } from './labels';
import { MoreButton, rateCell, timeCell } from './sources-tab';
import { BlockError, NoRows, NotTrackingState, fading } from './states';
import { PathCell, TopTable, type Col } from './top-table';
import { useAnalyticsFilters } from './use-analytics-filters';

type View = 'all' | 'entry' | 'exit';
const VIEWS = [{ value: 'all', label: 'Hammasi' }, { value: 'entry', label: 'Kirish sahifalari' }, { value: 'exit', label: 'Chiqish sahifalari' }];

export function ErrorsPill({ n }: { n: number }) {
  if (n <= 0) return <>0</>;
  return <StatusPill tone="danger" icon={<AlertTriangle className="size-3.5" aria-hidden />} label={fmtInt(n)} className="px-2.5 py-[3px]" />;
}

export function PagesTab() {
  const f = useAnalyticsFilters();
  const site = f.site as AnalyticsSite;
  const isErp = site === 'erp';
  const raw = f.param('view');
  const view: View = !isErp && (raw === 'entry' || raw === 'exit') ? raw : 'all';
  const sort = isErp && f.param('sort') === 'errors' ? 'errors' : undefined;
  const lang = site === 'mock' ? f.param('lang') ?? undefined : undefined;
  const q = useAnalyticsPages({ site, from: f.from, to: f.to, view, sort, lang, limit: 50 }, site !== ('all' as string));
  if ((site as string) === 'all') return null;

  const setView = (v: string) => f.setParam('view', v === 'all' ? null : v);
  const first = q.data?.pages[0];
  const langs: string[] | null = first && 'languages' in first ? (first.languages as string[] | null) : null;

  return (
    <Section title={sort === 'errors' ? "Xato ko'p sahifalar" : 'Sahifalar'}
      action={!isErp ? <NmSegmented size="sm" aria-label="Ko'rinish" className="hidden w-[420px] sm:flex" items={VIEWS} value={view} onValueChange={setView} /> : undefined}>
      {!isErp ? <NmSegmented size="sm" aria-label="Ko'rinish" className="w-full sm:hidden [&>button]:px-2" items={VIEWS} value={view} onValueChange={setView} /> : null}
      {site === 'mock' ? (
        <div className="w-full sm:w-[180px]">
          <NmSelect aria-label="Til" value={lang ?? ''} onChange={(e) => f.setParam('lang', e.target.value || null)}>
            <option value="">Barcha tillar</option>
            {(langs ?? (lang ? [lang] : [])).map((l) => <option key={l} value={l}>{localeName(l)}</option>)}
          </NmSelect>
        </div>
      ) : null}
      <PagesBody q={q as unknown as UseInfiniteQueryResult<InfiniteData<PagesResponse & Paged<unknown>>>} site={site} />
    </Section>
  );
}

function PagesBody({ q, site }: { q: UseInfiniteQueryResult<InfiniteData<PagesResponse & Paged<unknown>>>; site: AnalyticsSite }) {
  if (q.isLoading) return <RowsSkeleton rows={5} />;
  if (!q.data) return <BlockError error={q.error} onRetry={() => q.refetch()} />;
  const first = q.data.pages[0];
  if (!first.trackingSince) return <NotTrackingState site={site} compact />;
  const period = first.period;
  const rows = q.data.pages.flatMap((p) => p.rows);
  if (!rows.length) return <NoRows period={period} />;
  const name = (path: string) => <PathCell name={pageName(site, path)} path={path} />;

  let table: React.ReactNode;
  if (first.site === 'erp') {
    const cols: Col<PageRowErp>[] = [
      { key: 'p', label: 'Sahifa', render: (r) => <PathCell name={null} path={r.path} /> },
      { key: 'm', label: 'Modul', render: (r) => <span className="text-muted">{r.module?.label ?? '—'}</span> },
      { key: 'o', label: 'Ochishlar', num: true, render: (r) => fmtInt(r.opens) },
      { key: 'c', label: 'Markazlar', num: true, render: (r) => fmtInt(r.centers) },
      { key: 't', label: 'Sahifada vaqt', num: true, render: (r) => timeCell(r.medianPageTimeSec, period) },
      { key: 'e', label: 'Xatolar', num: true, render: (r) => <ErrorsPill n={r.errors} /> },
    ];
    table = <TopTable cols={cols} rows={rows as PageRowErp[]} rowKey={(r) => r.path} minW="680" />;
  } else if (first.view === 'entry') {
    const cols: Col<PageRowEntry>[] = [
      { key: 'p', label: 'Sahifa', render: (r) => name(r.path) },
      { key: 'e', label: 'Kirishlar', num: true, render: (r) => fmtInt(r.entries) },
      { key: 'b', label: 'Bir sahifada qoldi', num: true, render: (r) => rateCell(r.singlePageRate) },
      { key: 't', label: 'Saytda vaqt', num: true, render: (r) => timeCell(r.medianVisitTimeSec, period) },
    ];
    table = <TopTable cols={cols} rows={rows as PageRowEntry[]} rowKey={(r) => r.path} minW="560" />;
  } else if (first.view === 'exit') {
    const cols: Col<PageRowExit>[] = [
      { key: 'p', label: 'Sahifa', render: (r) => name(r.path) },
      { key: 'x', label: 'Chiqishlar', num: true, render: (r) => fmtInt(r.exits) },
      { key: 'r', label: 'Chiqishlar ulushi', num: true, render: (r) => rateCell(r.exitRate) },
    ];
    table = <TopTable cols={cols} rows={rows as PageRowExit[]} rowKey={(r) => r.path} minW="560" />;
  } else {
    const cols: Col<PageRowAll>[] = [
      { key: 'p', label: 'Sahifa', render: (r) => name(r.path) },
      { key: 'v', label: "Ko'rishlar", num: true, render: (r) => fmtInt(r.views) },
      { key: 'o', label: 'Odamlar', num: true, render: (r) => fmtInt(r.people) },
      { key: 't', label: 'Sahifada vaqt', num: true, render: (r) => timeCell(r.medianPageTimeSec, period) },
      { key: 'e', label: 'Kirishlar', num: true, render: (r) => fmtInt(r.entries) },
      { key: 'x', label: 'Chiqishlar', num: true, render: (r) => fmtInt(r.exits) },
    ];
    table = <TopTable cols={cols} rows={rows as PageRowAll[]} rowKey={(r) => r.path} minW="680" />;
  }
  return (
    <div className={`flex flex-col gap-2 ${fading(q.isFetching && !q.isFetchingNextPage, q.isPlaceholderData)}`}>
      {table}
      <MoreButton q={q} />
    </div>
  );
}
