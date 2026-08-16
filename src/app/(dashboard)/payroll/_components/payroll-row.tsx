'use client';

import { ChevronRight } from 'lucide-react';
import { RowIndex } from '@/components/shared/row-index';
import { formatNumber, formatSom } from '@/lib/utils/format';
import { somOrDash, somSigned } from '@/lib/utils/payroll-labels';
import type { PeriodLineView } from '@/lib/types/payroll';

export const PAYROLL_GRID =
  'grid grid-cols-[34px_1fr_1.2fr_20px] xl:grid-cols-[40px_2.4fr_1.2fr_1.2fr_1.3fr_1.3fr_24px] items-center gap-3';

/** Ikkinchi satr: rol va (ustunlar yig'ilganda) summalar tarkibi. */
export function subjectRole(line: PeriodLineView): string {
  return line.subjectType === 'TEACHER' ? "o'qituvchi" : 'xodim';
}

/** `QO'SHIMCHA` ustunining ikkinchi satri — bonusmi, tuzatishmi (§E.4). */
export function extraKind(line: PeriodLineView): string {
  const parts: string[] = [];
  if (line.bonus > 0) parts.push('bonus');
  if (line.adjust !== 0) parts.push('tuzatish');
  return parts.join(' · ');
}

/** Yig'ilgan ko'rinishdagi summalar satri. */
function foldedSums(line: PeriodLineView): string {
  const parts: string[] = [];
  if (line.base) parts.push(`asosiy ${formatNumber(line.base)}`);
  if (line.share) parts.push(`ulush ${formatNumber(line.share)}`);
  if (line.bonus) parts.push(`bonus ${formatNumber(line.bonus)}`);
  if (line.adjust) parts.push(`tuzatish ${formatSom(line.adjust, { sign: true })}`);
  return parts.join(' · ');
}

interface PayrollRowProps {
  line: PeriodLineView;
  index: number;
  onOpen: () => void;
}

/** Jadval qatori — bosiladi va xodim detalini ochadi (§E.4). */
export function PayrollRow({ line, index, onOpen }: PayrollRowProps) {
  return (
    <button
      type="button"
      role="button"
      aria-label={`${line.subjectName}, jami ${formatSom(line.total)} — tafsilot`}
      onClick={onOpen}
      className={`${PAYROLL_GRID} min-h-[56px] w-full rounded-ctl border-0 bg-background px-3 py-2 text-left font-sans shadow-nm-sm nm-pressable`}
    >
      <RowIndex n={index} />

      <div className="min-w-0">
        <div className="truncate text-[13.5px] font-bold text-foreground">{line.subjectName}</div>
        <div className="truncate text-[11.5px] font-medium text-muted">
          {subjectRole(line)}
          <span className="xl:hidden">{foldedSums(line) ? ` · ${foldedSums(line)}` : ''}</span>
        </div>
      </div>

      <div className="hidden text-right text-[13px] font-bold tabular-nums text-foreground xl:block">
        {somOrDash(line.base)}
      </div>
      <div className="hidden text-right text-[13px] font-bold tabular-nums text-foreground xl:block">
        {somOrDash(line.share)}
      </div>
      <div className="hidden text-right xl:block">
        <div className="text-[13px] font-bold tabular-nums text-foreground">
          {line.bonus + line.adjust ? somSigned(line.bonus + line.adjust) : '—'}
        </div>
        {extraKind(line) ? <div className="text-[11px] font-medium text-muted">{extraKind(line)}</div> : null}
      </div>

      <div className="text-right text-[14px] font-extrabold tabular-nums text-foreground">
        {somOrDash(line.total)}
      </div>
      <ChevronRight className="size-4 text-muted" strokeWidth={2.2} />
    </button>
  );
}
