'use client';

import { formatSom } from '@/lib/utils/format';
import { formatDateTime } from '@/lib/utils/date';
import { somToWords } from '@/lib/utils/som-to-words';
import { methodWord } from '@/lib/utils/tx-display';
import type { Transaction } from '@/lib/types/transaction';
import { rowLook } from './row-look';

/**
 * The entry as a block — reused by the detail, approval and correction dialogs
 * so one entry always looks like the same entry wherever it is opened.
 *
 * The amount is `text-foreground` even for an expense [SV1]; direction is
 * carried by the arrow, the sign and the word above it.
 */
export function EntryPreview({ tx, compact }: { tx: Transaction; compact?: boolean }) {
  const look = rowLook(tx);
  const { Icon } = look;
  const words = somToWords(tx.amount);
  const kind = tx.kind === 'TRANSFER' ? 'Topshirish' : tx.type === 'INCOME' ? 'Kirim' : 'Chiqim';

  return (
    <div className="rounded-ctl bg-background p-4 shadow-nm-inset-sm">
      <div className="flex items-center gap-1.5 text-[12.5px] font-semibold text-muted">
        <Icon className="size-[14px]" />
        {kind} · {look.category}
      </div>
      <div
        className={`mt-1.5 font-extrabold tracking-[-0.5px] text-foreground ${compact ? 'text-[18px]' : 'text-[24px] leading-none'}`}
      >
        {look.sign} {formatSom(tx.amount)}
      </div>
      {words && !compact ? <div className="mt-1.5 text-[11.5px] font-medium text-muted">{words} so&apos;m</div> : null}
      <div className="mt-1.5 text-[12.5px] font-medium text-muted">
        {methodWord(tx.method)} · {formatDateTime(tx.date)}
        {compact && tx.party ? ` · ${tx.party}` : ''}
      </div>
    </div>
  );
}
