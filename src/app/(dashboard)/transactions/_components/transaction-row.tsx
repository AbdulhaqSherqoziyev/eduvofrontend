import { CreditCard } from 'lucide-react';
import type { Transaction } from '@/lib/types/transaction';
import { formatSom } from '@/lib/utils/format';
import { formatDate } from '@/lib/utils/date';
import { cn } from '@/lib/utils/cn';

const ROW =
  'grid grid-cols-[54px_2.4fr_1.2fr_1.1fr_1fr_1.2fr] items-center gap-4 px-4 py-3';

/** One ledger entry — icon, description, date, category chip, method, amount. */
export function TransactionRow({ tx }: { tx: Transaction }) {
  const income = tx.type === 'INCOME';

  return (
    <div className={ROW}>
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
        <div className="truncate font-bold text-foreground">{tx.party}</div>
        <div className="truncate text-[13px] text-muted">{tx.note}</div>
      </div>
      <div className="text-[13px] text-muted">{formatDate(tx.date)}</div>
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
      </div>
    </div>
  );
}
