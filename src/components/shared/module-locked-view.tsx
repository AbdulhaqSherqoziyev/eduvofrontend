'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Package } from 'lucide-react';
import { NmCard } from '@/components/ui/nm-card';
import { NmButton } from '@/components/ui/nm-button';
import { Skeleton } from './skeleton';
import { ModuleToggleDialog } from './module-toggle-dialog';
import { useModulesOverview } from '@/lib/hooks/use-modules';
import { formatNumber } from '@/lib/utils/format';
import type { TenantModule } from '@/lib/types/module';

/**
 * First clause of a benefit — the copy up to the first ";". The catalogue text
 * is written as "<what it does>; <second effect>", and only the first half fits
 * a sentence that already carries a name and a price.
 */
function firstClause(benefit: string): string {
  const cut = benefit.indexOf(';');
  return (cut === -1 ? benefit : benefit.slice(0, cut)).trim().replace(/\.$/, '');
}

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <NmCard className="mx-auto flex w-full max-w-[560px] flex-col items-center gap-3.5 px-6 py-12 text-center">
      {/* Package, never a padlock: this is something not bought yet, not
          something forbidden (§B.6 / §B.9.4). */}
      <div className="flex size-14 items-center justify-center rounded-[16px] bg-background text-muted shadow-nm-inset-sm">
        <Package className="size-6" />
      </div>
      <h2 className="text-[18px] font-extrabold text-foreground">Bu bo&apos;lim hali yoqilmagan</h2>
      {children}
    </NmCard>
  );
}

/**
 * What a user sees when they reach a screen whose module is off — via a
 * bookmark, an old tab or a shared link, since the nav item itself is gone.
 *
 * Two versions, by role. The director gets the name, the benefit, the price and
 * a way to switch it on without leaving the page. Staff get one sentence and a
 * way home: they cannot buy anything, and showing them the center's prices
 * would leak the finances the whole permission model keeps from them.
 */
export function ModuleLockedView({ moduleKey }: { moduleKey: string }) {
  const router = useRouter();
  const query = useModulesOverview();
  const [dialogOpen, setDialogOpen] = useState(false);

  if (query.isLoading) {
    return (
      <Frame>
        <Skeleton className="h-4 w-[80%]" />
        <Skeleton className="h-4 w-[60%]" />
      </Frame>
    );
  }

  const data = query.data;
  const module: TenantModule | undefined = data?.modules.find((m) => m.key === moduleKey);
  // No overview (it failed) or no row for this key -> fall back to the staff
  // copy. It is never wrong, and it invents neither a price nor a promise.
  const asDirector = !!data?.canManage && !!module;

  if (!asDirector) {
    return (
      <Frame>
        <p className="max-w-sm text-[13.5px] font-medium leading-[1.55] text-[#5b6b82]">
          Yoqish markaz rahbari orqali amalga oshiriladi.
        </p>
        <NmButton variant="soft" className="mt-1" onClick={() => router.push('/dashboard')}>
          Bosh sahifaga
        </NmButton>
      </Frame>
    );
  }

  const showPrice = !!data?.showPrices && module.monthlyFee > 0;

  return (
    <>
      <Frame>
        <p className="max-w-md text-[13.5px] font-medium leading-[1.6] text-[#5b6b82]">
          «{module.nameUz}» tarifingizda yoqilmagan. Yoqsangiz — {firstClause(module.benefitUz)}.
          {showPrice ? ` Oyiga ${formatNumber(module.monthlyFee)} so'm.` : ''}
        </p>
        <div className="mt-1 flex w-full max-w-[280px] flex-col items-center gap-1.5">
          <NmButton className="w-full" onClick={() => setDialogOpen(true)}>
            Modulni yoqish
          </NmButton>
          <NmButton variant="ghost" size="sm" onClick={() => router.back()}>
            Orqaga qaytish
          </NmButton>
        </div>
      </Frame>
      <ModuleToggleDialog
        module={module}
        enable
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        // useToggleModule() invalidates every query, so the screen behind this
        // dialog refetches and opens on its own.
        onDone={() => undefined}
      />
    </>
  );
}
