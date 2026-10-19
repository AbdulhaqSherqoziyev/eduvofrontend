'use client';
/** Tab "Umumiy" (spec §4): one web site, ERP, or "Hammasi" (3 columns, never summed). */
import { AlertTriangle, Building2, MousePointerClick, UserPlus, Users, Wallet } from 'lucide-react';
import { CardGridSkeleton, RowsSkeleton, Skeleton } from '@/components/shared/skeleton';
import { StatCard } from '@/components/shared/stat-card';
import { Section } from '@/components/owner/section';
import type {
  Metric, OverviewErp, OverviewLanding, OverviewMock, TrendErp, TrendWeb, WebSite,
} from '@/lib/api/owner-analytics.types';
import { useAnalyticsOverview, useAnalyticsTrend } from '@/lib/hooks/use-owner-analytics';
import { GhostLink, KpiFooter, Pill, SourceName } from './blocks';
import { addDays, fmtDM, fmtDayUz, fmtHour, fmtInt, fmtMetric, fmtPct, fmtWeekdayDay, nullTitle } from './format';
import { FunnelCompact } from './funnel-steps';
import { pageName, TAB_HREF } from './labels';
import { SiteSummaryGrid } from './site-summary';
import {
  BeforeTrackingNote, BlockError, NoRows, NotTrackingState, RetentionNote, fading, sinceText, trackingState,
} from './states';
import { CompareBars, TrendLine, type TrendPoint } from './trend-line';
import { TopTable } from './top-table';
import { buildQs, useAnalyticsFilters } from './use-analytics-filters';

export function OverviewTab() {
  const { site } = useAnalyticsFilters();
  if (site === 'all') return <SiteSummaryGrid />;
  if (site === 'erp') return <OverviewErpView />;
  return <OverviewWeb site={site} />;
}

const KPI_GRID = 'grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4';
const kpiLoading = <CardGridSkeleton count={4} className="grid-cols-2 xl:grid-cols-4" />;

/** Value + its "—" reason for a StatCard. */
const val = (m: Metric) => ({ value: fmtMetric(m.cur), valueTitle: m.cur === null ? nullTitle(m.curReason) : undefined });

const periodPill = (from: string, to: string) => (from === to ? fmtDM(from) : `${fmtDM(from)} — ${fmtDM(to)}`);

// ---------------------------------------------------------------- web (landing / mock)

function OverviewWeb({ site }: { site: WebSite }) {
  const f = useAnalyticsFilters();
  const range = { from: f.from, to: f.to };
  const q = useAnalyticsOverview(site, range);
  const today = f.range === 'today';

  if (q.isLoading) {
    return (
      <div className="flex flex-col gap-4">
        {kpiLoading}
        <Skeleton className="h-[240px] w-full" />
        <div className="grid gap-4 lg:grid-cols-2"><Section title="Qayerdan kelishdi"><RowsSkeleton rows={5} /></Section><Section title="Qaysi sahifadan kirishdi"><RowsSkeleton rows={5} /></Section></div>
      </div>
    );
  }
  if (!q.data) return <BlockError error={q.error} onRetry={() => q.refetch()} />;
  const d = q.data as OverviewLanding | OverviewMock;
  if (d.site !== site) return null;
  if (!d.trackingSince) return <NotTrackingState site={site} />;
  const ts = trackingState(d.trackingSince, d.period);
  const partial = ts === 'partial' ? d.trackingSince : null;

  const cards = d.site === 'landing' ? (
    <>
      <StatCard compact label="Tashriflar" icon={<MousePointerClick className="size-5" />} {...val(d.kpis.visits)}
        footer={<KpiFooter m={d.kpis.visits} tone="up-good" today={today} partialSince={partial} />} />
      <StatCard compact label="Odamlar" icon={<Users className="size-5" />} {...val(d.kpis.people)} hint="Har kuni alohida sanaladi: bir odam 3 kun kirsa — 3."
        footer={<KpiFooter m={d.kpis.people} tone="up-good" today={today} partialSince={partial} />} />
      <StatCard compact label="Ro'yxatdan o'tdi" sublabel="markaz yaratildi" icon={<UserPlus className="size-5" />} {...val(d.kpis.centersCreated)}
        footer={<KpiFooter m={d.kpis.centersCreated} tone="up-good" today={today} />} />
      <StatCard compact label="To'ladi" icon={<Wallet className="size-5" />} {...val(d.kpis.centersPaid)}
        footer={<KpiFooter m={d.kpis.centersPaid} tone="up-good" today={today} />} />
    </>
  ) : (
    <>
      <StatCard compact label="Tashriflar" icon={<MousePointerClick className="size-5" />} {...val(d.kpis.visits)}
        footer={<KpiFooter m={d.kpis.visits} tone="up-good" today={today} partialSince={partial} />} />
      <StatCard compact label="Odamlar" icon={<Users className="size-5" />} {...val(d.kpis.people)} hint="Har kuni alohida sanaladi: bir odam 3 kun kirsa — 3."
        footer={<KpiFooter m={d.kpis.people} tone="up-good" today={today} partialSince={partial} />} />
      <StatCard compact label="Ro'yxatdan o'tdi" icon={<UserPlus className="size-5" />} {...val(d.kpis.signups)}
        footer={<KpiFooter m={d.kpis.signups} tone="up-good" today={today} />} />
      <StatCard compact label="To'ladi" icon={<Wallet className="size-5" />} {...val(d.kpis.paidOrders)}
        footer={<KpiFooter m={d.kpis.paidOrders} tone="up-good" today={today}
          extra={d.kpis.payers.cur !== null ? `${fmtInt(d.kpis.payers.cur)} kishi` : undefined} />} />
    </>
  );

  return (
    <div className={`flex flex-col gap-4 ${fading(q.isFetching, q.isPlaceholderData)}`}>
      {ts === 'before' ? <BeforeTrackingNote since={d.trackingSince} /> : null}
      <div className={KPI_GRID}>{cards}</div>
      <WebTrend site={site} />
      <div className="grid gap-4 lg:grid-cols-2">
        <Section title="Qayerdan kelishdi" action={d.topSourcesTotal > 5 ? <GhostLink href={`${TAB_HREF.sources}${f.qs}`}>Hammasini ko&apos;rish</GhostLink> : undefined}>
          {d.topSources.length ? (
            <TopTable rows={d.topSources} rowKey={(r) => r.key} share={(r) => r.share}
              cols={[
                { key: 'n', label: 'Manba', render: (r) => <SourceName k={r.key} label={r.label ?? r.key} /> },
                { key: 'p', label: 'Odamlar', num: true, render: (r) => fmtInt(r.people) },
                { key: 's', label: 'Ulush', num: true, render: (r) => fmtPct(r.share) },
              ]} />
          ) : <NoRows period={d.period} />}
        </Section>
        <Section title="Qaysi sahifadan kirishdi"
          action={(d.topEntriesTotal ?? 0) > 5 ? <GhostLink href={`${TAB_HREF.pages}${buildQs(f.site, f.range, f.from, f.to, { view: 'entry' })}`}>Hammasini ko&apos;rish</GhostLink> : undefined}>
          {d.topEntries === null ? <RetentionNote /> : d.topEntries.length ? (
            <TopTable rows={d.topEntries} rowKey={(r) => `${r.path}|${r.lang ?? ''}`} share={(r) => r.share}
              cols={[
                { key: 'n', label: 'Sahifa', render: (r) => <span className="font-semibold" title={r.path}>{pageName(site, r.path) ?? r.path}</span> },
                { key: 'e', label: 'Kirishlar', num: true, render: (r) => fmtInt(r.entries) },
                { key: 's', label: 'Ulush', num: true, render: (r) => fmtPct(r.share) },
              ]} />
          ) : <NoRows period={d.period} />}
        </Section>
      </div>
      <Section title="Yo'l" action={<GhostLink href={`${TAB_HREF.funnel}${f.qs}`}>Batafsil</GhostLink>}>
        <FunnelCompact site={site} steps={d.funnel} />
      </Section>
    </div>
  );
}

const dash = (v: number | null) => (v === null ? '—' : fmtInt(v));

function webPoints(t: TrendWeb): TrendPoint[] {
  return t.points.map((p) => {
    const head = t.bucket === 'hour' ? fmtHour(p.t) : t.bucket === 'week' ? `${fmtDM(p.t)} — ${fmtDM(addDays(p.t, 6))}` : fmtWeekdayDay(p.t);
    return {
      key: p.t,
      axis: t.bucket === 'hour' ? fmtHour(p.t).slice(0, 2) : fmtDM(p.t),
      v: p.people,
      tooltip: `${head} · Odamlar: ${dash(p.people)} · Tashriflar: ${dash(p.visits)} · Ro'yxatdan o'tdi: ${dash(p.signups)} · To'ladi: ${dash(p.paid)}`,
    };
  });
}

function WebTrend({ site }: { site: WebSite }) {
  const f = useAnalyticsFilters();
  const q = useAnalyticsTrend(site, { from: f.from, to: f.to });
  const t = q.data as TrendWeb | undefined;
  const title = t?.bucket === 'hour' || (!t && f.range === 'today') ? 'Soatlar bo\'yicha odamlar' : t?.bucket === 'week' ? 'Haftalar bo\'yicha odamlar' : 'Kunlar bo\'yicha odamlar';
  return (
    <Section title={title} action={<Pill>{periodPill(f.from, f.to)}</Pill>}>
      {q.isLoading ? <Skeleton className="h-[240px] w-full" /> : !t ? <BlockError error={q.error} onRetry={() => q.refetch()} /> : (
        <div className={`flex flex-col gap-2 ${fading(q.isFetching, q.isPlaceholderData)}`}>
          {t.bucket === 'hour' ? (
            <div className="flex items-center gap-4 text-[12px] font-semibold text-muted">
              <span className="inline-flex items-center gap-1.5"><span aria-hidden className="h-[3px] w-5 rounded-full" style={{ background: 'var(--primary)' }} />Bugun</span>
              <span className="inline-flex items-center gap-1.5"><span aria-hidden className="w-5 border-t-2 border-dashed" style={{ borderColor: 'var(--text-soft)' }} />Kecha</span>
            </div>
          ) : null}
          <TrendLine points={webPoints(t)} prev={t.bucket === 'hour' ? (t.prevPoints ?? []).map((p) => p.people) : null}
            axisEvery={t.bucket === 'hour' ? 3 : t.points.length <= 8 ? 1 : t.bucket === 'week' ? 2 : 5}
            srCaption={title} srHead={[t.bucket === 'hour' ? 'Soat' : 'Sana', 'Odamlar']} />
          {t.trackingSince && trackingState(t.trackingSince, t.period) === 'partial' ? (
            <p className="text-[12px] font-medium text-muted">{sinceText(t.trackingSince)}</p>
          ) : null}
        </div>
      )}
    </Section>
  );
}

// ---------------------------------------------------------------- ERP

function OverviewErpView() {
  const f = useAnalyticsFilters();
  const q = useAnalyticsOverview('erp', { from: f.from, to: f.to });
  const today = f.range === 'today';
  if (q.isLoading) {
    return (
      <div className="flex flex-col gap-4">
        {kpiLoading}
        <Skeleton className="h-[240px] w-full" />
        <div className="grid gap-4 lg:grid-cols-2"><Section title="Ko'p ishlatilgan modullar"><RowsSkeleton rows={5} /></Section><Section title="Xato ko'p sahifalar"><RowsSkeleton rows={5} /></Section></div>
      </div>
    );
  }
  if (!q.data) return <BlockError error={q.error} onRetry={() => q.refetch()} />;
  const d = q.data as OverviewErp;
  if (d.site !== 'erp') return null;
  if (!d.trackingSince) return <NotTrackingState site="erp" />;
  const ts = trackingState(d.trackingSince, d.period);
  const partial = ts === 'partial' ? d.trackingSince : null;
  const k = d.kpis;

  return (
    <div className={`flex flex-col gap-4 ${fading(q.isFetching, q.isPlaceholderData)}`}>
      {ts === 'before' ? <BeforeTrackingNote since={d.trackingSince} /> : null}
      <div className={KPI_GRID}>
        <StatCard compact label="Faol markazlar" icon={<Building2 className="size-5" />} {...val(k.erpActiveCenters)}
          footer={<KpiFooter m={k.erpActiveCenters} tone="up-good" today={today} partialSince={partial}
            extra={d.erpTotalCenters !== null ? `jami ${fmtInt(d.erpTotalCenters)} ta markazdan` : undefined} />} />
        <StatCard compact label="Faol foydalanuvchilar" icon={<Users className="size-5" />} {...val(k.erpActiveUsersAvg)}
          hint="Kunlik o'rtacha. Har kuni alohida sanaladi."
          footer={<KpiFooter m={k.erpActiveUsersAvg} tone="up-good" today={today} partialSince={partial} />} />
        <StatCard compact label="Sahifa ochishlar" icon={<MousePointerClick className="size-5" />} {...val(k.erpPageviews)}
          footer={<KpiFooter m={k.erpPageviews} tone="neutral" today={today} partialSince={partial} />} />
        <StatCard compact label="Xatolar" icon={<AlertTriangle className="size-5" />} {...val(k.erpErrors)}
          hint="Sahifada yuz bergan dastur xatolari va server javob bermagan holatlar."
          footer={<KpiFooter m={k.erpErrors} tone="up-bad" today={today} partialSince={partial}
            extra={d.erpErrorCenters !== null ? `${fmtInt(d.erpErrorCenters)} ta markazda` : undefined} />} />
      </div>
      <ErpTrend />
      <div className="grid gap-4 lg:grid-cols-2">
        <Section title="Ko'p ishlatilgan modullar" action={d.topModulesTotal > 5 ? <GhostLink href={`${TAB_HREF.modules}${f.qs}`}>Hammasini ko&apos;rish</GhostLink> : undefined}>
          {d.topModules.length ? (
            <TopTable rows={d.topModules} rowKey={(r) => r.key} share={(r) => r.share}
              cols={[
                { key: 'n', label: 'Modul', render: (r) => <span className="font-semibold">{r.label}</span> },
                { key: 'o', label: 'Ochishlar', num: true, render: (r) => fmtInt(r.opens) },
                { key: 's', label: 'Ulush', num: true, render: (r) => fmtPct(r.share) },
              ]} />
          ) : <NoRows period={d.period} />}
        </Section>
        <Section title="Xato ko'p sahifalar"
          action={d.topErrorPagesTotal > 5 ? <GhostLink href={`${TAB_HREF.pages}${buildQs(f.site, f.range, f.from, f.to, { sort: 'errors' })}`}>Hammasini ko&apos;rish</GhostLink> : undefined}>
          {d.topErrorPages.length ? (
            <TopTable rows={d.topErrorPages} rowKey={(r) => r.path}
              cols={[
                { key: 'n', label: 'Sahifa', render: (r) => <span className="font-semibold" title={r.path}>{r.path}</span> },
                { key: 'm', label: 'Modul', render: (r) => <span className="text-muted">{r.module?.label ?? '—'}</span> },
                { key: 'e', label: 'Xatolar', num: true, render: (r) => fmtInt(r.errors) },
              ]} />
          ) : <NoRows period={d.period} />}
        </Section>
      </div>
    </div>
  );
}

function ErpTrend() {
  const f = useAnalyticsFilters();
  const q = useAnalyticsTrend('erp', { from: f.from, to: f.to });
  const t = q.data as TrendErp | undefined;
  const isToday = f.range === 'today' || (f.from === f.to && f.to === f.today);
  const title = isToday ? 'Faol foydalanuvchilar: bugun va kecha shu vaqtgacha' : "Kunlar bo'yicha faol foydalanuvchilar";
  return (
    <Section title={title} action={<Pill>{periodPill(f.from, f.to)}</Pill>}>
      {q.isLoading ? <Skeleton className="h-[240px] w-full" /> : !t ? <BlockError error={q.error} onRetry={() => q.refetch()} /> : (
        <div className={fading(q.isFetching, q.isPlaceholderData)}>
          {isToday && t.todayCompare ? (
            <>
              <CompareBars today={t.todayCompare.today} yesterday={t.todayCompare.yesterdaySameTime} />
              <table className="sr-only"><caption>{title}</caption><tbody>
                <tr><td>Bugun</td><td>{fmtInt(t.todayCompare.today)}</td></tr>
                <tr><td>Kecha shu vaqtgacha</td><td>{fmtInt(t.todayCompare.yesterdaySameTime)}</td></tr>
              </tbody></table>
            </>
          ) : (
            <TrendLine axisEvery={t.points.length <= 8 ? 1 : 5} srCaption={title} srHead={['Sana', 'Faol foydalanuvchilar']}
              points={t.points.map((p) => ({
                key: p.t, axis: fmtDM(p.t), v: p.activeUsers,
                tooltip: `${fmtWeekdayDay(p.t)} · Faol foydalanuvchilar: ${dash(p.activeUsers)} · Sahifa ochishlar: ${dash(p.pageviews)} · Xatolar: ${dash(p.errors)}`,
              }))} />
          )}
          {t.trackingSince && trackingState(t.trackingSince, t.period) === 'partial' ? (
            <p className="pt-2 text-[12px] font-medium text-muted">Kuzatuv {fmtDayUz(t.trackingSince)}dan</p>
          ) : null}
        </div>
      )}
    </Section>
  );
}

