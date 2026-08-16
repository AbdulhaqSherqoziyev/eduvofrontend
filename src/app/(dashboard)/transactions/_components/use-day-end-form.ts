'use client';

import { useEffect, useRef, useState } from 'react';
import { useCloseDay } from '@/lib/hooks/use-cash';
import { useOnline } from '@/lib/hooks/use-online';
import type { DayEndView } from '@/lib/types/cash';
import { nearPending, PENDING_REASON } from './day-end-diff';
import { saveErrorMessage } from './entry-state';

const OFFLINE =
  "Internet yo'q — yakun saqlanmadi. Sanagan summangiz oynada turibdi, aloqa tiklanganda qayta bosing.";

/**
 * The count the cashier types, and everything derived from it.
 *
 * Kept out of the dialog so the screen stays readable: the rules here ([SV3]'s
 * mandatory chip, [SV2]'s pre-selection) are the part worth reading on their
 * own.
 */
export function useDayEndForm(date: string, open: boolean, data?: DayEndView, onDone?: () => void) {
  const [actual, setActual] = useState('');
  const [reason, setReason] = useState('');
  const [note, setNote] = useState('');
  const [missing, setMissing] = useState(false);
  const [failure, setFailure] = useState('');
  const touched = useRef(false);

  const online = useOnline();
  const closeDay = useCloseDay();

  useEffect(() => {
    if (!open) return;
    setActual(''); setReason(''); setNote(''); setMissing(false); setFailure('');
    touched.current = false;
  }, [open, date]);

  const closed = !!data?.closedAt;
  const expected = data?.expectedCash ?? 0;
  const pendingAmount = data?.pending.amount ?? 0;
  const counted = closed ? data?.actualCash ?? 0 : Number(actual || 0);
  const diff = closed ? data?.diff ?? 0 : actual === '' ? null : counted - expected;

  // The one case where the system already knows the answer, so it fills it in
  // instead of asking the cashier to go looking for it [SV2].
  useEffect(() => {
    if (diff === null || touched.current || closed) return;
    if (nearPending(diff, pendingAmount)) setReason(PENDING_REASON);
  }, [diff, pendingAmount, closed]);

  const submit = async () => {
    setFailure('');
    // [SV3]: a difference without a reason is refused by the server too — the
    // button is disabled long before that, this is the belt to its braces.
    if (diff !== 0 && !reason) {
      setMissing(true);
      return;
    }
    if (!online) {
      setFailure(OFFLINE);
      return;
    }
    try {
      await closeDay.mutateAsync({
        date,
        actualCash: counted,
        presetReason: reason || undefined,
        note: note.trim() || undefined,
      });
      onDone?.();
    } catch (e) {
      setFailure(saveErrorMessage(e));
    }
  };

  return {
    actual, setActual, note, setNote, missing, failure, online,
    reason: closed ? data?.presetReason ?? '' : reason,
    pickReason: (v: string) => { touched.current = true; setReason(v); },
    closed, expected, pendingAmount, counted, diff,
    saving: closeDay.isPending,
    blocked: actual === '' || (diff !== 0 && !reason) || closeDay.isPending,
    submit,
  };
}
