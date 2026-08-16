'use client';

import { ChevronRight } from 'lucide-react';
import { RowIndex } from '@/components/shared/row-index';
import { formatSom } from '@/lib/utils/format';
import { formatDateTime } from '@/lib/utils/date';
import { personName } from '@/lib/utils/tx-display';
import { cn } from '@/lib/utils/cn';
import type { Transaction } from '@/lib/types/transaction';
import { rowLook } from './row-look';

/** Below 1280px the category folds into the description as a chip (§A.4). */
export const TX_GRID =
  'grid min-w-[720px] grid-cols-[40px_54px_2.8fr_1.3fr_1.4fr_24px] ' +
  'xl:grid-cols-[40px_54px_2.6fr_1.3fr_1.2fr_1.4fr_24px] items-center gap-4 px-4';

function Chip({ label }: { label: string }) {
  return (
    <span className="inline-block rounded-full bg-background px-[11px] py-1 text-[12px] text-[#5b6b82] shadow-nm-inset-sm">
      {label}
    </span>
  );
}

/**
 * One ledger line (§A.4/§A.5).
 *
 * The leading figure is the running position on the page, NOT `#seq`: undoing
 * an entry inside its first minute leaves a permanent hole in the sequence, and
 * "#124 → #126" reads to the cashier as their mistake being kept somewhere out
 * of sight [SV5]. The real id is one click away, in the detail dialog.
 */
export function TransactionRow(
  { tx, n, flash, onOpen }: { tx: Transaction; n: number; flash?: boolean; onOpen: (tx: Transaction) => void },
) {
  const look = rowLook(tx);
  const { Icon } = look;

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`${look.category}, ${formatSom(tx.amount)} — tafsilot`}
      onClick={() => onOpen(tx)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen(tx);
        }
      }}
      className={cn(
        TX_GRID,
        'cursor-pointer rounded-[14px] py-3 hover:shadow-nm-inset-sm',
        flash && 'animate-fadein ring-1 ring-primary/25',
      )}
    >
      <RowIndex n={n} />
      <div
        className={cn('flex size-10 items-center justify-center rounded-[12px] bg-background', look.iconClass)}
        style={look.iconStyle}
      >
        <Icon size={18} />
      </div>

      <div className="min-w-0">
        <div className={cn('truncate font-bold text-foreground', look.struck && 'text-[#9aa6b8] line-through')}>
          {look.title}
        </div>
        {look.subtitle ? (
          <div className={cn('truncate text-[13px] text-muted', look.struck && 'line-through')}>{look.subtitle}</div>
        ) : null}
        <div className="mt-1 flex flex-wrap items-center gap-2 xl:hidden">
          <Chip label={look.category} />
          {look.pill}
        </div>
        {look.rowHint ? <div className="mt-1 text-[11.5px] text-[#9aa6b8]">{look.rowHint}</div> : null}
      </div>

      <div className="min-w-0 text-[13px] text-muted">
        <div className="whitespace-nowrap">{formatDateTime(tx.date)}</div>
        {tx.createdBy ? (
          <div className="truncate text-[11.5px] text-[#9aa6b8]">{personName(tx.createdBy)}</div>
        ) : null}
      </div>

      <div className="hidden min-w-0 xl:block">
        <Chip label={look.category} />
        {look.pill ? <div className="mt-1.5">{look.pill}</div> : null}
      </div>

      <div className="min-w-0 text-right">
        <div className={cn('whitespace-nowrap font-extrabold', look.amountClass, look.struck && 'line-through')}>
          {look.sign} {formatSom(tx.amount)}
        </div>
        {look.amountHint ? <div className="text-[11.5px] text-muted">{look.amountHint}</div> : null}
      </div>

      <ChevronRight className="size-4 text-[#9aa6b8]" />
    </div>
  );
}
