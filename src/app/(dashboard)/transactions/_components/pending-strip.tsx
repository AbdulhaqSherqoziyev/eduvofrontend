'use client';

import { ChevronRight, Clock } from 'lucide-react';
import { NmCard } from '@/components/ui/nm-card';
import { formatSom } from '@/lib/utils/format';

interface PendingStripProps {
  count: number;
  amount: number;
  onOpen: () => void;
}

/**
 * §C.2 — money the cashier has written but the balance does not yet hold.
 *
 * Shown to both sides, and it is the same row: the cashier taps it to filter
 * their list, the director to open the approval queue. The second line matters
 * more than the first — without it the cashier reads the missing amount as the
 * system losing their entry.
 */
export function PendingStrip({ count, amount, onOpen }: PendingStripProps) {
  if (count <= 0) return null;
  return (
    <NmCard
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen();
        }
      }}
      className="cursor-pointer px-4 py-3 shadow-nm-inset-sm"
    >
      <div className="flex items-center gap-3">
        <Clock className="size-4 shrink-0 text-muted" />
        <div className="min-w-0 flex-1">
          <div className="text-[13.5px] font-bold text-foreground">
            Tasdiq kutilmoqda: {count} ta yozuv · {formatSom(amount)}
          </div>
          <div className="text-[11.5px] font-medium text-muted">Bu summa kassa qoldig&apos;iga kirmagan.</div>
        </div>
        <ChevronRight className="size-4 shrink-0 text-[#9aa6b8]" />
      </div>
    </NmCard>
  );
}
