'use client';

import { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { NmDialog } from '@/components/ui/nm-dialog';
import { NmButton } from '@/components/ui/nm-button';
import { NmCard } from '@/components/ui/nm-card';
import { Skeleton } from './skeleton';
import { usePreviewModule, useToggleModule } from '@/lib/hooks/use-modules';
import { formatNumber } from '@/lib/utils/format';
import { apiErrorMessage } from '@/lib/utils/api-error';
import type { ModulesPatchResult, TenantModule } from '@/lib/types/module';

interface ModuleToggleDialogProps {
  module: TenantModule;
  /** true = the enable flow, false = the disable flow. */
  enable: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Fired after a successful PATCH, with the fresh overview + fee change. */
  onDone?: (result: ModulesPatchResult) => void;
}

/**
 * The one confirm dialog for switching a module on or off (spec §B.7).
 *
 * The rule that shapes it: no number, no action. The price comes from
 * POST /modules/preview, and while that answer is missing — loading OR failed —
 * the confirm button stays disabled. There is deliberately no "roughly +90 000"
 * fallback text: a money screen that guesses is worse than one that waits.
 */
export function ModuleToggleDialog({
  module,
  enable,
  open,
  onOpenChange,
  onDone,
}: ModuleToggleDialogProps) {
  const preview = usePreviewModule({ key: module.key, enabled: enable }, open);
  const toggle = useToggleModule();
  const [submitError, setSubmitError] = useState<string | null>(null);

  // A reopened dialog must not inherit the previous attempt's failure.
  useEffect(() => {
    if (open) setSubmitError(null);
  }, [open]);

  const priceReady = preview.isSuccess && preview.data !== undefined;
  const busy = toggle.isPending;

  const submit = async () => {
    setSubmitError(null);
    try {
      const result = await toggle.mutateAsync({ key: module.key, enabled: enable });
      onOpenChange(false);
      onDone?.(result);
    } catch (error) {
      // The backend answers 400/403 with a precise Uzbek reason ("tarifingizga
      // kiritilmagan", "asosiy modul"…). Show it — it tells the director what
      // to do next. The spec sentence stays as the fallback for network noise.
      setSubmitError(apiErrorMessage(error, "Amalni bajarib bo'lmadi. Qayta urinib ko'ring."));
    }
  };

  return (
    <NmDialog
      open={open}
      onOpenChange={(next) => {
        if (busy) return; // never yank the dialog out from under a running PATCH
        onOpenChange(next);
      }}
      title={enable ? `«${module.nameUz}» yoqilsinmi?` : `«${module.nameUz}» o'chirilsinmi?`}
    >
      <div className="flex flex-col gap-4">
        {enable ? (
          <p className="text-[13px] font-medium leading-[1.55] text-[#5b6b82]">{module.benefitUz}</p>
        ) : (
          <p className="text-[13.5px] font-semibold leading-[1.55] text-foreground">
            «{module.nameUz}» bo&apos;limi yopiladi. Ma&apos;lumotlar saqlanadi — qayta yoqsangiz
            hammasi joyida turadi.
          </p>
        )}

        {preview.isLoading ? <Skeleton className="h-[56px] w-full" /> : null}

        {preview.isError ? (
          <div className="flex flex-col items-start gap-2.5">
            <p className="text-[13px] font-bold text-warning">
              Narxni hisoblab bo&apos;lmadi. Qayta urinib ko&apos;ring.
            </p>
            <NmButton variant="soft" size="sm" onClick={() => preview.refetch()}>
              Qayta urinish
            </NmButton>
          </div>
        ) : null}

        {priceReady ? (
          <div className="flex flex-col gap-2">
            <NmCard inset className="flex flex-wrap items-center gap-3 p-4">
              <span className="text-[18px] font-extrabold text-muted">
                {formatNumber(preview.data.previousMonthlyFee)}
              </span>
              <ArrowRight className="size-4 shrink-0 text-muted" />
              <span className="text-[20px] font-extrabold text-primary">
                {formatNumber(preview.data.newMonthlyFee)} so&apos;m
              </span>
            </NmCard>
            <p className="text-[12.5px] font-semibold leading-[1.5] text-[#5b6b82]">
              Oylik to&apos;lovingiz {formatNumber(preview.data.previousMonthlyFee)} →{' '}
              {formatNumber(preview.data.newMonthlyFee)} so&apos;m bo&apos;ladi. Keyingi hisobdan
              boshlab.
            </p>
          </div>
        ) : null}

        {submitError ? <p className="text-[13px] font-bold text-danger">{submitError}</p> : null}

        <div className="mt-1 flex gap-3 max-[380px]:flex-col-reverse">
          <NmButton
            variant="soft"
            // Disable is destructive: the safe choice is wider and holds focus.
            className={enable ? 'flex-1' : 'flex-[1.4]'}
            autoFocus={!enable}
            disabled={busy}
            onClick={() => onOpenChange(false)}
          >
            Bekor qilish
          </NmButton>
          <NmButton
            variant={enable ? 'primary' : 'danger'}
            className={enable ? 'flex-[1.4]' : 'flex-1'}
            disabled={!priceReady || busy}
            onClick={submit}
          >
            {busy
              ? enable
                ? 'Yoqilmoqda…'
                : "O'chirilmoqda…"
              : enable
                ? 'Yoqish'
                : "O'chirish"}
          </NmButton>
        </div>
      </div>
    </NmDialog>
  );
}
