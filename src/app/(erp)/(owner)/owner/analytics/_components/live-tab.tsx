'use client';
/**
 * Tab "Hozir" (spec §9): last 5 minutes, refreshed every 30 s. The number simply swaps —
 * no count-up, flip, pulse or colour flash, and no aria-live.
 */
import { AlertTriangle, ArrowRight } from 'lucide-react';
import { Skeleton } from '@/components/shared/skeleton';
import { Section } from '@/components/owner/section';
import { NmButton } from '@/components/ui/nm-button';
import { NmCard } from '@/components/ui/nm-card';
import type { AnalyticsSite, LiveAll, LiveErp, LiveRow, LiveWeb, RecentHit } from '@/lib/api/owner-analytics.types';
import { useAnalyticsLive } from '@/lib/hooks/use-owner-analytics';
import { CountList } from './blocks';
import { fmtHM, fmtHMS, fmtInt } from './format';
import { EVENT_NAME, SITE_LABEL, SITES, pageName } from './labels';
import { BlockError, ForbiddenState } from './states';
import { useAnalyticsFilters } from './use-analytics-filters';

function Updated({ at, failed }: { at: string; failed: boolean }) {
  if (failed) {
    return (
      <span className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-warning">
        <AlertTriangle className="size-3.5" aria-hidden /> Yangilab bo&apos;lmadi · oxirgi ma&apos;lumot {fmtHMS(at)}
      </span>
    );
  }
  return <span>Yangilandi: {fmtHMS(at)}</span>;
}

function BigCounter({ title, value, sub, at, failed }: { title: string; value: number; sub: string; at: string; failed: boolean }) {
  return (
    <NmCard className="flex flex-col gap-2 p-5">
      <span className="text-[11px] font-bold uppercase tracking-[0.7px] text-muted">{title}</span>
      <span className="text-[48px] font-extrabold leading-none tracking-[-1.5px] tabular-nums text-foreground">{fmtInt(value)}</span>
      <span className="flex flex-wrap items-center gap-x-1.5 text-[12.5px] font-medium text-muted">
        <span>{sub}</span><span aria-hidden>·</span><Updated at={at} failed={failed} />
      </span>
      {value === 0 ? <span className="text-[13px] font-medium text-muted">Hozir saytda hech kim yo&apos;q</span> : null}
    </NmCard>
  );
}

const rowsOf = (rows: LiveRow[], name: (r: LiveRow) => string) => rows.map((r) => ({ key: r.key, name: name(r), count: r.count }));

/** "Telegram" → "Telegram'dan"; the direct bucket already reads as a phrase. */
const fromSource = (label: string) => (label.startsWith("To'g'ridan") ? label : `${label}'dan`);

function RecentList({ site, rows }: { site: AnalyticsSite; rows: RecentHit[] }) {
  return (
    <ul className="flex flex-col gap-1">
      {rows.map((h, i) => {
        const where = h.kind === 'ev' && h.event ? EVENT_NAME[h.event] ?? h.event : pageName(site, h.path) ?? h.path;
        return (
          <li key={`${h.at}-${i}`} className="flex flex-col gap-0.5 rounded-[12px] px-2 py-2 text-[13px] hover:bg-[rgba(46,107,230,0.05)] sm:flex-row sm:items-center sm:gap-4">
            <span className="flex min-w-0 items-center gap-3">
              <span className="w-[42px] flex-shrink-0 font-semibold tabular-nums text-muted">{fmtHM(h.at)}</span>
              <span className="min-w-0 truncate font-semibold text-foreground" title={h.path}>{where}</span>
            </span>
            <span className="min-w-0 truncate pl-[54px] text-[12.5px] font-medium text-muted sm:ml-auto sm:pl-0">
              {[h.deviceLabel, h.browserLabel, h.countryLabel, fromSource(h.sourceLabel)].join(' · ')}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

const Empty = () => <p className="text-[13px] font-medium text-muted">Kimdir kirganda shu yerda ko&apos;rinadi.</p>;

function LiveWebView({ d, failed }: { d: LiveWeb; failed: boolean }) {
  return (
    <div className="flex flex-col gap-4">
      <BigCounter title="Hozir saytda" value={d.liveNow} sub="oxirgi 5 daqiqada" at={d.updatedAt} failed={failed} />
      {d.liveNow === 0 ? <Empty /> : (
        <div className="grid gap-4 lg:grid-cols-3">
          <Section title="Qaysi sahifada"><CountList rows={rowsOf(d.pages, (r) => r.label ?? pageName(d.site, r.key) ?? r.key)} /></Section>
          <Section title="Qayerdan kelishgan"><CountList rows={rowsOf(d.sources, (r) => r.label ?? r.key)} /></Section>
          <Section title="Qaysi mamlakatdan"><CountList rows={rowsOf(d.countries, (r) => r.label ?? r.key)} /></Section>
        </div>
      )}
      {d.recent.length ? <Section title="So'nggi harakatlar"><RecentList site={d.site} rows={d.recent} /></Section> : null}
    </div>
  );
}

function LiveErpView({ d, failed }: { d: LiveErp; failed: boolean }) {
  return (
    <div className="flex flex-col gap-4">
      <BigCounter title="Hozir ERP'da" value={d.liveNow} sub={`${fmtInt(d.centersCount)} ta markazdan · oxirgi 5 daqiqada`} at={d.updatedAt} failed={failed} />
      {d.liveNow === 0 ? <Empty /> : (
        <div className="grid gap-4 lg:grid-cols-2">
          <Section title="Qaysi modulda"><CountList rows={rowsOf(d.modules, (r) => r.label ?? r.key)} /></Section>
          <Section title="Qaysi markazlar faol"><CountList rows={d.centers.map((c) => ({ key: c.tenantId, name: c.name, count: c.users }))} /></Section>
        </div>
      )}
    </div>
  );
}

function LiveAllView({ d, failed }: { d: LiveAll; failed: boolean }) {
  const { setSite } = useAnalyticsFilters();
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {SITES.map((s) => {
        const row = d.sites.find((x) => x.site === s);
        if (!row || row.forbidden) return <div key={s} className="flex flex-col gap-3"><h2 className="text-[15px] font-extrabold">{SITE_LABEL[s]}</h2><ForbiddenState compact /></div>;
        return (
          <NmCard key={s} className="flex flex-col gap-2 p-5">
            <h2 className="text-[15px] font-extrabold text-foreground">{SITE_LABEL[s]}</h2>
            <span className="text-[48px] font-extrabold leading-none tracking-[-1.5px] tabular-nums text-foreground">{row.liveNow === null ? '—' : fmtInt(row.liveNow)}</span>
            <span className="text-[12.5px] font-medium text-muted">oxirgi 5 daqiqada</span>
            <div>
              <NmButton variant="ghost" size="sm" className="h-auto px-0 py-1" onClick={() => setSite(s)}>Batafsil <ArrowRight className="size-3.5" aria-hidden /></NmButton>
            </div>
          </NmCard>
        );
      })}
      <p className="text-[12.5px] font-medium text-muted lg:col-span-3"><Updated at={d.updatedAt} failed={failed} /></p>
    </div>
  );
}

export function LiveTab() {
  const { site } = useAnalyticsFilters();
  const q = useAnalyticsLive(site);
  if (q.isLoading) return <Skeleton className="h-[160px] w-full" />;
  if (!q.data) return <BlockError error={q.error} onRetry={() => q.refetch()} />;
  const d = q.data;
  const failed = q.isError || q.isRefetchError;
  if (d.site !== site) return <Skeleton className="h-[160px] w-full" />;
  if (d.site === 'all') return <LiveAllView d={d} failed={failed} />;
  if (d.site === 'erp') return <LiveErpView d={d} failed={failed} />;
  return <LiveWebView d={d} failed={failed} />;
}
