'use client';
/**
 * Tab "Yozuvlar" (spec §12). Phase 1: Clarity is not connected (clarityUrl === null) → "Ulanmagan".
 * ERP recording is permanently off (privacy). Never an iframe — Clarity opens in a new window.
 */
import { CheckCircle2, Clock, ExternalLink, Lock, Video } from 'lucide-react';
import { Skeleton } from '@/components/shared/skeleton';
import { StatusPill } from '@/components/shared/status-pill';
import { NmButton } from '@/components/ui/nm-button';
import { NmCard } from '@/components/ui/nm-card';
import type { AnalyticsSite } from '@/lib/api/owner-analytics.types';
import { useAnalyticsStatus } from '@/lib/hooks/use-owner-analytics';
import { cn } from '@/lib/utils/cn';
import { SITE_LABEL, SITES } from './labels';
import { useAnalyticsFilters } from './use-analytics-filters';

const EU = 'Yevropa tashrifchilari rozilik bermasa yozilmaydi.';

function RecordingsCard({ site, clarityUrl }: { site: AnalyticsSite; clarityUrl: string | null }) {
  const head = (icon: React.ReactNode, pill: React.ReactNode) => (
    <div className="flex items-center justify-between gap-3">
      <span className="inline-flex items-center gap-2.5">
        <span className="flex size-9 items-center justify-center rounded-[11px] bg-background text-primary shadow-nm-sm">{icon}</span>
        <span className="text-[15px] font-extrabold text-foreground">{SITE_LABEL[site]}</span>
      </span>
      {pill}
    </div>
  );

  if (site === 'erp') {
    return (
      <NmCard className="flex flex-col gap-3 p-5">
        {head(<Lock className="size-[18px]" aria-hidden />, <StatusPill tone="muted" icon={<Lock className="size-3.5" aria-hidden />} label="O'chirilgan" />)}
        <p className="text-[13px] font-medium text-foreground">ERP&apos;da ekran yozuvi o&apos;chirilgan (maxfiylik).</p>
        <p className="text-[12.5px] font-medium text-muted">Markazlar ichidagi ma&apos;lumotlar yozib olinmaydi.</p>
      </NmCard>
    );
  }

  if (clarityUrl) {
    return (
      <NmCard className="flex flex-col gap-3 p-5">
        {head(<Video className="size-[18px]" aria-hidden />, <StatusPill tone="success" icon={<CheckCircle2 className="size-3.5" aria-hidden />} label="Ulangan" />)}
        <p className="text-[13px] font-medium text-foreground">Ekran yozuvlari va bosishlar xaritasi Microsoft Clarity orqali ko&apos;rsatiladi.</p>
        <div>
          <NmButton asChild variant="soft" size="sm">
            <a href={clarityUrl} target="_blank" rel="noopener noreferrer">Clarity&apos;da ochish <ExternalLink className="size-[14px]" aria-hidden /></a>
          </NmButton>
        </div>
        <p className="text-[12.5px] font-medium text-muted">Yangi oynada ochiladi. Clarity&apos;ga Microsoft hisobi bilan kiriladi.</p>
        <p className="text-[12.5px] font-medium text-muted">{EU}</p>
      </NmCard>
    );
  }

  return (
    <NmCard className="flex flex-col gap-3 p-5">
      {head(<Video className="size-[18px]" aria-hidden />, <StatusPill tone="muted" icon={<Clock className="size-3.5" aria-hidden />} label="Ulanmagan" />)}
      <p className="text-[13px] font-medium text-foreground">Ekran yozuvlari va bosishlar xaritasi Microsoft Clarity orqali ko&apos;rsatiladi. Tez orada ulanadi.</p>
      <p className="text-[12.5px] font-medium text-muted">{EU}</p>
      <div>
        <NmButton variant="soft" size="sm" disabled title="Hali ulanmagan">Clarity&apos;da ochish <ExternalLink className="size-[14px]" aria-hidden /></NmButton>
      </div>
    </NmCard>
  );
}

export function RecordingsTab() {
  const { site } = useAnalyticsFilters();
  const status = useAnalyticsStatus(site);
  const sites = site === 'all' ? SITES : [site];
  if (status.isLoading) return <div className={cn('grid gap-4', site === 'all' ? 'lg:grid-cols-3' : '')}>{sites.map((s) => <Skeleton key={s} className="h-[200px] w-full" />)}</div>;
  // status failing must not hide the cards — phase 1 has no Clarity link anyway
  const url = (s: AnalyticsSite) => status.data?.sites.find((x) => x.site === s)?.clarityUrl ?? null;
  return (
    <div className={cn('grid gap-4', site === 'all' ? 'lg:grid-cols-3' : '')}>
      {sites.map((s) => <RecordingsCard key={s} site={s} clarityUrl={url(s)} />)}
    </div>
  );
}
