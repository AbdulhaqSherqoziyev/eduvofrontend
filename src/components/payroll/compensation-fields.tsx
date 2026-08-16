'use client';

import { AmountField } from '@/components/shared/amount-field';
import { NmInput } from '@/components/ui/nm-input';
import { FieldLabel } from '@/components/ui/label';
import { SCHEME_FIELDS } from '@/lib/utils/payroll-labels';
import type { CompDraft, CompErrors } from './compensation-state';

interface CompensationFieldsProps {
  draft: CompDraft;
  errors: CompErrors;
  onChange: (patch: Partial<CompDraft>) => void;
  disabled?: boolean;
}

/**
 * Tan oylik / foiz / darsbay maydonlari (§A.4).
 *
 * Keraksiz maydon YASHIRILADI, `disabled` qilinmaydi: kulrang turgan maydon ham
 * "bu ham hisobga kiradi" degan taassurot qoldiradi, ayni shu taassurot esa
 * blokdagi eng qimmat xatoning ildizi.
 */
export function CompensationFields({ draft, errors, onChange, disabled }: CompensationFieldsProps) {
  const fields = SCHEME_FIELDS[draft.scheme];

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {fields.base ? (
          <AmountField
            id="baseSalary"
            label="TAN OYLIK"
            value={draft.baseSalary}
            onChange={(v) => onChange({ baseSalary: v })}
            disabled={disabled}
            error={errors.baseSalary}
          />
        ) : null}

        {fields.percent ? (
          <div>
            <FieldLabel htmlFor="revenuePercent">FOIZ</FieldLabel>
            <div className="relative">
              <NmInput
                id="revenuePercent"
                inputMode="numeric"
                placeholder="0"
                disabled={disabled}
                value={draft.revenuePercent}
                onChange={(e) => onChange({ revenuePercent: e.target.value.replace(/\D/g, '').slice(0, 3) })}
                className="h-[54px] pr-[46px] text-[20px] font-extrabold text-primary"
              />
              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[15px] font-bold text-muted">
                %
              </span>
            </div>
            {errors.revenuePercent ? (
              <div className="mt-1.5 text-[11.5px] font-semibold text-danger">{errors.revenuePercent}</div>
            ) : null}
          </div>
        ) : null}

        {/* Maydon bor, lekin `disabled`: dars sonining manbasi hali yo'q, ya'ni
            kiritilgan stavka hech qanday raqamga aylanmaydi [§A.4a, §J.2/1]. */}
        {fields.perLesson ? (
          <AmountField
            id="perLessonRate"
            label="DARSBAY STAVKA"
            value={draft.perLessonRate}
            onChange={(v) => onChange({ perLessonRate: v })}
            disabled
            error={errors.perLessonRate}
          >
            <div className="mt-1.5 text-[11.5px] font-medium text-muted">
              Bu rejim keyingi yangilanishda ochiladi.
            </div>
          </AmountField>
        ) : null}
      </div>

      {/*
        MAJBURIY QATOR (§A.4). [O1] va [D1] ning butun mantiqi shu jumlada:
        direktor buni sozlashda o'qimasa, oy oxirida o'sha savolga ustoz oldida
        tayyorlanmagan holda javob berishi kerak bo'ladi.
      */}
      {fields.percent ? (
        <p className="text-[11.5px] font-medium leading-[1.45] text-muted">
          Foiz o&apos;z guruhlaridan HAQIQATAN TUSHGAN puldan hisoblanadi. To&apos;lov kelmasa, ulush ham
          keyingi oyga o&apos;tadi.
        </p>
      ) : null}
    </div>
  );
}
