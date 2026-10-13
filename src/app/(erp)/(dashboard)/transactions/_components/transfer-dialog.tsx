'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader2, WifiOff } from 'lucide-react';
import { NmButton } from '@/components/ui/nm-button';
import { NmDialog } from '@/components/ui/nm-dialog';
import { useAuth } from '@/providers/auth-provider';
import { useCashBalance } from '@/lib/hooks/use-cash';
import { useCreateEntry } from '@/lib/hooks/use-transactions';
import { useOnline } from '@/lib/hooks/use-online';
import { formatDate } from '@/lib/utils/date';
import { isoDay } from '@/lib/utils/tx-display';
import type { Transaction } from '@/lib/types/transaction';
import { EntrySummaryStep } from './entry-summary-step';
import { entryDateIso, newClientRef, saveErrorMessage } from './entry-state';
import { TransferForm, type TransferDraft } from './transfer-form';

const OFFLINE =
  "Internet yo'q — yozuv yuborilmadi. Oyna yopilmaydi; aloqa tiklanganda «Tasdiqlash va yozish» ni qayta bosing.";

const blank = (): TransferDraft => ({ amount: '', target: 'Bank', other: '', date: isoDay(), note: '' });

interface TransferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved?: (tx: Transaction) => void;
}

/**
 * §E — handing cash to the bank or the director.
 *
 * The word "inkassatsiya" appears nowhere: a cashier will not press a button
 * whose name they do not use. And this is NOT an expense — the money has not
 * left the center, only the drawer — which is said in words ("foydaga
 * kirmaydi") rather than left to colour to imply.
 */
export function TransferDialog({ open, onOpenChange, onSaved }: TransferDialogProps) {
  const [draft, setDraft] = useState<TransferDraft>(blank);
  const [step, setStep] = useState<'form' | 'summary'>('form');
  const [failure, setFailure] = useState('');
  const [wasOffline, setWasOffline] = useState(false);
  const clientRef = useRef(newClientRef());

  const online = useOnline();
  const { user } = useAuth();
  const { data: balance } = useCashBalance();
  const create = useCreateEntry();

  useEffect(() => {
    if (!open) return;
    setDraft(blank());
    setStep('form');
    setFailure('');
    setWasOffline(false);
    clientRef.current = newClientRef();
  }, [open]);

  const cash = balance?.cash ?? 0;
  const value = Number(draft.amount || 0);
  const party = draft.target === 'Boshqa' ? draft.other.trim() : draft.target;
  const tooMuch = value > cash;

  const submit = async () => {
    setFailure('');
    if (!online) {
      setWasOffline(true);
      return;
    }
    try {
      const saved = await create.mutateAsync({
        type: 'TRANSFER', amount: value, method: 'CASH', date: entryDateIso(draft.date),
        party, note: draft.note.trim(), clientRef: clientRef.current,
      });
      onSaved?.(saved);
      onOpenChange(false);
    } catch (e) {
      setFailure(saveErrorMessage(e));
    }
  };

  return (
    <NmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={step === 'summary' ? 'Tekshiring va tasdiqlang' : 'Pul topshirish'}
    >
      {step === 'form' ? (
        <TransferForm draft={draft} cash={cash} tooMuch={tooMuch} onChange={(p) => setDraft({ ...draft, ...p })} />
      ) : (
        <EntrySummaryStep
          heading={`TOPSHIRISH · ${party.toLocaleUpperCase('uz')}`}
          sign="−"
          amount={value}
          rows={[
            { label: 'Qaysi kassadan', value: 'Naqd kassa' },
            { label: 'Kimga', value: party },
            { label: 'Sana', value: formatDate(draft.date) },
            { label: 'Izoh', value: draft.note.trim() },
            { label: 'Kim yozmoqda', value: user?.fullName ?? '' },
          ]}
        />
      )}

      <div className="sticky bottom-0 z-[2] mt-5 flex flex-col gap-2.5 bg-background pt-1">
        {!online || wasOffline ? (
          <div className="flex items-start gap-2 rounded-ctl bg-background p-3 text-[11.5px] font-medium shadow-nm-inset-sm">
            <WifiOff className="mt-[1px] size-3.5 shrink-0 text-muted" />
            <span className={online ? 'text-success' : 'text-foreground'}>
              {online ? 'Aloqa tiklandi — qayta yuborishingiz mumkin.' : OFFLINE}
            </span>
          </div>
        ) : null}
        {failure ? <p className="text-[11.5px] font-semibold text-danger">{failure}</p> : null}
        <div className="flex gap-3">
          {step === 'form' ? (
            <>
              <NmButton variant="soft" className="flex-1" onClick={() => onOpenChange(false)}>
                Yopish
              </NmButton>
              <NmButton
                className="flex-[1.4]"
                disabled={!value || tooMuch || (draft.target === 'Boshqa' && !party)}
                onClick={() => setStep('summary')}
              >
                Davom etish
              </NmButton>
            </>
          ) : (
            <>
              <NmButton variant="soft" className="flex-1" disabled={create.isPending} onClick={() => setStep('form')}>
                ‹ Orqaga
              </NmButton>
              <NmButton className="flex-[1.6]" disabled={create.isPending} onClick={submit}>
                {create.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
                {create.isPending ? 'Yozilmoqda…' : 'Tasdiqlash va yozish'}
              </NmButton>
            </>
          )}
        </div>
      </div>
    </NmDialog>
  );
}
