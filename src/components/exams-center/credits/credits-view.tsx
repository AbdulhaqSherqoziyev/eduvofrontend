'use client';

import { useState } from 'react';
import { QueryBoundary } from '@/components/shared/query-boundary';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { Skeleton } from '@/components/shared/skeleton';
import { useExamCredits, usePurchaseCredits } from '@/lib/hooks/use-center-exams-v3';
import type { CreditPackage, Credits } from '@/lib/api/center-exams-v3';
import { can } from '@/lib/auth/permissions';
import { formatSom } from '@/lib/utils/format';
import { examErrorText } from '../exam-errors';
import { Card, ConsoleHeader, SoftButton } from '../ui';

/** Kreditlar (design v3 CREDITS): centre balance + prices left, three packages right. */
export function CreditsView() {
  const q = useExamCredits();
  const buy = usePurchaseCredits();
  const [pack, setPack] = useState<CreditPackage | null>(null);
  const [done, setDone] = useState<string | null>(null);
  return (
    <section className="flex flex-col pb-6">
      <ConsoleHeader title="Kreditlar" subtitle="Markaz balansi va paketlar" />
      <QueryBoundary
        query={q}
        loading={<div className="grid gap-[22px] lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]"><Skeleton className="h-[260px]" /><Skeleton className="h-[260px]" /></div>}
      >
        {(d) => (
          <div className="grid items-start gap-[22px] lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
            <BalanceCard d={d} />
            <div className="flex min-w-0 flex-col gap-3">
              <div className="grid gap-5 md:grid-cols-3">
                {d.packages.map((p) => (
                  <Card key={p.key} className="flex flex-col gap-3 p-6">
                    <div className="text-[13px] font-extrabold text-muted">{p.name}</div>
                    <div className="text-[30px] font-extrabold tracking-[-0.6px]">{p.credits} <span className="text-[14px] text-muted">kredit</span></div>
                    <div className="text-[15px] font-extrabold text-primary">{formatSom(p.priceUzs)}</div>
                    <div className="text-[12.5px] font-semibold text-muted">{p.note}</div>
                    {/* Purchase spends the centre wallet — exam.manage only (§2b). */}
                    {can('exam.manage') ? (
                      <SoftButton className="mt-1.5 font-extrabold text-primary" onClick={() => { buy.reset(); setDone(null); setPack(p); }}>
                        Sotib olish
                      </SoftButton>
                    ) : null}
                  </Card>
                ))}
              </div>
              {done ? <p className="text-[12.5px] font-bold text-[#1F9D6B]">{done}</p> : null}
            </div>
          </div>
        )}
      </QueryBoundary>
      <ConfirmDialog
        open={!!pack}
        onOpenChange={(v) => { if (!v) setPack(null); }}
        title={pack ? `${pack.name} paketi` : ''}
        message={pack ? `${pack.credits} kredit qo'shiladi. Markaz hamyonidan ${formatSom(pack.priceUzs)} yechiladi (hamyonda: ${formatSom(q.data?.walletBalanceUzs ?? 0)}).` : ''}
        confirmLabel="Sotib olish"
        pending={buy.isPending}
        error={buy.error ? examErrorText(buy.error, "Sotib olib bo'lmadi. Qayta urinib ko'ring.") : undefined}
        onConfirm={() => pack && buy.mutate(pack.key, {
          onSuccess: (r) => { setPack(null); setDone(`${pack.credits} kredit qo'shildi. Balans: ${r.credits} kredit.`); },
        })}
      />
    </section>
  );
}

function BalanceCard({ d }: { d: Credits }) {
  const full = d.prices.map((p) => p.fullCredits);
  const range = full.length ? (Math.min(...full) === Math.max(...full) ? `${full[0]}` : `${Math.min(...full)}–${Math.max(...full)}`) : '—';
  const row = (k: string, v: string) => (
    <div className="flex justify-between gap-3"><span>{k}</span><b className="text-foreground">{v}</b></div>
  );
  return (
    <Card className="flex flex-col gap-[18px] p-[26px]">
      <div className="text-[10.5px] font-bold tracking-[0.8px] text-muted">MARKAZ BALANSI</div>
      <div className="text-[48px] font-extrabold leading-none tracking-[-1.5px] text-primary">
        {d.credits} <span className="text-[16px] tracking-normal text-muted">kredit</span>
      </div>
      <div className="flex flex-col gap-2.5 text-[13.5px] font-semibold text-[#5b6b82]">
        {row("To'liq mock", `${range} kredit`)}
        {row("Bitta bo'lim", `${d.prices[0]?.sectionCredits ?? 1} kredit`)}
        {row('Writing/Speaking AI baholash', 'narxga kiritilgan')}
      </div>
    </Card>
  );
}
