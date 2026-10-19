'use client';
/** Layout of every analytics tab (§2): heading, site + period, tracker chips, tabs, page, muted footer. */
import { ShieldOff } from 'lucide-react';
import { EmptyState } from '@/components/shared/empty-state';
import { useAuth } from '@/providers/auth-provider';
import type { SessionUser } from '@/lib/auth/types';
import { useAnalyticsMeta, useAnalyticsStatus } from '@/lib/hooks/use-owner-analytics';
import { AnalyticsFooter } from './analytics-footer';
import { AnalyticsTabs } from './analytics-tabs';
import { PeriodPicker, SiteSwitch } from './filters-bar';
import { ForbiddenState } from './states';
import { TrackerStatusBar } from './tracker-status-bar';
import { useAnalyticsFilters } from './use-analytics-filters';

/** Backend: platform permission `analytics.read` (OWNER has all). */
export const canReadAnalytics = (u: SessionUser | null | undefined) => !!u?.isPlatform && (!!u.isOwner || (u.permissions ?? []).includes('analytics.read'));
/** Backend mock fallback: OWNER, `mock.insights` or `mock.manage` (contract §2.0). */
export const canSeeMockAnalytics = (u: SessionUser | null | undefined) =>
  !!u?.isPlatform && (!!u.isOwner || (u.permissions ?? []).some((p) => p === 'mock.manage' || p === 'mock.insights'));

export function AnalyticsShell({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const allowed = canReadAnalytics(user);
  const { site, from, to, tab } = useAnalyticsFilters();
  const status = useAnalyticsStatus(site);
  const meta = useAnalyticsMeta(site, { from, to }, allowed);
  const mockBlocked = site === 'mock' && !canSeeMockAnalytics(user);
  const liveNow = (status.data?.sites ?? []).some((s) => (s.liveNow ?? 0) > 0);

  return (
    <section className="flex flex-col gap-5">
      <div>
        <h1 className="text-[24px] font-extrabold tracking-[-0.4px] text-foreground">Analitika</h1>
        <p className="text-[14px] text-muted">Saytlarga kim, qayerdan va nima uchun keladi</p>
      </div>
      {!allowed ? (
        <EmptyState icon={<ShieldOff className="size-6" />} title="Ruxsat yo'q" hint="Bu bo'lim uchun analytics.read huquqi kerak." />
      ) : (
        <>
          <div className="flex flex-col gap-3 xl:flex-row xl:flex-wrap xl:items-end xl:gap-4">
            <div className="xl:pb-[22px]"><SiteSwitch /></div>
            <PeriodPicker disabled={tab === 'live'} />
          </div>
          {mockBlocked ? null : <TrackerStatusBar query={status} count={site === 'all' ? 3 : 1} />}
          <AnalyticsTabs liveNow={liveNow} />
          {mockBlocked ? <ForbiddenState /> : children}
          <AnalyticsFooter meta={meta.data} status={status.data} />
        </>
      )}
    </section>
  );
}
