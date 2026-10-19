'use client';
/** Tab "Manbalar" (spec §5): source / campaign table + UTM link builder. */
import type { InfiniteData, UseInfiniteQueryResult } from '@tanstack/react-query';
import { RowsSkeleton } from '@/components/shared/skeleton';
import { Section } from '@/components/owner/section';
import { NmButton } from '@/components/ui/nm-button';
import { NmSegmented } from '@/components/ui/nm-segmented';
import type { CampaignRow, Paged, PeriodInfo, SourceRowLanding, SourceRowMock, SourcesResponse, WebSite } from '@/lib/api/owner-analytics.types';
import { useAnalyticsSources } from '@/lib/hooks/use-owner-analytics';
import { SourceName } from './blocks';
import { fmtDuration, fmtInt, fmtPct } from './format';
import { BlockError, Dash, NoRows, NotTrackingState, fading } from './states';
import { TopTable, type Col } from './top-table';
import { UtmBuilder } from './utm-builder';
import { useAnalyticsFilters } from './use-analytics-filters';

type Resp = SourcesResponse & Paged<unknown>;

/** "Ko'proq" under a paged table. */
export function MoreButton({ q }: { q: { hasNextPage: boolean; isFetchingNextPage: boolean; fetchNextPage: () => unknown } }) {
  if (!q.hasNextPage) return null;
  return (
    <div className="flex justify-center pt-1">
      <NmButton variant="soft" size="sm" disabled={q.isFetchingNextPage} onClick={() => q.fetchNextPage()}>
        {q.isFetchingNextPage ? 'Yuklanmoqda…' : "Ko'proq"}
      </NmButton>
    </div>
  );
}

/** Median time cell: number, or "—" (90-day rule / nothing to measure). */
export const timeCell = (sec: number | null, period: PeriodInfo) =>
  sec === null ? <Dash reason={period.retentionLimited ? 'retention' : 'no_data'} /> : fmtDuration(sec);
export const rateCell = (r: number | null) => (r === null ? <Dash /> : fmtPct(r));

export function SourcesTab() {
  const f = useAnalyticsFilters();
  const site = f.site as WebSite;
  const view = f.param('view') === 'campaign' ? 'campaign' : 'source';
  const q = useAnalyticsSources({ site, from: f.from, to: f.to, view, limit: 50 }, site === 'landing' || site === 'mock');
  if (site !== 'landing' && site !== 'mock') return null;

  return (
    <div className="flex flex-col gap-4">
      <Section title="Manbalar"
        action={<NmSegmented size="sm" aria-label="Ko'rinish" className="hidden w-[260px] sm:flex" value={view}
          items={[{ value: 'source', label: 'Manba' }, { value: 'campaign', label: 'Kampaniya' }]}
          onValueChange={(v) => f.setParam('view', v === 'campaign' ? 'campaign' : null)} />}>
        <NmSegmented size="sm" aria-label="Ko'rinish" className="w-full sm:hidden" value={view}
          items={[{ value: 'source', label: 'Manba' }, { value: 'campaign', label: 'Kampaniya' }]}
          onValueChange={(v) => f.setParam('view', v === 'campaign' ? 'campaign' : null)} />
        <SourcesBody q={q as unknown as UseInfiniteQueryResult<InfiniteData<Resp>>} site={site} view={view} />
      </Section>
      <UtmBuilder defaultSite={site} />
    </div>
  );
}

function SourcesBody({ q, site, view }: { q: UseInfiniteQueryResult<InfiniteData<Resp>>; site: WebSite; view: 'source' | 'campaign' }) {
  if (q.isLoading) return <RowsSkeleton rows={5} />;
  if (!q.data) return <BlockError error={q.error} onRetry={() => q.refetch()} />;
  const first = q.data.pages[0];
  if (!first.trackingSince) return <NotTrackingState site={site} compact />;
  const rows = q.data.pages.flatMap((p) => p.rows);
  const period = first.period;
  if (!rows.length) {
    return view === 'campaign'
      ? <NoRows period={period} text={'Hali UTM havola orqali kelganlar yo\'q. Pastdagi "Havola yasash" bilan birinchisini tayyorlang.'} />
      : <NoRows period={period} />;
  }

  let table: React.ReactNode;
  if (first.view === 'campaign') {
    const cols: Col<CampaignRow>[] = [
      { key: 'c', label: 'Kampaniya', render: (r) => <span className="font-semibold" title={r.campaign}>{r.campaign}</span> },
      { key: 's', label: 'Manba', render: (r) => r.source ?? '—' },
      { key: 'm', label: 'Kanal', render: (r) => r.medium ?? '—' },
      { key: 'v', label: 'Tashriflar', num: true, render: (r) => fmtInt(r.visits) },
      { key: 'p', label: 'Odamlar', num: true, render: (r) => fmtInt(r.people) },
      { key: 't', label: 'Saytda vaqt', num: true, render: (r) => timeCell(r.medianVisitTimeSec, period) },
    ];
    table = <TopTable cols={cols} rows={rows as CampaignRow[]} rowKey={(r) => `${r.campaign}|${r.source}|${r.medium}`} minW="680" />;
  } else if (site === 'landing') {
    const cols: Col<SourceRowLanding>[] = [
      { key: 'n', label: 'Manba', render: (r) => <SourceName k={r.key} label={r.label} /> },
      { key: 'v', label: 'Tashriflar', num: true, render: (r) => fmtInt(r.visits) },
      { key: 'p', label: 'Odamlar', num: true, render: (r) => fmtInt(r.people) },
      { key: 'sp', label: "Ro'yxat sahifasini ochdi", title: "Ro'yxatdan o'tish sahifasini ochgan odamlar. Bu ro'yxatdan o'tganlar soni emas.", num: true, render: (r) => fmtInt(r.signupPagePeople) },
      { key: 't', label: 'Saytda vaqt', num: true, render: (r) => timeCell(r.medianVisitTimeSec, period) },
      { key: 'c', label: "Bog'lanish", num: true, render: (r) => fmtInt(r.contactClicks) },
    ];
    table = <TopTable cols={cols} rows={rows as SourceRowLanding[]} rowKey={(r) => r.key} share={(r) => r.share} minW="680" />;
  } else {
    const cols: Col<SourceRowMock>[] = [
      { key: 'n', label: 'Manba', render: (r) => <SourceName k={r.key} label={r.label} /> },
      { key: 'v', label: 'Tashriflar', num: true, render: (r) => fmtInt(r.visits) },
      { key: 'p', label: 'Odamlar', num: true, render: (r) => fmtInt(r.people) },
      { key: 'b', label: 'Bir sahifada qoldi', title: 'Bitta sahifa ko\'rib chiqib ketganlar', num: true, render: (r) => rateCell(r.singlePageRate) },
      { key: 't', label: 'Saytda vaqt', num: true, render: (r) => timeCell(r.medianVisitTimeSec, period) },
      { key: 'pr', label: "Narxlarni ko'rdi", num: true, render: (r) => fmtInt(r.pricingPeople) },
    ];
    table = <TopTable cols={cols} rows={rows as SourceRowMock[]} rowKey={(r) => r.key} share={(r) => r.share} minW="680" />;
  }
  return (
    <div className={`flex flex-col gap-2 ${fading(q.isFetching && !q.isFetchingNextPage, q.isPlaceholderData)}`}>
      {table}
      <MoreButton q={q} />
    </div>
  );
}
