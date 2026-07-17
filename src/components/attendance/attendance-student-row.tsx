'use client';

import { Check, Clock, FileQuestion, X } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { RowIndex } from '@/components/shared/row-index';
import { cn } from '@/lib/utils/cn';
import type { AttendanceStatus } from '@/lib/types/attendance';
import type { LocalMark } from '@/lib/hooks/use-attendance-marks';

interface RowProps {
  n: number;
  fullName: string;
  mark?: LocalMark;
  onStatus: (status: AttendanceStatus) => void;
  onLate: (delta: number) => void;
}

const BTN = 'flex flex-1 items-center justify-center gap-2 h-[46px] rounded-[13px] border-0 font-sans text-[13.5px] font-bold transition-all nm-pressable';
function btn(active: boolean, color: string) {
  return cn(BTN, active ? `${color} shadow-nm-inset-sm` : 'text-[#9aa6b8] shadow-nm-sm');
}

/** One student's marking row: Keldi / Kechikdi / Kelmadi + late counter. */
export function AttendanceStudentRow({ n, fullName, mark, onStatus, onLate }: RowProps) {
  const status = mark?.status ?? 'PRESENT';
  return (
    <div className="rounded-[18px] bg-background p-3.5 shadow-nm-sm">
      <div className="mb-3.5 flex items-center gap-3">
        <RowIndex n={n} />
        <Avatar name={fullName} size={40} />
        <div className="min-w-0 flex-1 truncate text-[15px] font-bold text-foreground">{fullName}</div>
      </div>
      <div className="flex gap-2.5">
        <button type="button" className={btn(status === 'PRESENT', 'text-success')} onClick={() => onStatus('PRESENT')}>
          <Check className="size-4" strokeWidth={2.6} /> Keldi
        </button>
        <button type="button" className={btn(status === 'LATE', 'text-warning')} onClick={() => onStatus('LATE')}>
          <Clock className="size-4" strokeWidth={2.2} /> Kechikdi
        </button>
        <button type="button" className={btn(status === 'ABSENT', 'text-danger')} onClick={() => onStatus('ABSENT')}>
          <X className="size-4" strokeWidth={2.6} /> Kelmadi
        </button>
        <button type="button" className={btn(status === 'EXCUSED', 'text-muted')} onClick={() => onStatus('EXCUSED')}>
          <FileQuestion className="size-4" strokeWidth={2.2} /> Sababli
        </button>
      </div>
      {status === 'LATE' ? (
        <div className="mt-3 flex items-center justify-between rounded-[15px] bg-background px-2.5 py-2 shadow-nm-inset-sm">
          <span className="text-[12.5px] font-bold text-warning">Kechikish vaqti</span>
          <div className="flex items-center gap-2">
            <button type="button" aria-label="−5" className="flex size-9 items-center justify-center rounded-[11px] bg-background text-[18px] font-bold text-warning shadow-nm-sm" onClick={() => onLate(-5)}>−</button>
            <span className="w-14 text-center text-[14px] font-extrabold text-warning">{mark?.lateMinutes ?? 0} daq</span>
            <button type="button" aria-label="+5" className="flex size-9 items-center justify-center rounded-[11px] bg-background text-[18px] font-bold text-warning shadow-nm-sm" onClick={() => onLate(5)}>+</button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
