'use client';

import { useState } from 'react';
import { Check, Clock, FileQuestion, X } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { NmInput } from '@/components/ui/nm-input';
import { RowIndex } from '@/components/shared/row-index';
import { cn } from '@/lib/utils/cn';
import type { AttendanceStatus } from '@/lib/types/attendance';
import { isScorable, type LocalMark } from '@/lib/hooks/use-attendance-marks';

interface RowProps {
  n: number;
  fullName: string;
  mark?: LocalMark;
  /** The centre's scale; null = unscored, so no score field at all. */
  scoreMax?: number | null;
  onStatus: (status: AttendanceStatus) => void;
  onLate: (delta: number) => void;
  onScore?: (score: number | null) => void;
}

const BTN = 'flex flex-1 items-center justify-center gap-2 h-[46px] rounded-[13px] border-0 font-sans text-[13.5px] font-bold transition-all nm-pressable';
function btn(active: boolean, color: string) {
  return cn(BTN, active ? `${color} shadow-nm-inset-sm` : 'text-[#9aa6b8] shadow-nm-sm');
}

/** One student's marking row: Keldi / Kechikdi / Kelmadi + late counter (+ lesson score when the centre scores). */
export function AttendanceStudentRow({ n, fullName, mark, scoreMax, onStatus, onLate, onScore }: RowProps) {
  const status = mark?.status ?? 'PRESENT';
  const scored = scoreMax != null && scoreMax > 0 && isScorable(status);
  const [clipNote, setClipNote] = useState<string | null>(null);

  // Digits only; anything above the scale is clipped at once, with a note that
  // stays until the next keystroke (same rule as the homework strip).
  const onScoreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '').replace(/^0+(?=\d)/, '');
    if (digits === '') {
      setClipNote(null);
      onScore?.(null);
      return;
    }
    const n = Number(digits);
    if (scoreMax != null && n > scoreMax) {
      setClipNote(`Eng ko'pi — ${scoreMax}. Siz ${n} yozdingiz.`);
      onScore?.(scoreMax);
      return;
    }
    setClipNote(null);
    onScore?.(n);
  };

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
      {scored ? (
        <div className="mt-3 rounded-[15px] bg-background px-2.5 py-2 shadow-nm-inset-sm">
          <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5">
            <span className="text-[12.5px] font-bold text-muted">Baho</span>
            <div className="flex items-center gap-2">
              <NmInput
                inputMode="numeric"
                placeholder="—"
                aria-label="Baho"
                className="h-[38px] w-[72px] rounded-[11px] px-2 text-center text-[14px] font-extrabold shadow-nm-inset-sm"
                value={mark?.score == null ? '' : String(mark.score)}
                onChange={onScoreChange}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') e.currentTarget.blur();
                }}
              />
              <span className="text-[13px] font-bold text-muted">/{scoreMax}</span>
            </div>
          </div>
          {clipNote && mark?.score != null ? <p className="mt-1.5 text-[11.5px] font-semibold text-muted">{clipNote}</p> : null}
        </div>
      ) : null}
    </div>
  );
}
