'use client';

import { useState } from 'react';
import Link from 'next/link';
import { WifiOff } from 'lucide-react';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { EmptyState } from '@/components/shared/empty-state';
import { ErrorCard } from '@/components/shared/error-card';
import { CardGridSkeleton, RowsSkeleton } from '@/components/shared/skeleton';
import { NmButton } from '@/components/ui/nm-button';
import { PeriodSwitch } from '@/components/payroll/period-switch';
import { can } from '@/lib/auth/permissions';
import {
  useApprovePeriod, useComputePeriod, usePayrollPeriod, useReopenPeriod,
} from '@/lib/hooks/use-payroll';
import { useOnline } from '@/lib/hooks/use-online';
import { apiErrorMessage } from '@/lib/utils/api-error';
import { currentPeriod, monthName, somOrDash } from '@/lib/utils/payroll-labels';
import type { PeriodLineView } from '@/lib/types/payroll';
import { LineDetailDialog } from './line-detail-dialog';
import { MissingRulesStrip } from './missing-rules-strip';
import { PayDialog } from './pay-dialog';
import { PayrollSummary } from './payroll-summary';
import { PayrollTable } from './payroll-table';
import { PeriodHeader } from './period-header';

/** `/payroll` — direktor bu yerda tasdiqlaydi va to'laydi, ya'ni bu ish
 *  ekrani, hisobot emas (§0.1). Shuning uchun `/reports` tabi emas. */
export function PayrollView() {
  const [period, setPeriod] = useState(currentPeriod());
  const [detail, setDetail] = useState<PeriodLineView | null>(null);
  const [approveOpen, setApproveOpen] = useState(false);
  const [reopenOpen, setReopenOpen] = useState(false);
  const [payOnly, setPayOnly] = useState<string | undefined>();
  const [payOpen, setPayOpen] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const online = useOnline();
  const query = usePayrollPeriod(period);
  const compute = useComputePeriod(period);
  const approve = useApprovePeriod(period);
  const reopen = useReopenPeriod(period);
  const view = query.data;

  if (!can('payroll.read')) return null;

  const computed = !!view?.computedAt && view.lines.length > 0;
  const hasPaid = !!view?.lines.some((l) => l.paid);
  const busy = compute.isPending ? 'compute' : approve.isPending ? 'approve' : null;
  const canPay = can('payroll.pay') && !!view?.id;

  const guard = async (run: () => Promise<unknown>, close?: () => void) => {
    setActionError(null);
    try {
      await run();
      close?.();
    } catch (e) {
      setActionError(apiErrorMessage(e, "Amal bajarilmadi — qayta urinib ko'ring."));
    }
  };

  const openPay = (only?: string) => {
    setPayOnly(only);
    setDetail(null);
    setPayOpen(true);
  };

  return (
    <section className="flex flex-col gap-5">
      {!online ? (
        <div className="sticky top-0 z-20 flex items-center gap-2 rounded-ctl bg-background px-4 py-2.5 text-[12px] font-semibold text-foreground shadow-nm-inset-sm">
          <WifiOff className="size-3.5 text-muted" />
          Internet yo&apos;q — hisob yangilanmadi va tasdiqlab bo&apos;lmaydi.
        </div>
      ) : null}

      <PeriodSwitch period={period} onChange={setPeriod} />

      {query.isLoading ? (
        <div className="flex flex-col gap-5">
          <CardGridSkeleton count={4} className="grid-cols-2 md:grid-cols-4" />
          <RowsSkeleton rows={6} />
        </div>
      ) : query.isError || !view ? (
        <ErrorCard onRetry={() => query.refetch()} />
      ) : (
        <>
          <PeriodHeader
            view={view}
            computed={computed}
            busy={busy}
            online={online}
            onCompute={() => guard(() => compute.mutateAsync())}
            onApprove={() => setApproveOpen(true)}
            onReopen={() => setReopenOpen(true)}
            onPay={() => openPay(undefined)}
          />

          <MissingRulesStrip items={view.missingRules} />
          {actionError ? <p className="text-[12px] font-semibold text-danger">{actionError}</p> : null}

          {!computed ? (
            view.missingRules.length && !view.lines.length && view.computedAt ? (
              <EmptyState
                title="Hali bironta xodimga ish haqi qoidasi sozlanmagan"
                hint="O'qituvchi yoki xodim kartasini ochib «Ish haqi» blokini to'ldiring."
                action={
                  <Link href="/teachers">
                    <NmButton variant="soft">O&apos;qituvchilarga o&apos;tish</NmButton>
                  </Link>
                }
              />
            ) : (
              <EmptyState
                title="Bu davr hali hisoblanmagan"
                hint="Hisoblash tugmasini bosing — tizim tushgan to'lovlar asosida summalarni chiqaradi."
              />
            )
          ) : (
            <>
              <PayrollSummary totals={view.totals} />
              {!view.totals.share ? (
                <p className="px-1 text-[12px] font-medium text-muted">
                  Bu davrda hali to&apos;lov tushmagan — hisob oy davomida to&apos;ldiriladi.
                </p>
              ) : null}
              <PayrollTable lines={view.lines} busy={!!busy} onOpen={setDetail} />
            </>
          )}
        </>
      )}

      {detail && view ? (
        <LineDetailDialog
          line={detail}
          period={period}
          status={view.status}
          canPay={canPay}
          onOpenChange={(next) => !next && setDetail(null)}
          onPayOne={(line) => openPay(line.id)}
        />
      ) : null}

      {payOpen && view?.id ? (
        <PayDialog
          periodId={view.id}
          lines={view.lines}
          only={payOnly}
          onOpenChange={(next) => !next && setPayOpen(false)}
          onDone={() => setPayOpen(false)}
        />
      ) : null}

      <ConfirmDialog
        open={approveOpen}
        onOpenChange={setApproveOpen}
        title={`${monthName(period)} hisobini tasdiqlash`}
        message={`${view?.lines.length ?? 0} xodim · jami ${somOrDash(view?.totals.total)}. Tasdiqlangach summalar muzlatiladi. Keyin tushgan to'lovlar keyingi oyga alohida qator bo'lib o'tadi.`}
        confirmLabel="Tasdiqlash"
        tone="soft"
        pending={approve.isPending}
        error={actionError ?? undefined}
        onConfirm={() => guard(() => approve.mutateAsync(), () => setApproveOpen(false))}
      />

      {/*
        Ikkinchi jumla MAJBURIY: amalning haqiqiy narxi texnik emas, ijtimoiy —
        xodim tasdiqlangan raqamni allaqachon ko'rgan bo'lishi mumkin (§E.7).
      */}
      <ConfirmDialog
        open={reopenOpen}
        onOpenChange={setReopenOpen}
        title="Tasdiqni bekor qilish"
        message="Summalar qayta hisoblanadi va o'zgarishi mumkin. Xodimlar tasdiqlangan raqamni allaqachon ko'rgan bo'lishi mumkin."
        confirmLabel="Tasdiqni bekor qilish"
        pending={reopen.isPending || hasPaid}
        error={
          hasPaid ? "Bu davrda to'lov yozilgan — tasdiqni bekor qilib bo'lmaydi." : actionError ?? undefined
        }
        onConfirm={() => guard(() => reopen.mutateAsync(), () => setReopenOpen(false))}
      />
    </section>
  );
}
