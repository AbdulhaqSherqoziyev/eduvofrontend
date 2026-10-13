'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader2, WifiOff } from 'lucide-react';
import { NmButton } from '@/components/ui/nm-button';
import { NmDialog } from '@/components/ui/nm-dialog';
import { useAuth } from '@/providers/auth-provider';
import { useExpenseCategories } from '@/lib/hooks/use-cash';
import { useCreateEntry, useUpdateEntry } from '@/lib/hooks/use-transactions';
import { useOnline } from '@/lib/hooks/use-online';
import { useTenantSettings } from '@/lib/hooks/use-tenant-settings';
import { can } from '@/lib/auth/permissions';
import { formatDate } from '@/lib/utils/date';
import type { Transaction } from '@/lib/types/transaction';
import { EntryFormStep } from './entry-form-step';
import { EntrySummaryStep } from './entry-summary-step';
import {
  emptyDraft, entryDateIso, hasErrors, isDirty, newClientRef, saveErrorMessage, validateDraft,
  type DraftErrors, type EntryDraft,
} from './entry-state';

const OFFLINE =
  "Internet yo'q — yozuv yuborilmadi. Oyna yopilmaydi; aloqa tiklanganda «Tasdiqlash va yozish» ni qayta bosing.";

interface EntryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Fresh draft to start from (direction, or a correction's prefill). */
  initial: EntryDraft;
  /** Editing an own PENDING/RETURNED row instead of writing a new one (§C.2). */
  editId?: string | null;
  onSaved?: (tx: Transaction) => void;
}

/**
 * §B — write an income or an expense, in two steps.
 *
 * Nothing here is optimistic and the dialog never closes on an error: whatever
 * was typed stays on screen until the server has confirmed it, because the one
 * question the cashier must always be able to answer is "did that go through?"
 */
export function EntryDialog({ open, onOpenChange, initial, editId, onSaved }: EntryDialogProps) {
  const [draft, setDraft] = useState<EntryDraft>(initial);
  const [step, setStep] = useState<'form' | 'summary'>('form');
  const [errors, setErrors] = useState<DraftErrors>({});
  const [failure, setFailure] = useState('');
  const [wasOffline, setWasOffline] = useState(false);
  const clientRef = useRef(newClientRef());

  const online = useOnline();
  const { user } = useAuth();
  const { data: settings } = useTenantSettings();
  const categories = useExpenseCategories({ type: draft.type, selectable: true }, open);
  const create = useCreateEntry();
  const update = useUpdateEntry();
  const saving = create.isPending || update.isPending;

  // A reopened dialog is a new entry: new draft, new idempotency key.
  useEffect(() => {
    if (!open) return;
    setDraft(initial);
    setStep('form');
    setErrors({});
    setFailure('');
    setWasOffline(false);
    clientRef.current = newClientRef();
  }, [open, initial]);

  const amount = Number(draft.amount || 0);
  const limit = settings?.expenseApprovalLimit ?? 0;
  const willQueue = draft.type === 'EXPENSE' && limit > 0 && amount > limit && !can('transaction.approve');
  const category = categories.data?.find((c) => c.id === draft.categoryId)?.name ?? '';

  const proceed = () => {
    const found = validateDraft(draft);
    setErrors(found);
    if (!hasErrors(found)) setStep('summary');
  };

  const submit = async () => {
    setFailure('');
    if (!online) {
      setWasOffline(true);
      return;
    }
    const payload = {
      categoryId: draft.categoryId,
      amount,
      method: draft.method,
      date: entryDateIso(draft.date),
      party: draft.party.trim(),
      note: draft.note.trim(),
    };
    try {
      if (editId) {
        await update.mutateAsync({ id: editId, input: payload });
      } else {
        const saved = await create.mutateAsync({ ...payload, type: draft.type, clientRef: clientRef.current });
        onSaved?.(saved);
      }
      onOpenChange(false);
    } catch (e) {
      setFailure(saveErrorMessage(e));
    }
  };

  const title = step === 'summary'
    ? 'Tekshiring va tasdiqlang'
    : draft.type === 'INCOME' ? 'Kirim yozish' : 'Xarajat yozish';

  return (
    <NmDialog open={open} onOpenChange={onOpenChange} title={title}>
      {step === 'form' ? (
        <EntryFormStep draft={draft} errors={errors} editing={!!editId} onChange={(p) => setDraft({ ...draft, ...p })} />
      ) : (
        <EntrySummaryStep
          heading={`${draft.type === 'INCOME' ? 'KIRIM' : 'CHIQIM'}${category ? ` · ${category.toLocaleUpperCase('uz')}` : ''}`}
          sign={draft.type === 'INCOME' ? '+' : '−'}
          amount={amount}
          notice={willQueue ? 'Tasdiq chegarasidan yuqori — direktor tasdiqlagach kassadan chiqadi' : undefined}
          rows={[
            { label: 'Qaysi kassadan', value: draft.method === 'CASH' ? 'Naqd kassa' : 'Karta' },
            { label: draft.type === 'INCOME' ? 'Kimdan' : 'Kimga', value: draft.party.trim() },
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
        {step === 'form' && isDirty(draft) ? (
          <p className="text-[11.5px] font-medium text-muted">Yopilsa, kiritilgan ma&apos;lumot saqlanmaydi.</p>
        ) : null}

        <div className="flex gap-3">
          {step === 'form' ? (
            <>
              <NmButton variant="soft" className="flex-1" onClick={() => onOpenChange(false)}>
                Yopish
              </NmButton>
              <NmButton className="flex-[1.4]" onClick={proceed}>
                Davom etish
              </NmButton>
            </>
          ) : (
            <>
              <NmButton variant="soft" className="flex-1" disabled={saving} onClick={() => setStep('form')}>
                ‹ Orqaga
              </NmButton>
              <NmButton className="flex-[1.6]" disabled={saving} onClick={submit}>
                {saving ? <Loader2 className="size-4 animate-spin" /> : null}
                {saving ? 'Yozilmoqda…' : 'Tasdiqlash va yozish'}
              </NmButton>
            </>
          )}
        </div>
      </div>
    </NmDialog>
  );
}

export { emptyDraft };
