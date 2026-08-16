'use client';

import { useState } from 'react';
import { NmButton } from '@/components/ui/nm-button';
import { NmTextarea } from '@/components/ui/nm-textarea';
import { FieldLabel } from '@/components/ui/label';
import { Can } from '@/components/shared/can';
import { useUpdateDayNote } from '@/lib/hooks/use-cash';
import { apiErrorMessage } from '@/lib/utils/api-error';

interface ClosedDayNoteProps {
  id: string;
  note: string;
}

/**
 * §D.5 — the one thing still open on a day that has been signed.
 *
 * The figures are settled and stay that way: the difference row went into the
 * ledger with them, and changing money means reopening the day. But `Keyin
 * aniqlanadi` is a real answer at 20:30, and the cashier who works out at ten
 * the next morning what the 20 000 was needs somewhere to put it. Only the
 * sentence changes.
 *
 * There is no cancel button on purpose: the dialog's own `Yopish` already
 * means "leave", and a second button carrying the same word one level down
 * would give it two scopes on one screen (§0.6).
 */
export function ClosedDayNote({ id, note }: ClosedDayNoteProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(note);
  const [error, setError] = useState('');
  const save = useUpdateDayNote();

  const submit = async () => {
    setError('');
    try {
      await save.mutateAsync({ id, note: draft.trim() });
      setEditing(false);
    } catch (e) {
      setError(apiErrorMessage(e, "Server javob bermadi. Yozuv saqlanmadi — qayta urinib ko'ring."));
    }
  };

  if (!editing) {
    return (
      <div className="flex flex-col items-start gap-2.5">
        {note ? <p className="text-[12.5px] font-medium text-muted">{note}</p> : null}
        <Can permission="transaction.create">
          <NmButton
            variant="soft"
            size="sm"
            onClick={() => {
              setDraft(note);
              setEditing(true);
            }}
          >
            Izoh qo&apos;shish
          </NmButton>
        </Can>
      </div>
    );
  }

  return (
    <div>
      <FieldLabel htmlFor="day-note">IZOH (IXTIYORIY)</FieldLabel>
      <NmTextarea
        id="day-note"
        rows={2}
        maxLength={500}
        autoFocus
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
      />
      {error ? <p className="mt-1.5 text-[11.5px] font-semibold text-danger">{error}</p> : null}
      <NmButton size="sm" className="mt-2.5 w-full" disabled={save.isPending} onClick={submit}>
        {save.isPending ? 'Saqlanmoqda…' : 'Saqlash'}
      </NmButton>
    </div>
  );
}
