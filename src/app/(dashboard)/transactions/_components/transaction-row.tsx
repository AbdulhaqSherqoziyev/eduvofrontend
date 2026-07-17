'use client';

import { useState } from 'react';
import { Ban, CreditCard, Undo2 } from 'lucide-react';
import { Can } from '@/components/shared/can';
import { useVoidTransaction } from '@/lib/hooks/use-transactions';
import type { Transaction } from '@/lib/types/transaction';
import { formatSom } from '@/lib/utils/format';
import { formatDateTime } from '@/lib/utils/date';
import { cn } from '@/lib/utils/cn';
import { RowIndex } from '@/components/shared/row-index';

const ROW =
  'grid min-w-[760px] grid-cols-[40px_54px_2.4fr_1.2fr_1.1fr_1fr_1.2fr_60px] items-center gap-4 px-4 py-3';

/** One ledger entry — icon, description, date, category chip, method, amount. */
export function TransactionRow({ tx, n }: { tx: Transaction; n: number }) {
  const income = tx.type === 'INCOME';
  const [confirm, setConfirm] = useState(false);
  const voidTx = useVoidTransaction();
  const voidable = !tx.voided && !tx.reversalOf && tx.category !== 'Storno';

  return (
    <div className={cn(ROW, tx.voided && 'opacity-45')}>
      <RowIndex n={n} />
      <div
        className={cn(
          'flex size-10 items-center justify-center rounded-[12px]',
          income ? 'text-success' : 'text-danger',
        )}
        style={{ background: income ? 'rgba(43,182,115,0.14)' : 'rgba(228,87,76,0.13)' }}
      >
        <CreditCard size={18} />
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="shrink-0 rounded-[6px] bg-background px-1.5 py-0.5 text-[11px] font-bold text-[#9aa6b8] shadow-nm-inset-sm">
            #{tx.seq}
          </span>
          <span className="truncate font-bold text-foreground">{tx.party}</span>
        </div>
        <div className="truncate text-[13px] text-muted">{tx.note || '—'}</div>
      </div>
      <div className="min-w-0 text-[13px] text-muted">
        <div className="whitespace-nowrap">{formatDateTime(tx.date)}</div>
        {tx.createdBy ? (
          <div className="truncate text-[11.5px] text-[#9aa6b8]" title={tx.createdBy}>
            {tx.createdBy}
          </div>
        ) : null}
      </div>
      <div>
        <span className="inline-block rounded-full bg-background px-[11px] py-1 text-[12px] text-[#5b6b82] shadow-nm-inset-sm">
          {tx.category}
        </span>
      </div>
      <div className="text-[13px] text-muted">{tx.method}</div>
      <div
        className={cn(
          'whitespace-nowrap text-right font-extrabold',
          income ? 'text-success' : 'text-danger',
        )}
      >
        {(income ? '+ ' : '− ') + formatSom(tx.amount)}
        {tx.voided ? <div className="text-[10.5px] font-bold uppercase text-danger">Bekor qilingan</div> : null}
      </div>
      <div className="flex justify-end">
        {voidable ? (
          <Can permission="transaction.create">
            {confirm ? (
              <button type="button" title="Tasdiqlash: bekor qilish"
                className="flex size-9 items-center justify-center rounded-[11px] bg-background text-danger shadow-nm-inset-sm"
                disabled={voidTx.isPending}
                onClick={() => voidTx.mutate(tx.id, { onSettled: () => setConfirm(false) })}>
                <Undo2 size={15} strokeWidth={2.4} />
              </button>
            ) : (
              <button type="button" title="Tranzaksiyani bekor qilish"
                className="flex size-9 items-center justify-center rounded-[11px] bg-background text-[#9aa6b8] shadow-nm-sm nm-pressable hover:text-danger"
                onClick={() => setConfirm(true)} onBlur={() => setConfirm(false)}>
                <Ban size={15} strokeWidth={2.2} />
              </button>
            )}
          </Can>
        ) : null}
      </div>
    </div>
  );
}
