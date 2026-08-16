'use client';

import { useState } from 'react';
import { NmDialog } from '@/components/ui/nm-dialog';
import { NmButton } from '@/components/ui/nm-button';
import { NmSegmented } from '@/components/ui/nm-segmented';
import { NmTextarea } from '@/components/ui/nm-textarea';
import { FieldLabel } from '@/components/ui/label';
import { AmountField } from '@/components/shared/amount-field';
import { ReasonChips } from '@/components/shared/reason-chips';
import { useAdjustLine } from '@/lib/hooks/use-payroll';
import { apiErrorMessage } from '@/lib/utils/api-error';
import type { PeriodLineView } from '@/lib/types/payroll';

/**
 * Tuzatish sabablari (§E.5).
 *
 * `Jarima` va `Ushlab qolindi` chiplari YO'Q [§F.1]: v1 da jarima degan tuzatish
 * umuman mavjud emas, va "ushlab qolindi" xodimga aybdorlik ohangida yetib
 * boradi. `Kech kelgan` o'rniga `Keyin tushgan` — birinchisi kimningdir aybini
 * bildiradi, ikkinchisi faktni.
 */
const REASONS = [
  "Keyin tushgan to'lov",
  'Kelishilgan ustama',
  'Oldindan berilgan avans',
  "Keyingi oyga o'tdi",
  'Boshqa',
];

interface AdjustDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  line: PeriodLineView;
  onDone: () => void;
}

export function AdjustDialog({ open, onOpenChange, line, onDone }: AdjustDialogProps) {
  const [sign, setSign] = useState<'PLUS' | 'MINUS'>('PLUS');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const adjust = useAdjustLine();

  const minus = sign === 'MINUS';

  const onSubmit = async () => {
    if (!Number(amount)) return setError('Summani kiriting.');
    if (!reason) return setError('Sababni tanlang.');
    // Sababi aytilmasa xodim uni o'zi o'ylab topadi, va bu deyarli doim
    // haqiqatdan yomonroq bo'ladi.
    if (minus && !note.trim()) {
      return setError("Ayiriladigan tuzatishda izoh majburiy — xodim uni o'z ekranida ko'radi.");
    }
    setError(null);
    try {
      await adjust.mutateAsync({
        lineId: line.id,
        input: { amount: minus ? -Number(amount) : Number(amount), reason, note: note.trim() || undefined },
      });
      setAmount('');
      setReason('');
      setNote('');
      onDone();
    } catch (e) {
      setError(apiErrorMessage(e, "Tuzatish saqlanmadi — qayta urinib ko'ring."));
    }
  };

  return (
    <NmDialog open={open} onOpenChange={onOpenChange} title="Tuzatish qo'shish">
      <div className="flex flex-col gap-4">
        <div>
          <FieldLabel>TUR</FieldLabel>
          <NmSegmented
            items={[
              { value: 'PLUS', label: "Qo'shiladi" },
              { value: 'MINUS', label: 'Ayiriladi' },
            ]}
            value={sign}
            onValueChange={(v) => setSign(v as 'PLUS' | 'MINUS')}
          />
        </div>

        <AmountField id="adjustAmount" label="SUMMA" value={amount} onChange={setAmount} />

        <div>
          <FieldLabel>SABAB</FieldLabel>
          <ReasonChips options={REASONS} value={reason} onChange={setReason} />
        </div>

        <div>
          <FieldLabel htmlFor="adjustNote">IZOH</FieldLabel>
          <NmTextarea
            id="adjustNote"
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={minus ? 'Sababini yozing' : 'Ixtiyoriy'}
          />
        </div>

        <p className="text-[11.5px] font-medium text-muted">
          Bu qator xodimning ekranida alohida ko&apos;rinadi.
        </p>
        {error ? <p className="text-[11.5px] font-semibold text-danger">{error}</p> : null}

        <div className="sticky bottom-0 flex gap-3 bg-background pt-1">
          <NmButton variant="soft" className="flex-1" onClick={() => onOpenChange(false)}>
            Yopish
          </NmButton>
          <NmButton className="flex-[1.4]" disabled={adjust.isPending} onClick={onSubmit}>
            {adjust.isPending ? 'Saqlanmoqda…' : "Qo'shish"}
          </NmButton>
        </div>
      </div>
    </NmDialog>
  );
}
