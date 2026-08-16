'use client';

import { Clock } from 'lucide-react';
import { formatNumber, formatSom } from '@/lib/utils/format';
import type { DayEndView } from '@/lib/types/cash';

/**
 * §D.2 — what the books say is in the drawer, and how that figure was reached.
 *
 * "HISOB BO'YICHA KASSADA", never "kassada bo'lishi kerak": the second phrasing
 * is a demand, and it tells the cashier in advance that any difference is their
 * fault. Putting the arithmetic underneath is part of the same idea — a figure
 * nobody can check is a figure nobody can argue with.
 */
export function DayEndExpected({ data, onShowPending }: { data: DayEndView; onShowPending: () => void }) {
  const flow = data.breakdown;
  const idle = flow.income === 0 && flow.expense === 0 && flow.transfer === 0;

  return (
    <>
      <div className="rounded-ctl bg-background p-4 shadow-nm-inset-sm">
        <div className="text-[11px] font-bold uppercase tracking-[0.9px] text-muted">
          HISOB BO&apos;YICHA KASSADA (naqd)
        </div>
        <div className="mt-1.5 text-[24px] font-extrabold leading-none tracking-[-0.5px] text-foreground">
          {formatSom(data.expectedCash ?? 0)}
        </div>
        <p className="mt-2 text-[11.5px] font-medium text-muted">
          Kecha yakuni {formatNumber(flow.prev)} + bugungi kirim {formatNumber(flow.income)} − chiqim{' '}
          {formatNumber(flow.expense)}
          {flow.transfer ? ` − topshirish ${formatNumber(flow.transfer)}` : ''}
        </p>
        {idle ? (
          <p className="mt-1.5 text-[11.5px] font-medium text-muted">Bugun naqd harakat bo&apos;lmagan.</p>
        ) : null}
      </div>

      {/*
        [SV2] — the single most important line in this dialog. An expense above
        the threshold is not in the figure above, but the notes may already be
        out of the drawer, so the count comes up short through no fault of the
        person doing it. Stated as a fact, before they see the difference.
      */}
      {data.pending.count > 0 ? (
        <button
          type="button"
          onClick={onShowPending}
          className="flex items-start gap-2 rounded-ctl bg-background p-3 text-left text-[12px] font-medium text-foreground shadow-nm-inset-sm"
        >
          <Clock className="mt-[1px] size-3.5 shrink-0 text-muted" />
          <span>
            Tasdiq kutayotgan {data.pending.count} ta xarajat ({formatNumber(data.pending.amount)} so&apos;m) bu
            hisobga kirmagan.
          </span>
        </button>
      ) : null}
    </>
  );
}
