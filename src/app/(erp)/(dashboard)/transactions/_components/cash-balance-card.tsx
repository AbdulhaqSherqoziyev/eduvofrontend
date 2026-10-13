'use client';

import Link from 'next/link';
import { Banknote, CreditCard, TrendingUp, Wallet, type LucideIcon } from 'lucide-react';
import { NmCard } from '@/components/ui/nm-card';
import { NmButton } from '@/components/ui/nm-button';
import { Skeleton } from '@/components/shared/skeleton';
import { useCashBalance } from '@/lib/hooks/use-cash';
import { formatNumber, formatSom } from '@/lib/utils/format';
import { formatDateTime } from '@/lib/utils/date';
import type { CashBalance } from '@/lib/types/cash';

/** One inset well. The figure is neutral: a balance is neither good nor bad. */
function Pot({ icon: Icon, label, value, className }: { icon: LucideIcon; label: string; value: string; className?: string }) {
  return (
    <div className={`rounded-ctl bg-background p-4 shadow-nm-inset-sm ${className ?? ''}`}>
      <div className="mb-1.5 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.9px] text-muted">
        <Icon className="size-[15px]" />
        {label}
      </div>
      <div className="text-[17px] font-extrabold tracking-[-0.3px] text-foreground">{value}</div>
    </div>
  );
}

/** "kirim + 1 200 000 · chiqim − 350 000" — only the inflow is coloured. */
function FlowRow({ label, income, expense }: { label: string; income: number; expense: number }) {
  return (
    <div className="flex flex-wrap items-baseline gap-x-2 text-[12.5px] font-semibold">
      <span className="w-[62px] shrink-0 text-muted">{label}</span>
      <span className="text-muted">kirim</span>
      <span className="text-success">+ {formatNumber(income)}</span>
      <span className="text-[#9aa6b8]">·</span>
      <span className="text-muted">chiqim</span>
      <span className="text-foreground">− {formatNumber(expense)}</span>
    </div>
  );
}

/**
 * §A.2 — the drawer, as of a stated moment.
 *
 * `net` is absent from the response for anyone without `report.finance`, and
 * the block is then not rendered at all: a greyed-out box with a padlock only
 * asks "what is in there?" and sends the cashier to ask a colleague (§G.1).
 */
function Balance({ data }: { data: CashBalance }) {
  const month = data.month.label;
  const showNet = data.net !== undefined;
  return (
    <NmCard className="p-[22px]">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <span className="text-[11px] font-bold uppercase tracking-[0.9px] text-muted">KASSA QOLDIG&apos;I</span>
        <span className="text-[11.5px] font-semibold text-muted">{formatDateTime(data.asOf)} holatiga</span>
      </div>

      <div className={`grid grid-cols-2 gap-3 ${showNet ? 'sm:grid-cols-4' : 'sm:grid-cols-3'}`}>
        <Pot icon={Banknote} label="NAQD" value={formatSom(data.cash ?? 0)} />
        <Pot icon={CreditCard} label="KARTA" value={formatSom(data.card ?? 0)} />
        <Pot icon={Wallet} label="JAMI" value={formatSom(data.total ?? 0)} className="col-span-2 sm:col-span-1" />
        {showNet ? (
          <div className="col-span-2 rounded-ctl bg-background p-4 shadow-nm-inset-sm sm:col-span-1">
            <div className="mb-1.5 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.9px] text-muted">
              <TrendingUp className="size-[15px]" />
              SOF ({month.toLocaleLowerCase('uz')})
            </div>
            {data.net === 0 ? (
              <div className="text-[11.5px] font-semibold text-muted">Hisob oy davomida to&apos;ldirilmoqda</div>
            ) : (
              <div className="text-[17px] font-extrabold tracking-[-0.3px] text-foreground">
                {data.net! < 0 ? '− ' : ''}
                {formatSom(data.net!)}
              </div>
            )}
          </div>
        ) : null}
      </div>

      <div className="mt-4 flex flex-col gap-1.5">
        <FlowRow label="Bugun" income={data.today.income} expense={data.today.expense} />
        <FlowRow label={month} income={data.month.income} expense={data.month.expense} />
      </div>

      {showNet ? (
        <Link href="/reports" className="mt-4 inline-block text-[12.5px] font-bold text-primary">
          Batafsil moliyaviy hisobot →
        </Link>
      ) : null}
    </NmCard>
  );
}

export function CashBalanceCard() {
  const { data, isLoading, isError, refetch } = useCashBalance();

  if (isLoading) return <Skeleton className="h-[150px] w-full" />;
  // §0.5: a stale figure is not a smaller problem than no figure — the cashier
  // counts notes against this number.
  if (isError || !data) {
    return (
      <NmCard className="flex flex-col items-start gap-3 p-[22px]">
        <div className="text-[13px] font-semibold text-foreground">Qoldiqni hozir ko&apos;rsatib bo&apos;lmadi.</div>
        <NmButton variant="soft" size="sm" onClick={() => refetch()}>
          Qayta urinish
        </NmButton>
      </NmCard>
    );
  }
  if (!data.opening.set) return null;
  return <Balance data={data} />;
}
