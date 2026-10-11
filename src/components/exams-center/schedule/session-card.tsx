'use client';

import type { Assignment, CatalogExam } from '@/lib/api/center-exams';
import { cn } from '@/lib/utils/cn';
import { countLabel, phaseOf, PHASE_CHIP } from '../assignment-meta';
import { examShortName, sectionTitle, windowLabel } from '../exam-meta';
import { SH } from '../tokens';
import { ToneChip } from '../ui';

interface Props { a: Assignment; exam?: CatalogExam; active: boolean; onPick: () => void }

/** "IELTS Academic · Mock 5 · To'liq" — design session-card exam line. */
export function sessionExamLine(a: Assignment, exam?: CatalogExam): string {
  const what = a.mode === 'section' ? sectionTitle(exam, a.sectionKey) : "To'liq";
  return [examShortName(exam, a.examCode), a.testTitle, what].filter(Boolean).join(' · ');
}

/** Session card (design v3 `sessions`): group, phase pill, exam line, window, count. */
export function SessionCard({ a, exam, active, onPick }: Props) {
  const phase = phaseOf(a);
  const chip = PHASE_CHIP[phase];
  return (
    <button
      type="button"
      onClick={onPick}
      aria-pressed={active}
      className={cn('flex w-full flex-col gap-2.5 rounded-[20px] bg-background px-5 py-[18px] text-left transition-shadow', active ? SH.inset : SH.card)}
    >
      <div className="flex w-full items-center justify-between gap-3">
        <div className="truncate text-[15px] font-extrabold">{a.groupName ?? a.title}</div>
        <ToneChip label={chip.label} fg={chip.fg} bg={chip.bg} />
      </div>
      <div className="text-[13px] font-semibold text-[#5b6b82]">{sessionExamLine(a, exam)}</div>
      <div className="flex w-full justify-between gap-3 text-[12.5px] font-semibold text-muted">
        <span>{windowLabel(a.windowStart, a.windowEnd, phase === 'past')}</span>
        <span className="whitespace-nowrap">{countLabel(a, phase)}</span>
      </div>
    </button>
  );
}
