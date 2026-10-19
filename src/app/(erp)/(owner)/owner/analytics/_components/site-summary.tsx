'use client';
/**
 * "Hammasi" → Umumiy (spec §4.2): three independent columns, NO totals, each sparkline on its own scale.
 * Sevara (a): in "Bugun" the sparklines show the last 7 days (daily), captioned "so'nggi 7 kun".
 */
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { ErrorCard } from '@/components/shared/error-card';
import { Skeleton } from '@/components/shared/skeleton';
import { NmButton } from '@/components/ui/nm-button';
import { NmCard } from '@/components/ui/nm-card';
import type { AnalyticsSite, Metric, OverviewAll, PeriodInfo, SiteColumn, SparkPoint } from '@/lib/api/owner-analytics.types';
import { useAnalyticsOverview } from '@/lib/hooks/use-owner-analytics';
import { DeltaText } from './delta-text';
import { addDays, fmtAgo, fmtAvgMetric, fmtDM, fmtMetric } from './format';
import { SITE_LABEL, SITES } from './labels';
import { BlockError, ForbiddenState, NotTrackingState, fading, sinceText, trackingState } from './states';
import { Sparkline } from './trend-line';
import { useAnalyticsFilters } from './use-analytics-filters';

const dash = (v: number | null) => fmtMetric(v);

export function SiteSummaryGrid() {
  const f = useAnalyticsFilters();
  const today = f.range === 'today';
  const q = useAnalyticsOverview('all', { from: f.from, to: f.to });
  // "Bugun": a one-day sparkline says nothing → the last 7 days, daily (Sevara a)
  const week = useAnalyticsOverview('all', { from: addDays(f.today, -6), to: f.today }, today);

  if (q.isLoading) {
    return <div className="grid gap-4 lg:grid-cols-3">{SITES.map((s) => <Skeleton key={s} className="h-[360px] w-full" />)}</div>;
  }
  if (!q.data) return <BlockError error={q.error} onRetry={() => q.refetch()} />;
  const d = q.data as OverviewAll;
  if (d.site !== 'all') return null;
  const w = today ? (week.data as OverviewAll | undefined) : d;

  return (
    <div className={`grid gap-4 lg:grid-cols-3 ${fading(q.isFetching, q.isPlaceholderData)}`}>
      {SITES.map((s) => (
        <SiteSummaryCard key={s} site={s} col={d.columns[s]} today={today} period={d.period}
          spark={sparkOf(w?.columns[s])} sparkLoading={today && week.isLoading}
          onRetry={() => q.refetch()} />
      ))}
    </div>
  );
}

function sparkOf(c: SiteColumn | undefined): SparkPoint[] | null {
  return c && c.state === 'ok' ? c.spark : null;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 text-[13px]">
      <span className="font-medium text-muted">{label}</span>
      <span className="font-bold tabular-nums text-foreground">{value}</span>
    </div>
  );
}

function SiteSummaryCard({ site, col, today, period, spark, sparkLoading, onRetry }: {
  site: AnalyticsSite; col: SiteColumn; today: boolean; period: PeriodInfo; spark: SparkPoint[] | null; sparkLoading: boolean; onRetry: () => void;
}) {
  const { setSite } = useAnalyticsFilters();
  const head = <h2 className="text-[15px] font-extrabold text-foreground">{SITE_LABEL[site]}</h2>;

  if (col.state === 'forbidden') return <div className="flex flex-col gap-3">{head}<ForbiddenState compact /></div>;
  if (col.state === 'error') return <div className="flex flex-col gap-3">{head}<div className="[&>div]:py-8"><ErrorCard message="Analitikani yuklab bo'lmadi." onRetry={onRetry} /></div></div>;
  if (col.state === 'not_tracking') return <div className="flex flex-col gap-3">{head}<NotTrackingState site={site} compact /></div>;

  let bigLabel: string, big: Metric, rows: Array<[string, string]>, caption: string;
  if (col.site === 'erp') {
    bigLabel = 'Faol foydalanuvchilar'; big = col.erpActiveUsersAvg; caption = "Faol foydalanuvchilar, kunlar bo'yicha";
    rows = [['Faol markazlar', dash(col.erpActiveCenters)], ['Sahifa ochishlar', dash(col.erpPageviews)], ['Xatolar', dash(col.erpErrors)]];
  } else if (col.site === 'landing') {
    bigLabel = 'Odamlar'; big = col.people; caption = "Odamlar, kunlar bo'yicha";
    rows = [['Tashriflar', dash(col.visits)], ["Ro'yxatdan o'tdi", dash(col.centersCreated)], ["To'ladi", dash(col.centersPaid)]];
  } else {
    bigLabel = 'Odamlar'; big = col.people; caption = "Odamlar, kunlar bo'yicha";
    rows = [['Tashriflar', dash(col.visits)], ["Ro'yxatdan o'tdi", dash(col.signups)], ["To'ladi", dash(col.paidOrders)]];
  }

  return (
    <NmCard className="flex flex-col gap-4 p-5">
      <div className="flex flex-col gap-1">
        {head}
        {col.lastEventAt ? (
          <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-muted">
            <CheckCircle2 className="size-[14px] text-success" aria-hidden /> Oxirgi: {fmtAgo(col.lastEventAt)}
          </span>
        ) : null}
      </div>
      <div className="flex flex-col gap-1.5">
        <span className="text-[11px] font-bold uppercase tracking-[0.7px] text-muted">{bigLabel}</span>
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="text-[34px] font-extrabold leading-none tracking-[-1px] tabular-nums text-foreground">{site === 'erp' ? fmtAvgMetric(big.cur) : fmtMetric(big.cur)}</span>
          {/* tracking started inside the period: same line as the single-site cards (spec §3.3) */}
          {trackingState(col.trackingSince, period) === 'partial'
            ? <span className="text-[12px] font-medium text-muted">{sinceText(col.trackingSince)}</span>
            : <DeltaText cur={big.cur} prev={big.prev} tone="up-good" today={today} />}
        </div>
        {site === 'erp' ? <span className="text-[12px] font-medium text-muted">kunlik o&apos;rtacha</span> : null}
      </div>
      <div className="flex flex-col gap-2">{rows.map(([l, v]) => <Row key={l} label={l} value={v} />)}</div>
      <div className="flex flex-col gap-1">
        {sparkLoading ? <Skeleton className="h-[64px] w-full" /> : spark && spark.length ? (
          <Sparkline values={spark.map((p) => p.v)} labels={spark.map((p) => fmtDM(p.d))} caption={caption} />
        ) : <div className="h-[64px]" />}
        <span className="text-[11px] font-medium text-muted">{caption}</span>
        {today ? <span className="text-[11px] font-medium text-muted">so&apos;nggi 7 kun</span> : null}
      </div>
      <div>
        <NmButton variant="ghost" size="sm" className="h-auto px-0 py-1" onClick={() => setSite(site)}>
          Batafsil <ArrowRight className="size-3.5" aria-hidden />
        </NmButton>
      </div>
    </NmCard>
  );
}
