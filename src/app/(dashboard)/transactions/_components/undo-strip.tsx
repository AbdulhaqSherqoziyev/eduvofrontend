'use client';

import { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import { NmCard } from '@/components/ui/nm-card';
import { NmButton } from '@/components/ui/nm-button';
import { ProgressBar } from '@/components/ui/progress-bar';
import { useDiscardEntry } from '@/lib/hooks/use-transactions';
import { formatSom } from '@/lib/utils/format';
import { categoryLabel } from '@/lib/utils/tx-display';
import type { Transaction } from '@/lib/types/transaction';

const WINDOW_S = 60;

function secondsLeft(createdAt: string): number {
  const started = new Date(createdAt).getTime();
  if (Number.isNaN(started)) return 0;
  return Math.max(0, Math.ceil((started + WINDOW_S * 1000 - Date.now()) / 1000));
}

interface UndoStripProps {
  tx: Transaction;
  onDone: () => void;
  onOpenDetail: (tx: Transaction) => void;
}

/**
 * §B.5 — sixty seconds to take it back.
 *
 * The entry itself is written to the server immediately: a frontend that waits
 * a minute before sending loses the work the moment the browser closes, and an
 * expense that was never recorded is a worse outcome than one that has to be
 * corrected. When the window closes the strip disappears silently — no
 * "expired" toast, nothing that reads as a scolding.
 */
export function UndoStrip({ tx, onDone, onOpenDetail }: UndoStripProps) {
  const [left, setLeft] = useState(() => secondsLeft(tx.createdAt));
  const [expired, setExpired] = useState(false);
  const discard = useDiscardEntry();

  useEffect(() => {
    setLeft(secondsLeft(tx.createdAt));
    setExpired(false);
    const id = window.setInterval(() => setLeft(secondsLeft(tx.createdAt)), 1000);
    return () => window.clearInterval(id);
  }, [tx.id, tx.createdAt]);

  // Silent exit once the window is over and nothing went wrong.
  useEffect(() => {
    if (left <= 0 && !expired) onDone();
  }, [left, expired, onDone]);

  const undo = async () => {
    try {
      await discard.mutateAsync(tx.id);
      onDone();
    } catch {
      // 409 UNDO_WINDOW_EXPIRED — the tab was asleep. Say what to do next
      // instead of just refusing.
      setExpired(true);
    }
  };

  if (left <= 0 && !expired) return null;

  return (
    <NmCard className="fixed bottom-4 left-4 right-4 z-30 px-4 py-3 shadow-nm-inset-sm md:static md:z-auto">
      {expired ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-[13px] font-semibold text-foreground">
            Vaqt tugadi. Bu yozuvni «Xatoni to&apos;g&apos;rilash» orqali o&apos;zgartirish mumkin.
          </span>
          <div className="flex gap-2">
            <NmButton variant="soft" size="sm" onClick={() => onOpenDetail(tx)}>
              Ochish
            </NmButton>
            <NmButton variant="ghost" size="sm" onClick={onDone}>
              Yopish
            </NmButton>
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="flex items-center gap-2 text-[13px] font-semibold text-foreground">
              <Check className="size-4 text-success" />
              Yozildi: {categoryLabel(tx.category)} · {tx.type === 'INCOME' ? '+' : '−'} {formatSom(tx.amount)}
            </span>
            <NmButton
              variant="soft"
              size="sm"
              className="text-[#5b6b82]"
              disabled={discard.isPending}
              onClick={undo}
            >
              Bekor qilish · {left}
            </NmButton>
          </div>
          <ProgressBar className="mt-2.5" value={(left / WINDOW_S) * 100} />
        </>
      )}
    </NmCard>
  );
}
