'use client';
/**
 * Tab "Markazlar" (spec §11, ERP only). Center level only — no staff, no users, no hours (Q11):
 * "Oxirgi faollik" is day precision. The owner panel has no per-center page, so names are plain text.
 */
import { RowsSkeleton } from '@/components/shared/skeleton';
import { Section } from '@/components/owner/section';
import { NmSegmented } from '@/components/ui/nm-segmented';
import type { CenterRow, CentersFilter, CentersSort } from '@/lib/api/owner-analytics.types';
import { useAnalyticsCenters } from '@/lib/hooks/use-owner-analytics';
import { fmtAvg, fmtDayAgo, fmtInt } from './format';
import { ErrorsPill } from './pages-tab';
import { MoreButton } from './sources-tab';
import { BlockError, NoRows, NotTrackingState, fading } from './states';
import { TopTable } from './top-table';
import { useAnalyticsFilters } from './use-analytics-filters';

const FILTERS: Array<{ value: CentersFilter; label: string }> = [
  { value: 'active', label: 'Faol' }, { value: 'declining', label: 'Faolligi tushgan' }, { value: 'inactive', label: 'Faol emas' },
];
const SORTS: CentersSort[] = ['name', 'activeDays', 'avgDailyUsers', 'pageviews', 'errors', 'lastActiveDay'];

export function CentersTab() {
  const f = useAnalyticsFilters();
  const isErp = f.site === 'erp';
  const fp = f.param('filter');
  const filter: CentersFilter = fp === 'declining' || fp === 'inactive' ? fp : 'active';
  const sp = f.param('sort');
  const sort: CentersSort = (SORTS as string[]).includes(sp ?? '') ? (sp as CentersSort) : 'pageviews';
  const order: 'asc' | 'desc' = f.param('order') === 'asc' ? 'asc' : 'desc';
  const q = useAnalyticsCenters({ from: f.from, to: f.to, filter, sort, order, limit: 50 }, isErp);
  if (!isErp) return null;

  /** Same column flips the order; a new column starts descending (names: A→Z). */
  const onSort = (key: string) => {
    const nextOrder = key === sort ? (order === 'desc' ? 'asc' : 'desc') : key === 'name' ? 'asc' : 'desc';
    f.setParams({ sort: key, order: nextOrder });
  };

  const first = q.data?.pages[0];
  const rows = q.data?.pages.flatMap((p) => p.rows) ?? [];

  return (
    <Section title="Markazlar faolligi">
      <NmSegmented size="sm" aria-label="Markazlar" className="w-full sm:w-[440px] [&>button]:px-2"
        items={FILTERS} value={filter} onValueChange={(v) => f.setParam('filter', v === 'active' ? null : v)} />
      {filter === 'declining' ? <p className="text-[12.5px] font-medium text-muted">O&apos;tgan davrga nisbatan ikki baravardan ko&apos;proq kamaygan</p> : null}
      {q.isLoading ? <RowsSkeleton rows={5} /> : !first ? <BlockError error={q.error} onRetry={() => q.refetch()} /> : !first.trackingSince ? (
        <NotTrackingState site="erp" compact />
      ) : filter === 'declining' && !first.decliningAvailable ? (
        // contract v0.2 §11.1: "today so far" has no per-center hour data (Q11) → nothing to compare
        <p className="py-2 text-[13px] font-medium text-muted">Bugun uchun hisoblanmaydi — 7 kun yoki undan uzunroq davrni tanlang</p>
      ) : !rows.length ? (
        filter === 'inactive' ? <NoRows period={first.period} text="Barcha markazlar bu davrda faol" /> : <NoRows period={first.period} />
      ) : (
        <div className={`flex flex-col gap-2 ${fading(q.isFetching && !q.isFetchingNextPage, q.isPlaceholderData)}`}>
          <TopTable<CenterRow> rows={rows} rowKey={(r) => r.tenantId} minW="680"
            sort={{ key: sort, order, onSort }}
            cols={[
              { key: 'n', label: 'Markaz', sortKey: 'name', render: (r) => <span className="font-semibold" title={r.name}>{r.name}</span> },
              { key: 'd', label: 'Faol kunlar', num: true, sortKey: 'activeDays', render: (r) => `${r.activeDays} / ${r.days}` },
              { key: 'u', label: 'Kunlik foydalanuvchilar', num: true, sortKey: 'avgDailyUsers', render: (r) => fmtAvg(r.avgDailyUsers) },
              { key: 'p', label: 'Sahifa ochishlar', num: true, sortKey: 'pageviews', render: (r) => fmtInt(r.pageviews) },
              { key: 'e', label: 'Xatolar', num: true, sortKey: 'errors', render: (r) => <ErrorsPill n={r.errors} /> },
              { key: 'l', label: 'Oxirgi faollik', num: true, sortKey: 'lastActiveDay', render: (r) => (r.lastActiveDay ? fmtDayAgo(r.lastActiveDay, first.period.today) : '—') },
            ]} />
          <MoreButton q={q} />
        </div>
      )}
    </Section>
  );
}
