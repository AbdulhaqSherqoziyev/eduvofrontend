'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Info, Package } from 'lucide-react';
import { QueryBoundary } from '@/components/shared/query-boundary';
import { EmptyState } from '@/components/shared/empty-state';
import { ErrorCard } from '@/components/shared/error-card';
import { CardGridSkeleton, Skeleton } from '@/components/shared/skeleton';
import { ModuleToggleDialog } from '@/components/shared/module-toggle-dialog';
import { NmButton } from '@/components/ui/nm-button';
import { trialJustEnded, useModulesOverview } from '@/lib/hooks/use-modules';
import { formatNumber } from '@/lib/utils/format';
import type { ModulesOverview, ModulesPatchResult, TenantModule } from '@/lib/types/module';
import { GrandfatherView } from './grandfather-view';
import { ModuleCard } from './module-card';
import { PlanCard } from './plan-card';

const GRID = 'grid gap-4 grid-cols-[repeat(auto-fill,minmax(280px,1fr))]';

/** Counts appear only where they read as an achievement, never as a shortfall. */
function SectionHead({ label, count }: { label: string; count?: number }) {
  return (
    <div className="px-1 text-[11px] font-bold uppercase tracking-[0.9px] text-muted">
      {label}
      {count === undefined ? '' : ` · ${count} ta`}
    </div>
  );
}

/** Staff who reach /modules by link or bookmark — no list, and no figures. */
function ManagerOnlyView() {
  const router = useRouter();
  return (
    <EmptyState
      icon={<Package className="size-6" />}
      title="Tarif va modullar"
      hint="Bu bo'lim markaz rahbari uchun."
      action={
        <NmButton variant="soft" onClick={() => router.push('/dashboard')}>
          Bosh sahifaga
        </NmButton>
      }
    />
  );
}

function ModulesSkeleton() {
  return (
    <div className="flex flex-col gap-5">
      <Skeleton className="h-[92px] w-full" />
      <CardGridSkeleton count={3} className={GRID} />
    </div>
  );
}

/**
 * The manage view: plan card, then modules grouped by why they are open.
 *
 * Order is fixed — what you HAVE comes before what you could buy. Leading with
 * "Yoqish mumkin" turns a subscription page into a shop and makes a paying
 * customer feel short-changed (§B.2.1).
 */
function ManageView({ data }: { data: ModulesOverview }) {
  const [dialog, setDialog] = useState<{ module: TenantModule; enable: boolean } | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [highlight, setHighlight] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => () => clearTimeout(timer.current), []);

  const flash = useCallback((message: string, key: string) => {
    setNotice(message);
    setHighlight(key);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setNotice(null);
      setHighlight(null);
    }, 4000);
  }, []);

  const onDone = (result: ModulesPatchResult) => {
    if (!dialog) return;
    const { module, enable } = dialog;
    flash(
      enable
        ? `Yoqildi. Oylik to'lovingiz endi ${formatNumber(result.newMonthlyFee)} so'm.`
        : `O'chirildi. Oylik to'lovingiz endi ${formatNumber(result.newMonthlyFee)} so'm.`,
      module.key,
    );
  };

  const enabled = data.modules.filter((m) => m.enabled && m.source !== 'trial');
  const trial = data.modules.filter((m) => m.source === 'trial');
  // A retired module that is off can never be switched back on — listing it as
  // "available" would be an offer the backend refuses.
  const available = data.modules.filter((m) => !m.enabled && !m.retired);

  const cards = (list: TenantModule[]) => (
    <div className={GRID}>
      {list.map((m) => (
        <ModuleCard
          key={m.key}
          module={m}
          showPrices={data.showPrices}
          trialDaysLeft={data.trial.daysLeft}
          highlight={highlight === m.key}
          onToggle={(module, enable) => setDialog({ module, enable })}
        />
      ))}
    </div>
  );

  return (
    <>
      {trialJustEnded(data) ? (
        <div className="flex items-start gap-3 rounded-ctl px-4 py-3.5 shadow-nm-inset-sm">
          <Info className="mt-px size-[18px] shrink-0 text-primary" />
          <p className="text-[13px] font-semibold leading-[1.5] text-[#5b6b82]">
            Sinov davri tugadi. Sinovda ochiq bo&apos;lgan bo&apos;limlar yopildi — ma&apos;lumot
            saqlanadi, istalgan vaqtda yoqasiz.
          </p>
        </div>
      ) : null}

      <PlanCard data={data} />

      {/* One confirmation slot for the whole page: the card that changed jumps
          to another section, so telling the user next to its old position would
          point at nothing (§B.7.3). */}
      <div aria-live="polite" className="min-h-0">
        {notice ? (
          <p className="animate-fadein px-1 text-[13px] font-bold text-success">{notice}</p>
        ) : null}
      </div>

      {enabled.length > 0 ? (
        <>
          <SectionHead label="YOQILGAN" count={enabled.length} />
          {cards(enabled)}
        </>
      ) : (
        <ErrorCard message="Bo'limlar yuklanmadi" onRetry={() => window.location.reload()} />
      )}

      {data.trial.active && trial.length > 0 ? (
        <>
          <SectionHead label="SINOVDA OCHIQ" count={trial.length} />
          {cards(trial)}
        </>
      ) : null}

      {available.length > 0 ? (
        <>
          <SectionHead label="YOQISH MUMKIN" />
          {cards(available)}
        </>
      ) : data.trial.active ? null : ( // during a trial everything is open; saying
        // "Barcha bo'limlar yoqilgan" would be a promise broken on day 15 (R3)
        <>
          <SectionHead label="YOQISH MUMKIN" />
          <EmptyState
            title="Barcha bo'limlar yoqilgan"
            hint="Tarifingizda mavjud hamma narsa ishlayapti."
          />
        </>
      )}

      {dialog ? (
        <ModuleToggleDialog
          module={dialog.module}
          enable={dialog.enable}
          open
          onOpenChange={(open) => {
            if (!open) setDialog(null);
          }}
          onDone={onDone}
        />
      ) : null}
    </>
  );
}

/** "Tarif va modullar" — what this center bought and what it can add. */
export function ModulesView() {
  const query = useModulesOverview();
  return (
    <section className="flex flex-col gap-5">
      <QueryBoundary query={query} loading={<ModulesSkeleton />}>
        {/* Order matters. `canView` is checked FIRST so staff who arrive by
            bookmark see the same dead end the nav implies — including in a
            grandfathered center, where they would otherwise get the section
            list. Only then does grandfathered pick the read-only screen: its
            director has canView but never canManage (§B.2.2, §B.4). */}
        {(data) =>
          !data.canView ? (
            <ManagerOnlyView />
          ) : data.grandfathered ? (
            <GrandfatherView modules={data.modules} />
          ) : !data.canManage ? (
            <ManagerOnlyView />
          ) : (
            <ManageView data={data} />
          )
        }
      </QueryBoundary>
    </section>
  );
}
