'use client';

import { StatusPill } from '@/components/shared/status-pill';
import { FieldLabel } from '@/components/ui/label';
import { cn } from '@/lib/utils/cn';
import { SCHEME_META, SCHEME_ORDER } from '@/lib/utils/payroll-labels';
import type { UiScheme } from '@/lib/types/payroll';

interface SchemePickerProps {
  value: UiScheme;
  onChange: (scheme: UiScheme) => void;
  disabled?: boolean;
}

/**
 * Ish haqi rejimi — beshta nomlangan sxema (§A.3).
 *
 * `NmSegmented` emas: 360px da beshta segment o'qilmaydi, ikkinchi qatordagi
 * izoh esa shu blokda nomning o'zidan muhimroq — `Oylik yoki foiz — kattasi`
 * va `Oylik va foiz qo'shiladi` farqi bitta so'zda (`yoki` / `va`), va uni
 * ajratadigan narsa izohdagi inkor: `Ikkalasi qo'shilmaydi.` / `qo'shiladi` [SV4].
 *
 * `Darsbay` ro'yxatdan olib tashlanmaydi, `disabled` qilinadi: katalogning
 * sotuv matni ("dars soniga qarab") uni va'da qiladi, lekin dars sonining
 * manbasi hali yozilmagan — `Lesson` / `Attendance` / qo'lda uch xil raqam
 * beradi [§A.4a, §J.2/1].
 */
export function SchemePicker({ value, onChange, disabled }: SchemePickerProps) {
  return (
    <div>
      <FieldLabel>ISH HAQI REJIMI</FieldLabel>
      <div className="flex flex-col gap-2.5" role="radiogroup" aria-label="Ish haqi rejimi">
        {SCHEME_ORDER.map((scheme) => {
          const meta = SCHEME_META[scheme];
          const locked = scheme === 'PER_LESSON';
          const active = scheme === value;
          return (
            <div key={scheme}>
              <button
                type="button"
                role="radio"
                aria-checked={active}
                disabled={disabled || locked}
                onClick={() => onChange(scheme)}
                className={cn(
                  'flex min-h-[58px] w-full flex-col justify-center gap-0.5 rounded-ctl border-0 bg-background',
                  'px-4 py-2.5 text-left font-sans transition-all',
                  active ? 'shadow-nm-inset-sm' : 'shadow-nm-sm',
                  !active && !locked && !disabled ? 'nm-pressable' : '',
                  locked ? 'cursor-default opacity-60' : '',
                )}
              >
                <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className={cn('text-[13.5px] font-bold', active ? 'text-primary' : 'text-[#5b6b82]')}>
                    {meta.label}
                  </span>
                  {scheme === 'GUARANTEE' ? (
                    <StatusPill label="TAVSIYA ETILADI" tone="primary" className="px-2 py-[3px] text-[11px]" />
                  ) : null}
                </span>
                <span className="text-[11.5px] font-medium leading-[1.35] text-muted">
                  {locked ? 'Bu rejim keyingi yangilanishda ochiladi.' : meta.hint}
                </span>
              </button>
              {scheme === 'GUARANTEE' ? (
                <p className="mt-1.5 px-1 text-[11.5px] font-medium leading-[1.4] text-muted">
                  Ko&apos;pchilik markaz shu rejimda ishlaydi — markazga xona, administrator va reklama uchun
                  ulush qoladi.
                </p>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
