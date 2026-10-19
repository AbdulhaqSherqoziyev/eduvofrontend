'use client';
/** Shared loading / error / empty / "not tracking" / 90-day blocks (spec §3). */
import { ExternalLink, Info, Radar, ShieldOff } from 'lucide-react';
import { EmptyState } from '@/components/shared/empty-state';
import { ErrorCard } from '@/components/shared/error-card';
import { NmButton } from '@/components/ui/nm-button';
import type { AnalyticsSite, NullReason, PeriodInfo } from '@/lib/api/owner-analytics.types';
import { cn } from '@/lib/utils/cn';
import { fmtDayUz, nullTitle } from './format';
import { NOT_TRACKING_TITLE, SITE_URL, notTrackingHint } from './labels';
import { useAnalyticsFilters } from './use-analytics-filters';

type ApiErr = { response?: { status?: number; data?: { error?: string } } };
export type ErrKind = 'forbidden' | 'range' | 'range_long' | 'other';

export function errKind(e: unknown): ErrKind {
  const r = (e as ApiErr)?.response;
  const code = r?.data?.error;
  if (r?.status === 403 && code === 'MOCK_FORBIDDEN') return 'forbidden';
  if (code === 'RANGE_TOO_LONG') return 'range_long';
  if (r?.status === 400 && (code === 'BAD_RANGE' || code === 'FUTURE_DATE' || code === 'BAD_QUERY')) return 'range';
  return 'other';
}

export function ForbiddenState({ compact }: { compact?: boolean }) {
  return (
    <div className={compact ? '[&>div]:py-8' : ''} title="mock.manage">
      <EmptyState icon={<ShieldOff className="size-6" />} title="Ruxsat yo'q" hint="Bu bo'limni ko'rishga ruxsatingiz yo'q. Egasidan «Mock» ruxsatini so'rang." />
    </div>
  );
}

/** Error of one block: forbidden / bad range / generic retry card (spec §3.2). */
export function BlockError({ error, onRetry, compact }: { error: unknown; onRetry: () => void; compact?: boolean }) {
  const k = errKind(error);
  if (k === 'forbidden') return <ForbiddenState compact={compact} />;
  if (k === 'range' || k === 'range_long') {
    return <p className="text-[12px] font-semibold text-danger">{k === 'range_long' ? 'Davr 366 kundan oshmasin' : "Sanalar oralig'i noto'g'ri"}</p>;
  }
  return <div className={compact ? '[&>div]:py-8' : ''}><ErrorCard message="Analitikani yuklab bo'lmadi." onRetry={onRetry} /></div>;
}

export function NotTrackingState({ site, compact }: { site: AnalyticsSite; compact?: boolean }) {
  return (
    <div className={compact ? '[&>div]:py-8' : ''}>
      <EmptyState icon={<Radar className="size-6" />} title={NOT_TRACKING_TITLE[site]} hint={notTrackingHint(site)}
        action={(
          <NmButton asChild variant="soft" size="sm">
            <a href={SITE_URL[site]} target="_blank" rel="noopener noreferrer">Saytni ochib tekshirish <ExternalLink className="size-3.5" /></a>
          </NmButton>
        )} />
    </div>
  );
}

/** "—" with the reason as a tooltip (spec §3.3). */
export function Dash({ reason }: { reason?: NullReason | null }) {
  return <span className="text-muted" title={nullTitle(reason ?? 'no_data')}>—</span>;
}

/** Ghost "30 kunni ko'rish" — only offered when the period is shorter than 30 days. */
function Show30({ period }: { period?: PeriodInfo | null }) {
  const { setRange } = useAnalyticsFilters();
  if (period && period.days >= 30 && !period.retentionLimited) return null;
  return <NmButton variant="ghost" size="sm" className="h-auto px-0 py-1" onClick={() => setRange('30d')}>30 kunni ko&apos;rish</NmButton>;
}

/** Empty table (tracking on, no rows in the period). */
export function NoRows({ period, text = "Bu davrda ma'lumot yo'q." }: { period?: PeriodInfo | null; text?: string }) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2">
      <p className="text-[13px] font-medium text-muted">{text}</p>
      <Show30 period={period} />
    </div>
  );
}

/** Whole block unavailable because the period reaches past the 90-day raw retention. */
export function RetentionNote() {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2">
      <p className="text-[13px] font-medium text-muted">90 kundan eski davr uchun bu ma&apos;lumot saqlanmaydi. Davrni oxirgi 90 kun ichida tanlang.</p>
      <Show30 period={null} />
    </div>
  );
}

/** Tracking started after the whole selected period (spec §3.3, row 2). */
export function BeforeTrackingNote({ since }: { since: string }) {
  return <p className="text-[12.5px] font-medium text-muted">Kuzatuv {fmtDayUz(since)}dan. Tanlangan davrda tashrif ma&apos;lumoti yo&apos;q.</p>;
}

export function InfoNote({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={cn('flex items-start gap-1.5 text-[12px] font-medium leading-[1.5] text-muted', className)}>
      <Info className="mt-[2px] size-[14px] flex-shrink-0" aria-hidden />
      <span>{children}</span>
    </p>
  );
}

/** Tracking window of a period: none (null since), before (period wholly before), partial, full. */
export function trackingState(since: string | null, period: { from: string; to: string }): 'none' | 'before' | 'partial' | 'full' {
  if (!since) return 'none';
  if (since > period.to) return 'before';
  if (since > period.from) return 'partial';
  return 'full';
}

/** "Kuzatuv 20-oktabrdan" footer line (partial period, instead of the delta). */
export const sinceText = (since: string) => `Kuzatuv ${fmtDayUz(since)}dan`;

/** Old numbers fade while a new filter loads (spec §3.1). */
export const fading = (isFetching: boolean, isPlaceholder: boolean) => cn('transition-opacity', isFetching && isPlaceholder ? 'opacity-60' : '');
