'use client';
/** Tab "Funnel va hodisalar" (spec §6). */
import { RowsSkeleton, Skeleton } from '@/components/shared/skeleton';
import { Section } from '@/components/owner/section';
import type { EventRow, WebSite } from '@/lib/api/owner-analytics.types';
import { useAnalyticsFunnel } from '@/lib/hooks/use-owner-analytics';
import { fmtInt } from './format';
import { FunnelFull } from './funnel-steps';
import { EVENT_NAME, pageName } from './labels';
import { BlockError, Dash, NotTrackingState, fading } from './states';
import { TopTable } from './top-table';
import { useAnalyticsFilters } from './use-analytics-filters';

export function FunnelTab() {
  const f = useAnalyticsFilters();
  const site = f.site as WebSite;
  const ok = site === 'landing' || site === 'mock';
  const q = useAnalyticsFunnel(site, { from: f.from, to: f.to }, ok);
  if (!ok) return null;

  if (q.isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Section title="Yo'l"><Skeleton className="h-[240px] w-full" /></Section>
        <Section title="Hodisalar"><RowsSkeleton rows={5} /></Section>
      </div>
    );
  }
  if (!q.data) return <BlockError error={q.error} onRetry={() => q.refetch()} />;
  const d = q.data;
  if (!d.trackingSince) return <NotTrackingState site={site} />;
  const retention = d.period.retentionLimited;

  return (
    <div className={`flex flex-col gap-4 ${fading(q.isFetching, q.isPlaceholderData)}`}>
      <Section title="Yo'l"><FunnelFull data={d} /></Section>
      <Section title="Hodisalar">
        <TopTable<EventRow> rows={d.events} rowKey={(r) => r.key} minW="560"
          cols={[
            { key: 'n', label: 'Hodisa', render: (r) => <span className="font-semibold">{EVENT_NAME[r.key] ?? r.key}</span> },
            { key: 'c', label: 'Soni', num: true, render: (r) => (r.count === null ? <Dash reason={retention ? 'retention' : 'no_data'} /> : fmtInt(r.count)) },
            { key: 'p', label: 'Odamlar', num: true, render: (r) => (r.people === null ? <Dash reason={retention ? 'retention' : 'no_data'} /> : fmtInt(r.people)) },
            { key: 't', label: "Eng ko'p qaysi sahifada", render: (r) => (r.topPage === null ? <Dash reason={r.topPageReason ?? (retention ? 'retention' : 'no_data')} />
              : <span title={r.topPage}>{pageName(site, r.topPage) ?? r.topPage}</span>) },
          ]} />
      </Section>
    </div>
  );
}
