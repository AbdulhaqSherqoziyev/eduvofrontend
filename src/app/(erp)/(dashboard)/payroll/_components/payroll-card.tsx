'use client';

import { Avatar } from '@/components/ui/avatar';
import { formatNumber, formatSom } from '@/lib/utils/format';
import { somOrDash } from '@/lib/utils/payroll-labels';
import type { PeriodLineView } from '@/lib/types/payroll';
import { subjectRole } from './payroll-row';

/** 360px da jadval kartaga aylanadi (§E.9) — gorizontal scroll yo'q. */
export function PayrollCard({ line, onOpen }: { line: PeriodLineView; onOpen: () => void }) {
  const parts: string[] = [];
  if (line.base) parts.push(`asosiy ${formatNumber(line.base)}`);
  if (line.share) parts.push(`ulush ${formatNumber(line.share)}`);
  if (line.bonus) parts.push(`bonus ${formatNumber(line.bonus)}`);
  if (line.adjust) parts.push(`tuzatish ${formatSom(line.adjust, { sign: true })}`);

  return (
    <button
      type="button"
      aria-label={`${line.subjectName}, jami ${formatSom(line.total)} — tafsilot`}
      onClick={onOpen}
      className="flex w-full flex-col gap-2 rounded-ctl border-0 bg-background p-3.5 text-left font-sans shadow-nm-sm nm-pressable"
    >
      <div className="flex items-center gap-3">
        <Avatar name={line.subjectName} size={38} />
        <div className="min-w-0">
          <div className="truncate text-[13.5px] font-bold text-foreground">{line.subjectName}</div>
          <div className="truncate text-[11.5px] font-medium text-muted">{subjectRole(line)}</div>
        </div>
      </div>
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-[12px] font-semibold text-muted">Jami</span>
        <span className="text-[15px] font-extrabold tabular-nums text-foreground">{somOrDash(line.total)}</span>
      </div>
      {parts.length ? <div className="text-[11.5px] font-medium text-muted">{parts.join(' · ')}</div> : null}
    </button>
  );
}
