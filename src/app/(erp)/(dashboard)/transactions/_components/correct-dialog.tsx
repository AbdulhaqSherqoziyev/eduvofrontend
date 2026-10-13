'use client';

import { useEffect, useState } from 'react';
import { NmButton } from '@/components/ui/nm-button';
import { NmDialog } from '@/components/ui/nm-dialog';
import { NmSwitch } from '@/components/ui/nm-switch';
import { NmTextarea } from '@/components/ui/nm-textarea';
import { useCorrectEntry } from '@/lib/hooks/use-transactions';
import { useOnline } from '@/lib/hooks/use-online';
import type { Transaction } from '@/lib/types/transaction';
import { EntryPreview } from './entry-preview';
import { ReasonChips } from '@/components/shared/reason-chips';
import { saveErrorMessage } from './entry-state';

const REASONS = ['Summa xato kiritilgan', 'Kategoriya xato tanlangan', 'Bu yozuv takror kiritilgan', 'Boshqa sabab'];
const OTHER = 'Boshqa sabab';
const OFFLINE = "Internet yo'q — amal bajarilmadi. Aloqa tiklanganda qayta bosing.";

interface CorrectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tx: Transaction;
  /** Reopen the entry dialog prefilled from this row (the switch below). */
  onReenter: (tx: Transaction) => void;
}

/**
 * §F.3 — "Xatoni to'g'rilash" for a hand-written entry.
 *
 * Nothing is erased: the original stays on screen struck through and a mirror
 * row cancels it, so the ledger keeps both halves of what happened. The switch
 * is on by default because the cashier's goal was never "delete" — it was
 * "record the right figure", and making them retype everything is an
 * invitation to make the same mistake twice.
 */
export function CorrectDialog({ open, onOpenChange, tx, onReenter }: CorrectDialogProps) {
  const [reason, setReason] = useState('');
  const [note, setNote] = useState('');
  const [again, setAgain] = useState(true);
  const [failure, setFailure] = useState('');
  const online = useOnline();
  const correct = useCorrectEntry();

  useEffect(() => {
    if (!open) return;
    setReason(''); setNote(''); setAgain(true); setFailure('');
  }, [open]);

  const needsNote = reason === OTHER;
  const blocked = !reason || (needsNote && note.trim().length < 3) || correct.isPending;

  const submit = async () => {
    setFailure('');
    if (!online) {
      setFailure(OFFLINE);
      return;
    }
    try {
      await correct.mutateAsync({ id: tx.id, input: { reason, note: note.trim() || undefined } });
      onOpenChange(false);
      if (again) onReenter(tx);
    } catch (e) {
      setFailure(saveErrorMessage(e));
    }
  };

  return (
    <NmDialog open={open} onOpenChange={onOpenChange} title="Xatoni to'g'rilash">
      <div className="flex flex-col gap-5">
        <EntryPreview tx={tx} compact />

        <div>
          <p className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.9px] text-muted">NIMA XATO BO&apos;LGAN?</p>
          <ReasonChips options={REASONS} value={reason} onChange={setReason} />
          {needsNote ? (
            <NmTextarea
              className="mt-2.5"
              rows={2}
              maxLength={500}
              placeholder="Nima xato bo'lgan?"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          ) : null}
        </div>

        <div className="flex items-start gap-4 rounded-ctl bg-background p-3.5 shadow-nm-inset-sm">
          <div className="min-w-0 flex-1">
            <div className="text-[13px] font-bold text-foreground">To&apos;g&apos;ri yozuvni hozir kiritish</div>
            <div className="text-[11.5px] font-medium text-muted">
              To&apos;g&apos;rilangach kiritish oynasi shu ma&apos;lumotlar bilan ochiladi.
            </div>
          </div>
          <NmSwitch checked={again} onCheckedChange={setAgain} aria-label="To'g'ri yozuvni hozir kiritish" />
        </div>

        <p className="text-[11.5px] font-medium text-muted">
          Eski yozuv o&apos;chmaydi, tarixda «to&apos;g&apos;rilangan» bo&apos;lib qoladi.
        </p>
        {failure ? <p className="text-[11.5px] font-semibold text-foreground">{failure}</p> : null}

        <div className="flex gap-3">
          <NmButton variant="soft" className="flex-1" onClick={() => onOpenChange(false)}>
            Yopish
          </NmButton>
          <NmButton variant="danger" className="flex-[1.4]" disabled={blocked} onClick={submit}>
            {correct.isPending ? "To'g'rilanmoqda…" : "To'g'rilash"}
          </NmButton>
        </div>
      </div>
    </NmDialog>
  );
}
