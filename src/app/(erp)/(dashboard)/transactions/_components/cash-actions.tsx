'use client';

import { useState } from 'react';
import { CalendarCheck, Landmark, MoreHorizontal } from 'lucide-react';
import { NmButton } from '@/components/ui/nm-button';
import { NmDialog } from '@/components/ui/nm-dialog';
import { Can } from '@/components/shared/can';
import { shortDate } from '@/lib/utils/tx-display';
import { cn } from '@/lib/utils/cn';

interface CashActionsProps {
  openingSet: boolean;
  /** Today's day-end, if it has been signed off. */
  closedAt: string | null;
  /** A signed day that a director unlocked again (§D.5). */
  reopened: boolean;
  /** Midnight of the last day signed off anywhere in the center, null if none. */
  lastClosed: string | null;
  onExpense: () => void;
  onIncome: () => void;
  onTransfer: () => void;
  onDayEnd: () => void;
}

/**
 * §A.1 / §A.9 — the four things the cashier can start from this screen.
 *
 * Exactly one of them is primary: "+ Xarajat yozish". Income mostly arrives on
 * its own from student payments, so the single thing written by hand every day
 * is an expense — and it is also the thing the system could not do at all
 * before this screen existed.
 */
/** Nothing has been signed since the day before yesterday (§A.1). */
function isStale(lastClosed: string | null): boolean {
  if (!lastClosed) return true;
  const signed = new Date(lastClosed).getTime();
  if (Number.isNaN(signed)) return true;
  const cutoff = new Date();
  cutoff.setHours(0, 0, 0, 0);
  cutoff.setDate(cutoff.getDate() - 1);
  return signed < cutoff.getTime();
}

export function CashActions({
  openingSet, closedAt, reopened, lastClosed, onExpense, onIncome, onTransfer, onDayEnd,
}: CashActionsProps) {
  const [more, setMore] = useState(false);

  const dayLabel = closedAt ? `Kun yakuni · ${shortDate(closedAt)} ✓` : 'Kun yakuni';
  const stale = isStale(lastClosed);
  // A ring, never a sentence telling them off (§D.6).
  const ring = openingSet && !closedAt && (stale || reopened) ? 'ring-1 ring-primary/25' : '';
  // Which day was last counted — a fact, so it is named only when there is one.
  const hint = !openingSet
    ? "Avval kassa qoldig'ini kiriting."
    : reopened
      ? "Bu kun qayta ochildi — sanagan summani yana bir marta kiriting."
      : stale && lastClosed
        ? `Oxirgi yakun — ${shortDate(lastClosed)}.`
        : '';
  // [TL P7] Until the opening figure exists the drawer cannot add up, so the
  // one action worth steering to is entering it — and two primary buttons on
  // one screen steer nowhere. The emphasis swaps back the moment it is set.
  const entryVariant = openingSet ? undefined : ('soft' as const);

  const dayEndButton = (
    <NmButton variant="soft" className={cn('w-full', ring)} disabled={!openingSet} onClick={onDayEnd}>
      {dayLabel}
    </NmButton>
  );

  return (
    <Can permission="transaction.create">
      <div className="flex flex-col gap-2">
        {/* Desk: one row, primary last. */}
        <div className="hidden flex-wrap justify-end gap-3 md:flex">
          <div className="w-[190px]">{dayEndButton}</div>
          <NmButton variant="soft" disabled={!openingSet} onClick={onTransfer}>
            Pul topshirish
          </NmButton>
          <NmButton variant="soft" onClick={onIncome}>
            + Kirim
          </NmButton>
          <NmButton variant={entryVariant} onClick={onExpense}>
            + Xarajat yozish
          </NmButton>
        </div>

        {/* Phone: the daily action full width, the rest behind "⋯" (§A.9). */}
        <div className="flex flex-col gap-2.5 md:hidden">
          <NmButton variant={entryVariant} className="h-[50px] w-full" onClick={onExpense}>
            + Xarajat yozish
          </NmButton>
          <div className="flex gap-2.5">
            <NmButton variant="soft" className="h-[50px] flex-1" onClick={onIncome}>
              + Kirim
            </NmButton>
            <NmButton variant="soft" aria-label="Boshqa amallar" className="size-[50px] p-0" onClick={() => setMore(true)}>
              <MoreHorizontal className="size-5" />
            </NmButton>
          </div>
        </div>

        {hint ? <p className="text-[11.5px] font-medium text-muted md:text-right">{hint}</p> : null}
      </div>

      <NmDialog open={more} onOpenChange={setMore} title="Boshqa amallar">
        <div className="flex flex-col gap-2.5">
          <button
            type="button"
            disabled={!openingSet}
            onClick={() => { setMore(false); onTransfer(); }}
            className="flex h-[52px] items-center gap-3 rounded-ctl bg-background px-4 text-left shadow-nm-sm disabled:opacity-50"
          >
            <Landmark className="size-[18px] text-primary" />
            <span className="min-w-0">
              <span className="block text-[13.5px] font-bold text-foreground">Pul topshirish</span>
              <span className="block text-[11.5px] font-medium text-muted">Bankka yoki direktorga naqd berish</span>
            </span>
          </button>
          <button
            type="button"
            disabled={!openingSet}
            onClick={() => { setMore(false); onDayEnd(); }}
            className="flex h-[52px] items-center gap-3 rounded-ctl bg-background px-4 text-left shadow-nm-sm disabled:opacity-50"
          >
            <CalendarCheck className="size-[18px] text-primary" />
            <span className="min-w-0">
              <span className="block text-[13.5px] font-bold text-foreground">{dayLabel}</span>
              <span className="block text-[11.5px] font-medium text-muted">Naqd pulni sanab, kunni yopish</span>
            </span>
          </button>
        </div>
      </NmDialog>
    </Can>
  );
}
