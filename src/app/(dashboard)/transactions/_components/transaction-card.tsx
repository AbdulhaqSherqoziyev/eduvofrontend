'use client';

import { NmCard } from '@/components/ui/nm-card';
import { formatSom } from '@/lib/utils/format';
import { formatDateTime } from '@/lib/utils/date';
import { personName } from '@/lib/utils/tx-display';
import { cn } from '@/lib/utils/cn';
import type { Transaction } from '@/lib/types/transaction';
import { rowLook } from './row-look';

/**
 * The same entry below 768px (§A.9).
 *
 * The table becomes cards rather than a horizontally scrolling grid — a
 * sideways scroll on a phone hides the amount, which is the one column that
 * must never be off screen. No number of any kind here: `#seq` is out by
 * [SV5], and a running index means nothing when the order is visible anyway.
 */
export function TransactionCard(
  { tx, flash, onOpen }: { tx: Transaction; flash?: boolean; onOpen: (tx: Transaction) => void },
) {
  const look = rowLook(tx);
  const { Icon } = look;

  return (
    <NmCard
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
      className={cn('cursor-pointer px-4 py-3.5 shadow-nm-inset-sm', flash && 'animate-fadein ring-1 ring-primary/25')}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn('flex size-9 shrink-0 items-center justify-center rounded-[11px] bg-background', look.iconClass)}
          style={look.iconStyle}
        >
          <Icon size={16} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <span className={cn('truncate text-[13.5px] font-bold text-foreground', look.struck && 'line-through')}>
              {look.category}
            </span>
            <span
              className={cn(
                'shrink-0 whitespace-nowrap text-[15px] font-extrabold',
                look.amountClass,
                look.struck && 'line-through',
              )}
            >
              {look.sign} {formatSom(tx.amount)}
            </span>
          </div>

          <div className="flex items-start justify-between gap-3">
            <span className="truncate text-[12px] text-muted">{look.title}</span>
            {look.amountHint ? (
              <span className="shrink-0 text-[11.5px] text-muted">{look.amountHint}</span>
            ) : null}
          </div>

          <div className="truncate text-[11.5px] text-[#9aa6b8]">
            {formatDateTime(tx.date)}
            {tx.createdBy ? ` · ${personName(tx.createdBy)}` : ''}
          </div>

          {look.pill ? <div className="mt-2">{look.pill}</div> : null}
          {look.rowHint ? <div className="mt-1 text-[11.5px] text-[#9aa6b8]">{look.rowHint}</div> : null}
        </div>
      </div>
    </NmCard>
  );
}
