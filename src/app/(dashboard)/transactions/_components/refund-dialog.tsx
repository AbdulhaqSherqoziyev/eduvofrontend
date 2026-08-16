'use client';

import { useEffect, useState } from 'react';
import { Avatar } from '@/components/ui/avatar';
import { NmButton } from '@/components/ui/nm-button';
import { NmDialog } from '@/components/ui/nm-dialog';
import { NmTextarea } from '@/components/ui/nm-textarea';
import { useRefundEntry } from '@/lib/hooks/use-transactions';
import { useOnline } from '@/lib/hooks/use-online';
import { formatDateTime } from '@/lib/utils/date';
import { formatSom } from '@/lib/utils/format';
import { methodWord } from '@/lib/utils/tx-display';
import type { Transaction } from '@/lib/types/transaction';
import { ReasonChips } from '@/components/shared/reason-chips';
import { saveErrorMessage } from './entry-state';

const REASONS = ["O'quvchi darsni boshlamadi", "Ortiqcha to'lov qilingan", "Boshqa markazga o'tdi", 'Boshqa sabab'];
const OTHER = 'Boshqa sabab';
const OFFLINE = "Internet yo'q — amal bajarilmadi. Aloqa tiklanganda qayta bosing.";

/**
 * §F.2 — giving a student their money back.
 *
 * Full amount only in v1: a partial refund has to split the invoice and its
 * allocations, and a half-working one corrupts the student's balance — a worse
 * outcome than not offering it yet. The reason is mandatory because this is the
 * one entry the director and the cashier will later argue about.
 */
export function RefundDialog({
  open, onOpenChange, tx,
}: { open: boolean; onOpenChange: (open: boolean) => void; tx: Transaction }) {
  const [reason, setReason] = useState('');
  const [note, setNote] = useState('');
  const [failure, setFailure] = useState('');
  const online = useOnline();
  const refund = useRefundEntry();

  useEffect(() => {
    if (!open) return;
    setReason(''); setNote(''); setFailure('');
  }, [open]);

  const needsNote = reason === OTHER;
  const blocked = !reason || (needsNote && note.trim().length < 3) || refund.isPending;

  const submit = async () => {
    setFailure('');
    if (!online) {
      setFailure(OFFLINE);
      return;
    }
    try {
      await refund.mutateAsync({ id: tx.id, input: { reason, note: note.trim() || undefined } });
      onOpenChange(false);
    } catch (e) {
      setFailure(saveErrorMessage(e));
    }
  };

  return (
    <NmDialog open={open} onOpenChange={onOpenChange} title="Pulni qaytarish">
      <div className="flex flex-col gap-5">
        <div className="flex items-center gap-[13px] rounded-ctl bg-background p-[14px] shadow-nm-inset-sm">
          <Avatar name={tx.party || "O'quvchi"} size={42} />
          <div className="min-w-0 flex-1">
            <div className="truncate text-[14px] font-bold text-foreground">{tx.party || "O'quvchi"}</div>
            <div className="text-[12px] font-semibold text-muted">
              {formatDateTime(tx.date)} · {methodWord(tx.method)}
            </div>
          </div>
          <div className="shrink-0 text-[14px] font-extrabold text-foreground">+ {formatSom(tx.amount)}</div>
        </div>

        <div>
          <p className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.9px] text-muted">NEGA QAYTARILMOQDA?</p>
          <ReasonChips options={REASONS} value={reason} onChange={setReason} />
          {needsNote ? (
            <NmTextarea
              className="mt-2.5"
              rows={2}
              maxLength={500}
              placeholder="Nega qaytarilmoqda?"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          ) : null}
        </div>

        <div>
          <p className="text-[13px] font-bold text-foreground">
            Qaytariladigan summa: {formatSom(tx.amount)} (to&apos;liq)
          </p>
          <p className="mt-1 text-[11.5px] font-medium text-muted">
            O&apos;quvchining hisob-kitobi shu summaga qaytariladi.
          </p>
          <p className="text-[11.5px] font-medium text-muted">
            Eski yozuv o&apos;chmaydi, tarixda «qaytarilgan» bo&apos;lib qoladi.
          </p>
        </div>
        {failure ? <p className="text-[11.5px] font-semibold text-foreground">{failure}</p> : null}

        <div className="flex gap-3">
          <NmButton variant="soft" className="flex-1" onClick={() => onOpenChange(false)}>
            Yopish
          </NmButton>
          <NmButton variant="danger" className="flex-[1.4]" disabled={blocked} onClick={submit}>
            {refund.isPending ? 'Qaytarilmoqda…' : 'Pulni qaytarish'}
          </NmButton>
        </div>
      </div>
    </NmDialog>
  );
}
