'use client';
/** Tab "Auditoriya" (spec §10): top-5 blocks, "Hammasini ko'rish" opens the full list in place (50 + "Ko'proq"). */
import { useState } from 'react';
import { Monitor, Smartphone, Tablet } from 'lucide-react';
import { RowsSkeleton } from '@/components/shared/skeleton';
import { Section } from '@/components/owner/section';
import { NmButton } from '@/components/ui/nm-button';
import type { AnalyticsSite, AudienceDim, AudienceResponse, PeriodInfo, TopList, TopRow } from '@/lib/api/owner-analytics.types';
import { useAnalyticsAudience, useAnalyticsAudienceDim } from '@/lib/hooks/use-owner-analytics';
import { fmtInt, fmtPct } from './format';
import { localeName } from './labels';
import { MoreButton } from './sources-tab';
import { BlockError, InfoNote, NoRows, NotTrackingState, fading } from './states';
import { TopTable } from './top-table';
import { useAnalyticsFilters } from './use-analytics-filters';

const BLOCKS: Array<{ dim: AudienceDim; title: string }> = [
  { dim: 'devices', title: 'Qurilma' },
  { dim: 'browsers', title: 'Brauzer' },
  { dim: 'os', title: 'Operatsion tizim' },
  { dim: 'countries', title: 'Mamlakat' },
  { dim: 'cities', title: 'Shahar' },
  { dim: 'browserLanguages', title: 'Brauzer tili' },
  { dim: 'siteLanguages', title: 'Sayt tili' },
];
const DEVICE_ICON: Record<string, React.ReactNode> = {
  mobile: <Smartphone className="size-4 flex-shrink-0 text-muted" aria-hidden />,
  desktop: <Monitor className="size-4 flex-shrink-0 text-muted" aria-hidden />,
  tablet: <Tablet className="size-4 flex-shrink-0 text-muted" aria-hidden />,
};

function label(dim: AudienceDim, r: TopRow) {
  const text = r.label ?? (dim === 'siteLanguages' ? localeName(r.key) : r.key);
  if (dim !== 'devices') return <span className="font-semibold" title={text}>{text}</span>;
  return <span className="inline-flex items-center gap-2 font-semibold">{DEVICE_ICON[r.key] ?? null}{text}</span>;
}

function DimTable({ dim, rows }: { dim: AudienceDim; rows: TopRow[] }) {
  return (
    <TopTable rows={rows} rowKey={(r) => r.key} share={(r) => r.share}
      cols={[
        { key: 'n', label: 'Nom', render: (r) => label(dim, r) },
        { key: 'p', label: 'Odamlar', num: true, render: (r) => fmtInt(r.people) },
        { key: 's', label: 'Ulush', num: true, render: (r) => fmtPct(r.share) },
      ]} />
  );
}

function FullList({ dim, site }: { dim: AudienceDim; site: AnalyticsSite }) {
  const f = useAnalyticsFilters();
  const q = useAnalyticsAudienceDim(dim, site, { from: f.from, to: f.to });
  if (q.isLoading) return <RowsSkeleton rows={5} />;
  if (!q.data) return <BlockError error={q.error} onRetry={() => q.refetch()} />;
  return (
    <div className="flex flex-col gap-2">
      <DimTable dim={dim} rows={q.data.pages.flatMap((p) => p.rows)} />
      <MoreButton q={q} />
    </div>
  );
}

function Block({ dim, title, list, site, period }: { dim: AudienceDim; title: string; list: TopList; site: AnalyticsSite; period: PeriodInfo }) {
  const [full, setFull] = useState(false);
  return (
    <Section title={title}
      action={list.total > 5 ? (
        <NmButton variant="ghost" size="sm" className="h-auto px-0 py-1" aria-expanded={full} onClick={() => setFull((v) => !v)}>
          Hammasini ko&apos;rish
        </NmButton>
      ) : undefined}>
      {dim === 'cities' ? (
        <InfoNote>Mobil internetda ko&apos;p odam Toshkentdan bo&apos;lib ko&apos;rinadi: operatorlar trafikni Toshkent orqali o&apos;tkazadi. Shaharlar ro&apos;yxatini shuni hisobga olib o&apos;qing.</InfoNote>
      ) : null}
      {full ? <FullList dim={dim} site={site} /> : list.rows.length ? <DimTable dim={dim} rows={list.rows} /> : <NoRows period={period} />}
    </Section>
  );
}

export function AudienceTab() {
  const f = useAnalyticsFilters();
  const site = f.site as AnalyticsSite;
  const ok = (f.site as string) !== 'all';
  const q = useAnalyticsAudience(site, { from: f.from, to: f.to }, ok);
  if (!ok) return null;
  if (q.isLoading) {
    return <div className="grid gap-4 lg:grid-cols-2">{BLOCKS.slice(0, site === 'erp' ? 5 : 6).map((b) => <Section key={b.dim} title={b.title}><RowsSkeleton rows={5} /></Section>)}</div>;
  }
  if (!q.data) return <BlockError error={q.error} onRetry={() => q.refetch()} />;
  const d: AudienceResponse = q.data;
  if (!d.trackingSince) return <NotTrackingState site={site} />;
  const blocks = BLOCKS.filter((b) => d[b.dim] !== null && d[b.dim] !== undefined);

  return (
    <div className={`flex flex-col gap-3 ${fading(q.isFetching, q.isPlaceholderData)}`}>
      <div className="grid gap-4 lg:grid-cols-2">
        {blocks.map((b) => <Block key={`${b.dim}-${f.from}-${f.to}`} dim={b.dim} title={b.title} list={d[b.dim] as TopList} site={site} period={d.period} />)}
      </div>
      {/* DB-IP Lite is CC BY 4.0 — attribution is a licence requirement (contract §9) */}
      <p className="text-[11.5px] font-medium text-muted">
        <a href="https://db-ip.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary hover:underline">IP geolocation by DB-IP</a>
      </p>
    </div>
  );
}
