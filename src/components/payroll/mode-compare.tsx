'use client';

import { formatNumber } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';
import type { CombineMode, Split } from '@/lib/types/payroll';
import { LOW_MARGIN_RATIO } from './preview-text';

interface ModeCompareProps {
  byMode: Record<CombineMode, Split>;
  revenue: number;
  value: CombineMode;
  onChange: (mode: CombineMode) => void;
}

const ROWS: Array<{ mode: CombineMode; label: string }> = [
  { mode: 'GUARANTEE', label: 'Kattasi olinadi' },
  { mode: 'SUM', label: "Qo'shiladi" },
];

/**
 * Ikki rejim farqi — tanlagichning o'zi (§B.3).
 *
 * Qatorning o'zi radio: direktor "qaysi biri arzon?" savoliga javobni ko'rgan
 * joyidan tanlaydi, tepaga qaytib rejim ro'yxatidan qidirmaydi.
 *
 * Past ulush qatori OGOHLANTIRISH EMAS, fakt: direktor markazning egasi, va
 * "xato qilyapsan" ohangi uni himoyaga o'tkazadi — o'shanda u qatorni o'qimay
 * yopadi. Shuning uchun rangsiz, ikonkasiz, faqat raqam va nima uchun ketishi.
 */
export function ModeCompare({ byMode, revenue, value, onChange }: ModeCompareProps) {
  const center = byMode[value]?.center ?? 0;
  const lowMargin = revenue > 0 && center > 0 && center / revenue < LOW_MARGIN_RATIO;

  return (
    <div className="mt-4">
      <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.7px] text-muted">Ikki rejim farqi</div>

      <div className="mb-1.5 hidden grid-cols-[1fr_auto_auto] gap-4 px-4 text-[11px] font-bold text-muted sm:grid">
        <span />
        <span className="w-[104px] text-right">Ustozga</span>
        <span className="w-[124px] text-right">Markazga qoladi</span>
      </div>

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-1" role="radiogroup" aria-label="Ikki rejim farqi">
        {ROWS.map(({ mode, label }) => {
          const split = byMode[mode] ?? { staff: 0, center: 0 };
          const active = mode === value;
          return (
            <button
              key={mode}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(mode)}
              className={cn(
                'flex min-h-[68px] flex-col justify-center gap-1 rounded-ctl border-0 bg-background px-4 py-3',
                'text-left font-sans text-[12.5px] font-bold transition-all',
                'sm:grid sm:min-h-[52px] sm:grid-cols-[1fr_auto_auto] sm:items-center sm:gap-4',
                active ? 'text-primary shadow-nm-inset-sm' : 'text-[#5b6b82] shadow-nm-sm nm-pressable',
              )}
            >
              <span>{label}</span>
              <span className="tabular-nums text-foreground sm:w-[104px] sm:text-right">
                <span className="text-muted sm:hidden">Ustozga </span>
                {formatNumber(split.staff)}
              </span>
              <span className="tabular-nums text-foreground sm:w-[124px] sm:text-right">
                <span className="text-muted sm:hidden">Markazga </span>
                {formatNumber(split.center)}
              </span>
            </button>
          );
        })}
      </div>

      {lowMargin ? (
        <p className="mt-2.5 text-[11.5px] font-medium leading-[1.45] text-foreground">
          {/* Pastga yumaloqlash: 12,5% ni "13%" deb ko'rsatish markaz ulushini
              bor-yo'g'idan kattaroq qilib ko'rsatadi — bu qator aynan buning
              teskarisi uchun yozilgan (§I/13 dagi "12% i"). */}
          Bu rejimda markazga {formatNumber(center)} so&apos;m qoladi — tushumning{' '}
          {Math.floor((center / revenue) * 100)}% i. Xona, administrator va reklama shu summadan chiqadi.
        </p>
      ) : null}
    </div>
  );
}
