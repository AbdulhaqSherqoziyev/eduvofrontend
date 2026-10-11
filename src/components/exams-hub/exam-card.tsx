'use client';
/** ExamCard (§2, v3 Katalog card). No start here — variant and start live on the detail page. */
import Link from 'next/link';
import { NmCard } from '@/components/ui/nm-card';
import { isComingSoon } from '@/lib/exam/coming-soon';
import { assignmentPhase } from '@/lib/exam/hub-derive';
import {
  bestLine, dotDayTime, durationLabel, examTitle, familyInk, formatChip, sectionList, sectionTime, takeable, totalSec,
} from '@/lib/exam/hub-format';
import type { HubAssignment, HubExam } from '@/lib/exam/hub-types';
import { ht } from '@/lib/exam/i18n/hub';
import { cn } from '@/lib/utils/cn';
import { AssignedPill, PhasePill } from './assignment-status';

/** "Tez kunda" exam (TOEFL / HSK / CEFR until launch): visible, but nothing starts. */
export const examSoon = (e: Pick<HubExam, 'family' | 'comingSoon'> | null | undefined) => !!e && isComingSoon(e.family, e.comingSoon);

/** "Tez kunda" chip — same size as the format chip, amber like the design's warning chips. */
export function SoonChip() {
  return <span className="shrink-0 whitespace-nowrap rounded-[7px] bg-[#FFF1D6] px-2 py-1 text-[10.5px] font-extrabold uppercase text-[#7A4E00]">{ht('hubx.coming_soon')}</span>;
}

export function ExamTile({ exam, size = 52 }: { exam: Pick<HubExam, 'family'>; size?: 52 | 60 }) {
  return (
    <span
      className={cn('flex shrink-0 items-center justify-center bg-background font-extrabold shadow-nm-inset-sm', size === 60 ? 'size-[60px] rounded-[18px] text-[18px]' : 'size-[52px] rounded-[16px] text-[16px]')}
      style={{ color: familyInk(exam.family) }}
    >
      {exam.family}
    </span>
  );
}

function Cell({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="min-w-0">
      <div className="text-[10px] font-bold tracking-[0.7px] text-[#9aa6b8]">{label}</div>
      <div className={cn('mt-1 text-[13px] tabular-nums', muted ? 'font-semibold text-muted' : 'font-extrabold text-foreground')}>{value}</div>
    </div>
  );
}

interface Props {
  exam: HubExam;
  assignment: HubAssignment | undefined;
  best: Record<string, number | null>;
  now: number;
}

export function ExamCard({ exam, assignment, best, now }: Props) {
  const total = totalSec(exam);
  const bestText = bestLine(exam.family, takeable(exam), best);
  const soon = examSoon(exam);
  const phase = assignment && !soon ? assignmentPhase(assignment, now) : null;

  return (
    <NmCard className="flex flex-col gap-[18px] rounded-[24px] p-6">
      <div className="flex items-center gap-3.5">
        <ExamTile exam={exam} />
        <div className="min-w-0 flex-1">
          <div className="text-[17px] font-extrabold tracking-[-0.3px] text-foreground">{examTitle(exam.name)}</div>
          <div className="mt-0.5 text-[12.5px] font-semibold text-muted">{sectionList(exam)}</div>
        </div>
        <span className="shrink-0 rounded-[7px] bg-[#DDE3EC] px-2 py-1 text-[10.5px] font-extrabold text-[#5b6b82] max-[400px]:hidden">{formatChip(exam.family)}</span>
        {soon ? <SoonChip /> : null}
      </div>

      {assignment && !soon && phase === 'upcoming' ? <div><AssignedPill label={ht('hubx.assigned_at', { at: dotDayTime(assignment.windowStart) })} /></div> : null}
      {assignment && phase && phase !== 'upcoming' ? <div><PhasePill a={assignment} phase={phase} now={now} /></div> : null}

      <div className="flex flex-wrap gap-[7px]">
        {takeable(exam).map((s) => (
          <span key={s.key} className="rounded-[9px] bg-background px-2.5 py-1.5 text-[12px] font-bold text-[#5b6b82] shadow-nm-sm">
            {[s.title, sectionTime(s)].filter(Boolean).join(' · ')}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-2.5 rounded-[16px] p-3.5 shadow-nm-inset">
        <Cell label={ht('hubx.duration')} value={total != null ? durationLabel(total) : '—'} />
        <Cell label={ht('hubx.payment')} value={ht('hub.center_pays')} />
        <Cell label={ht('hubx.best')} value={bestText ?? ht('hubx.no_attempt')} muted={!bestText} />
      </div>

      <Link
        href={`/exams/${encodeURIComponent(exam.code)}`}
        className="flex h-[42px] w-full items-center justify-center rounded-[13px] bg-background text-[13.5px] font-bold text-foreground shadow-nm-sm nm-pressable"
      >
        {ht('hubx.details')}
      </Link>
    </NmCard>
  );
}
