'use client';
/**
 * Manual-payment decisions on one order: "To'landi" (mark-paid), "Rad etish" (mark-failed),
 * "Qaytarish" (refund). Shown only where the API can accept them; the API's 409s are still
 * explained in Uzbek (someone else may have decided in the meantime).
 */
import { useState } from 'react';
import { NmButton } from '@/components/ui/nm-button';
import { NmInput } from '@/components/ui/nm-input';
import { NmSelect } from '@/components/ui/nm-select';
import { NmTextarea } from '@/components/ui/nm-textarea';
import { FieldLabel } from '@/components/ui/label';
import { useMarkFailed, useMarkPaid, useRefund } from '@/lib/hooks/use-owner-mock';
import type { OwnerOrder } from '@/lib/types/owner-mock';
import { ActionDialog } from './action-dialog';
import { fmtMoney, mockErrorText } from './format';

type Open = null | 'paid' | 'failed' | 'refund';

export function OrderActions({ order: o }: { order: OwnerOrder }) {
  const [open, setOpen] = useState<Open>(null);
  const [note, setNote] = useState('');
  const [ref, setRef] = useState('');
  const [amount, setAmount] = useState('');
  const [code, setCode] = useState<'DECLINED' | 'EXPIRED'>('DECLINED');
  const [err, setErr] = useState('');
  const paid = useMarkPaid(o.id);
  const failed = useMarkFailed(o.id);
  const refund = useRefund(o.id);
  const [done, setDone] = useState('');

  const manual = o.provider === 'manual';
  // contract §12: mark-paid also accepts a late payment on CANCELLED / FAILED manual orders
  const canPay = manual && ['PENDING', 'CANCELLED', 'FAILED'].includes(o.status);
  const canFail = o.status === 'PENDING';
  const canRefund = o.status === 'PAID';
  const show = (k: Open) => { setErr(''); setNote(''); setRef(''); setAmount(''); setOpen(k); };
  const total = o.quote.total;
  const exp = total.currency === 'UZS' ? 0 : 2;

  const run = async (fn: () => Promise<unknown>, msg: string) => {
    setErr('');
    try { const r = await fn(); setOpen(null); setDone(typeof r === 'string' ? r : msg); } catch (e) { setErr(mockErrorText(e)); }
  };
  const amountMinor = amount.trim() ? Math.round(Number(amount.replace(/\s/g, '').replace(',', '.')) * 10 ** exp) : undefined;

  if (!canPay && !canFail && !canRefund) return done ? <p className="text-[13px] font-semibold text-success">{done}</p> : null;
  return (
    <div className="flex flex-col gap-2 border-t border-[rgba(122,134,153,0.18)] pt-4">
      {done ? <p role="status" className="text-[13px] font-semibold text-success">{done}</p> : null}
      <div className="flex flex-wrap gap-2.5">
        {canPay && <NmButton size="sm" onClick={() => show('paid')}>To&apos;landi</NmButton>}
        {canFail && <NmButton size="sm" variant="soft" onClick={() => show('failed')}>Rad etish</NmButton>}
        {canRefund && <NmButton size="sm" variant="danger" onClick={() => show('refund')}>Qaytarish</NmButton>}
      </div>
      {!manual && canRefund && <p className="text-[12px] font-medium text-muted">Paddle buyurtmasi Paddle panelida qaytariladi — kreditlarni webhook o&apos;zi oladi.</p>}

      <ActionDialog open={open === 'paid'} onOpenChange={(v) => !v && setOpen(null)} tone="primary" title="To'lovni tasdiqlash"
        message={`${fmtMoney(total)} ${o.reference} kodi bilan kelganini tekshirdingizmi? Tasdiqlansa kreditlar darhol beriladi, o'quvchiga kvitansiya xati ketadi.`}
        confirmLabel="To'landi" pending={paid.isPending} error={err}
        onConfirm={() => void run(() => paid.mutateAsync({ note: note.trim() || undefined, providerRef: ref.trim() || undefined, amountMinor }), "To'lov tasdiqlandi, kreditlar berildi.")}>
        <div><FieldLabel htmlFor="mp-amount">Kelgan summa ({total.currency}, ixtiyoriy)</FieldLabel><NmInput id="mp-amount" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder={fmtMoney(total)} /></div>
        <div><FieldLabel htmlFor="mp-ref">To&apos;lov ID (bank/Click, ixtiyoriy)</FieldLabel><NmInput id="mp-ref" value={ref} onChange={(e) => setRef(e.target.value)} maxLength={120} /></div>
        <div><FieldLabel htmlFor="mp-note">Izoh (ixtiyoriy)</FieldLabel><NmTextarea id="mp-note" value={note} onChange={(e) => setNote(e.target.value)} maxLength={500} rows={2} /></div>
      </ActionDialog>

      <ActionDialog open={open === 'failed'} onOpenChange={(v) => !v && setOpen(null)} title="Buyurtmani rad etish"
        message="Pul kelmagan bo'lsa rad eting. O'quvchi «To'lovni tasdiqlay olmadik» ekranini ko'radi, kredit berilmaydi."
        confirmLabel="Rad etish" pending={failed.isPending} error={err}
        onConfirm={() => void run(() => failed.mutateAsync({ failureCode: code, note: note.trim() || undefined }), 'Buyurtma rad etildi.')}>
        <div><FieldLabel htmlFor="mf-code">Sabab</FieldLabel>
          <NmSelect id="mf-code" value={code} onChange={(e) => setCode(e.target.value as 'DECLINED' | 'EXPIRED')}>
            <option value="DECLINED">To&apos;lov kelmadi / rad etildi</option>
            <option value="EXPIRED">Muddati o&apos;tdi</option>
          </NmSelect></div>
        <div><FieldLabel htmlFor="mf-note">Izoh (ixtiyoriy)</FieldLabel><NmTextarea id="mf-note" value={note} onChange={(e) => setNote(e.target.value)} maxLength={500} rows={2} /></div>
      </ActionDialog>

      <ActionDialog open={open === 'refund'} onOpenChange={(v) => !v && setOpen(null)} title="Pulni qaytarish"
        message={`Ishlatilmagan kreditlar olinadi, buyurtma «Qaytarilgan» bo'ladi. ${fmtMoney(total)} ni o'quvchiga qo'lda qaytarishingiz kerak — tizim pul o'tkazmaydi.`}
        confirmLabel="Qaytarish" pending={refund.isPending} error={err} disabled={note.trim().length < 3}
        onConfirm={() => void run(async () => {
          const r = await refund.mutateAsync(note.trim());
          return `Qaytarildi. Olingan kreditlar: ${r.revoked}${r.alreadyUsed ? `, ishlatib bo'lingan: ${r.alreadyUsed}` : ''}.`;
        }, 'Qaytarildi.')}>
        <div><FieldLabel htmlFor="rf-note">Sabab (majburiy, 3–500 belgi)</FieldLabel><NmTextarea id="rf-note" value={note} onChange={(e) => setNote(e.target.value)} maxLength={500} rows={3} /></div>
      </ActionDialog>
    </div>
  );
}
