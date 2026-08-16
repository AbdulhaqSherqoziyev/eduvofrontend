'use client';

import { NmInput } from '@/components/ui/nm-input';
import { NmSelect } from '@/components/ui/nm-select';
import { NmTextarea } from '@/components/ui/nm-textarea';
import { FieldLabel } from '@/components/ui/label';
import { formatSom } from '@/lib/utils/format';
import { isoDay } from '@/lib/utils/tx-display';
import { AmountField } from '@/components/shared/amount-field';

export const TRANSFER_TARGETS = ['Bank', 'Direktor', 'Boshqa'];

export interface TransferDraft {
  amount: string;
  target: string;
  other: string;
  date: string;
  note: string;
}

interface TransferFormProps {
  draft: TransferDraft;
  onChange: (patch: Partial<TransferDraft>) => void;
  /** Cash actually in the drawer — the ceiling for this entry. */
  cash: number;
  tooMuch: boolean;
}

/** §E.1 — the "Pul topshirish" form. */
export function TransferForm({ draft, onChange, cash, tooMuch }: TransferFormProps) {
  return (
    <div className="flex flex-col gap-5">
      <p className="rounded-ctl bg-background p-3 text-[12px] font-medium text-muted shadow-nm-inset-sm">
        Bu xarajat emas — pul markazdan chiqmaydi, faqat joyini o&apos;zgartiradi.
      </p>

      <AmountField
        label="SUMMA"
        value={draft.amount}
        onChange={(v) => onChange({ amount: v })}
        autoFocus
        // Validation copy is one of the only two places red is allowed (§0.8/a):
        // money that is not in the drawer cannot be handed over, and letting it
        // through would leave a negative balance and a broken count after it.
        error={tooMuch ? `Naqd kassada ${formatSom(cash)} bor.` : undefined}
      >
        <div className="mt-1.5 text-[11.5px] font-medium text-muted">Naqd kassada: {formatSom(cash)}</div>
        {cash === 0 ? (
          <div className="mt-1.5 text-[11.5px] font-medium text-muted">
            Naqd kassa bo&apos;sh — topshirish uchun pul yo&apos;q.
          </div>
        ) : null}
      </AmountField>

      <div>
        <FieldLabel htmlFor="transfer-target">KIMGA</FieldLabel>
        <NmSelect id="transfer-target" value={draft.target} onChange={(e) => onChange({ target: e.target.value })}>
          {TRANSFER_TARGETS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </NmSelect>
        {draft.target === 'Boshqa' ? (
          <NmInput
            className="mt-2.5"
            maxLength={120}
            placeholder="Kimga topshirildi?"
            value={draft.other}
            onChange={(e) => onChange({ other: e.target.value })}
          />
        ) : null}
      </div>

      <div>
        <FieldLabel htmlFor="transfer-date">SANA</FieldLabel>
        <NmInput
          id="transfer-date"
          type="date"
          max={isoDay()}
          value={draft.date}
          onChange={(e) => onChange({ date: e.target.value })}
        />
      </div>

      <div>
        <FieldLabel htmlFor="transfer-note">IZOH (IXTIYORIY)</FieldLabel>
        <NmTextarea
          id="transfer-note"
          rows={2}
          maxLength={500}
          value={draft.note}
          onChange={(e) => onChange({ note: e.target.value })}
        />
      </div>

      <p className="text-[11.5px] font-medium text-muted">
        Kartadagi pul topshirilmaydi — u allaqachon bankda. Naqd kassadan chiqadi. Sof foydaga ta&apos;sir
        qilmaydi.
      </p>
    </div>
  );
}
