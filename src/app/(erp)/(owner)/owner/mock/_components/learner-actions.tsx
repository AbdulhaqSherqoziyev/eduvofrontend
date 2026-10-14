'use client';
/** Owner actions on a learner: grant / revoke credits (ledger ADMIN_ADJUST / ADMIN_REVOKE), lock / unlock. */
import { useState } from 'react';
import { NmButton } from '@/components/ui/nm-button';
import { NmInput } from '@/components/ui/nm-input';
import { NmSelect } from '@/components/ui/nm-select';
import { NmTextarea } from '@/components/ui/nm-textarea';
import { FieldLabel } from '@/components/ui/label';
import { useGrant, useLock, useRevoke } from '@/lib/hooks/use-owner-mock';
import type { MockCreditKind, MockExam, OwnerLearner } from '@/lib/types/owner-mock';
import { ActionDialog } from './action-dialog';
import { KIND, mockErrorText } from './format';

type Open = null | 'grant' | 'revoke' | 'lock';

export function LearnerActions({ learner: l }: { learner: OwnerLearner }) {
  const [open, setOpen] = useState<Open>(null);
  const [exam, setExam] = useState<MockExam>('ielts');
  const [kind, setKind] = useState<MockCreditKind>('full');
  const [qty, setQty] = useState('1');
  const [months, setMonths] = useState('12');
  const [reason, setReason] = useState('');
  const [err, setErr] = useState('');
  const [done, setDone] = useState('');
  const locked = l.status === 'LOCKED';
  const grant = useGrant(l.id);
  const revoke = useRevoke(l.id);
  const lock = useLock(l.id, locked);
  if (l.status === 'DELETED') return null;

  const n = Number(qty);
  const m = Number(months);
  const qtyOk = Number.isInteger(n) && n >= 1 && n <= 50;
  const monthsOk = kind === 'unlimited' || (Number.isInteger(m) && m >= 1 && m <= 24);
  const reasonOk = reason.trim().length >= 1;
  const show = (k: Open) => { setErr(''); setReason(''); setQty('1'); setMonths('12'); setOpen(k); };
  const run = async (fn: () => Promise<string>) => {
    setErr('');
    try { const msg = await fn(); setOpen(null); setDone(msg); } catch (e) { setErr(mockErrorText(e)); }
  };

  const creditFields = (withMonths: boolean) => (
    <>
      <div className="grid grid-cols-2 gap-3">
        <div><FieldLabel htmlFor="la-exam">Imtihon</FieldLabel>
          <NmSelect id="la-exam" value={exam} onChange={(e) => setExam(e.target.value as MockExam)}><option value="ielts">IELTS</option><option value="sat">SAT</option></NmSelect></div>
        <div><FieldLabel htmlFor="la-kind">Turi</FieldLabel>
          <NmSelect id="la-kind" value={kind} onChange={(e) => setKind(e.target.value as MockCreditKind)}>
            {(['full', 'section', 'unlimited'] as const).map((k) => <option key={k} value={k}>{KIND[k]}</option>)}
          </NmSelect></div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div><FieldLabel htmlFor="la-qty">{kind === 'unlimited' ? 'Necha 30 kunlik' : 'Soni'} (1–50)</FieldLabel><NmInput id="la-qty" inputMode="numeric" value={qty} onChange={(e) => setQty(e.target.value)} aria-invalid={!qtyOk} /></div>
        {withMonths && kind !== 'unlimited' && <div><FieldLabel htmlFor="la-m">Amal qilish, oy (1–24)</FieldLabel><NmInput id="la-m" inputMode="numeric" value={months} onChange={(e) => setMonths(e.target.value)} aria-invalid={!monthsOk} /></div>}
      </div>
      <div><FieldLabel htmlFor="la-reason">Sabab (majburiy)</FieldLabel><NmTextarea id="la-reason" value={reason} onChange={(e) => setReason(e.target.value)} maxLength={300} rows={2} /></div>
    </>
  );

  return (
    <div className="flex flex-col gap-2 border-t border-[rgba(122,134,153,0.18)] pt-4">
      {done ? <p role="status" className="text-[13px] font-semibold text-success">{done}</p> : null}
      <div className="flex flex-wrap gap-2.5">
        <NmButton size="sm" onClick={() => show('grant')} disabled={locked}>Kredit berish</NmButton>
        <NmButton size="sm" variant="soft" onClick={() => show('revoke')}>Kreditni olish</NmButton>
        <NmButton size="sm" variant={locked ? 'soft' : 'danger'} onClick={() => show('lock')}>{locked ? 'Blokdan chiqarish' : 'Bloklash'}</NmButton>
      </div>

      <ActionDialog open={open === 'grant'} onOpenChange={(v) => !v && setOpen(null)} tone="primary" title="Kredit berish"
        message="Kredit darhol o'quvchi balansiga tushadi (ledger: owner berdi). Pul olinmaydi."
        confirmLabel="Berish" pending={grant.isPending} error={err} disabled={!qtyOk || !monthsOk || !reasonOk}
        onConfirm={() => void run(async () => {
          await grant.mutateAsync({ exam, kind, qty: n, validityMonths: kind === 'unlimited' ? undefined : m, reason: reason.trim() });
          return `${n} ta ${KIND[kind].toLowerCase()} krediti berildi.`;
        })}>
        {creditFields(true)}
      </ActionDialog>

      <ActionDialog open={open === 'revoke'} onOpenChange={(v) => !v && setOpen(null)} title="Kreditni olish"
        message="Ko'rsatilgan miqdor balansdan olinadi — yetmasa hech narsa olinmaydi. Cheksiz pass olinsa, u hozir tugaydi."
        confirmLabel="Olish" pending={revoke.isPending} error={err} disabled={!qtyOk || !reasonOk}
        onConfirm={() => void run(async () => { const r = await revoke.mutateAsync({ exam, kind, qty: n, reason: reason.trim() }); return `${r.revoked} ta kredit olindi.`; })}>
        {creditFields(false)}
      </ActionDialog>

      <ActionDialog open={open === 'lock'} onOpenChange={(v) => !v && setOpen(null)} tone={locked ? 'primary' : 'danger'}
        title={locked ? 'Blokdan chiqarish' : "O'quvchini bloklash"}
        message={locked ? "O'quvchi yana kira oladi va kreditlaridan foydalanadi." : "Barcha sessiyalar darhol tugaydi, o'quvchi kira olmaydi. Kreditlar va natijalar saqlanadi."}
        confirmLabel={locked ? 'Blokdan chiqarish' : 'Bloklash'} pending={lock.isPending} error={err} disabled={!reasonOk}
        onConfirm={() => void run(async () => { await lock.mutateAsync(reason.trim()); return locked ? 'Blokdan chiqarildi.' : 'Bloklandi.'; })}>
        <div><FieldLabel htmlFor="la-lr">Sabab (majburiy)</FieldLabel><NmTextarea id="la-lr" value={reason} onChange={(e) => setReason(e.target.value)} maxLength={300} rows={2} /></div>
      </ActionDialog>
    </div>
  );
}
