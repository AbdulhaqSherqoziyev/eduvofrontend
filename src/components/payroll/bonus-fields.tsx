'use client';

import { AmountField } from '@/components/shared/amount-field';
import { NmInput } from '@/components/ui/nm-input';
import { NmSegmented } from '@/components/ui/nm-segmented';
import { NmSwitch } from '@/components/ui/nm-switch';
import { FieldLabel } from '@/components/ui/label';
import type { CompDraft, CompErrors } from './compensation-state';

interface BonusFieldsProps {
  draft: CompDraft;
  errors: CompErrors;
  onChange: (patch: Partial<CompDraft>) => void;
  disabled?: boolean;
}

const KINDS = [
  { value: 'FIXED', label: 'Fiks summa' },
  { value: 'PERCENT', label: "Birinchi to'lov foizi" },
];

/**
 * Yangi o'quvchi bonusi (§A.5) — default O'CHIQ.
 *
 * Ikki jumla majburiy [O3/E5]: bonus innovatsiya emas, risk. Qoidasi
 * aytilmasa "olib kelgan har o'quvchiga" deb tushuniladi, va bu tushunish oy
 * oxirida tuzatilmaydi — u paytda odam allaqachon hisoblab qo'ygan bo'ladi.
 *
 * Default raqam ham ataylab yo'q: taklif qilingan summa kelishuvga aylanadi.
 */
export function BonusFields({ draft, errors, onChange, disabled }: BonusFieldsProps) {
  return (
    <div className="rounded-ctl bg-background p-4 shadow-nm-inset-sm">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[13px] font-bold text-foreground">Yangi o&apos;quvchi bonusi (ixtiyoriy)</span>
        <NmSwitch
          checked={draft.bonusOn}
          disabled={disabled}
          aria-label="Yangi o'quvchi bonusi"
          onCheckedChange={(bonusOn) => onChange({ bonusOn })}
        />
      </div>

      {draft.bonusOn ? (
        <div className="mt-4 flex flex-col gap-4">
          <div>
            <FieldLabel>BONUS TURI</FieldLabel>
            <NmSegmented
              items={KINDS}
              value={draft.bonusKind}
              onValueChange={(v) => onChange({ bonusKind: v as CompDraft['bonusKind'] })}
            />
          </div>

          {draft.bonusKind === 'FIXED' ? (
            <AmountField
              id="bonusAmount"
              label="BONUS SUMMASI"
              value={draft.bonusAmount}
              onChange={(v) => onChange({ bonusAmount: v })}
              disabled={disabled}
              error={errors.bonus}
            />
          ) : (
            <div>
              <FieldLabel htmlFor="bonusPercent">BONUS FOIZI</FieldLabel>
              <div className="relative">
                <NmInput
                  id="bonusPercent"
                  inputMode="numeric"
                  placeholder="0"
                  disabled={disabled}
                  value={draft.bonusPercent}
                  onChange={(e) => onChange({ bonusPercent: e.target.value.replace(/\D/g, '').slice(0, 3) })}
                  className="h-[54px] pr-[46px] text-[20px] font-extrabold text-primary"
                />
                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[15px] font-bold text-muted">
                  %
                </span>
              </div>
              {errors.bonus ? (
                <div className="mt-1.5 text-[11.5px] font-semibold text-danger">{errors.bonus}</div>
              ) : null}
            </div>
          )}

          <p className="text-[11.5px] font-medium leading-[1.45] text-muted">
            Odatda 30 000 – 100 000 so&apos;m yoki birinchi oy to&apos;lovining 5–10% i.
          </p>
          <p className="text-[11.5px] font-medium leading-[1.45] text-muted">
            Bonus o&apos;quvchi BIRINCHI TO&apos;LOVNI qilganda bir marta beriladi. Ro&apos;yxatga olish yoki
            sinov darsi uchun berilmaydi.
          </p>
        </div>
      ) : null}
    </div>
  );
}
