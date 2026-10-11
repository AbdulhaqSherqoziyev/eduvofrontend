'use client';
/** §2 "Tayinlangan sessiya" strip (AssignmentCard compact) — max 3, then "Yana N ta tayinlov". */
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { NmButton } from '@/components/ui/nm-button';
import { NmCard } from '@/components/ui/nm-card';
import { assignmentPhase } from '@/lib/exam/hub-derive';
import { examTitle, windowLabel } from '@/lib/exam/hub-format';
import type { HubAssignment, HubExam } from '@/lib/exam/hub-types';
import { ht } from '@/lib/exam/i18n/hub';
import { useCanRunPlayer } from '@/lib/exam/use-hub';
import { playerUrl } from '@/lib/exam/use-start-attempt';
import { AssignedPill, PhasePill } from './assignment-status';
import { StartDialog } from './start-dialog';

function Strip({ a, exam, now, primary }: { a: HubAssignment; exam: HubExam | undefined; now: number; primary: boolean }) {
  const router = useRouter();
  const wide = useCanRunPlayer();
  const [dialog, setDialog] = useState(false);
  const phase = assignmentPhase(a, now);
  const variant = primary ? 'primary' : 'soft';
  const name = exam ? `${examTitle(exam.name)} — ${exam.sections.filter((s) => s.available && !s.separateSitting).map((s) => s.title[0]).join(', ')}` : a.examCode;

  return (
    <NmCard className="grid grid-cols-1 items-center gap-3 px-[22px] py-[18px] md:grid-cols-[auto_1fr_auto_auto] md:gap-[18px]">
      <div className="flex flex-wrap gap-2">
        <AssignedPill label={ht('hubx.assigned')} />
        {phase !== 'upcoming' ? <PhasePill a={a} phase={phase} now={now} /> : null}
      </div>
      <Link href={`/exams/${encodeURIComponent(a.examCode)}`} className="min-w-0 hover:underline">
        <span className="text-[15px] font-extrabold text-foreground">{name}</span>
        <span className="text-[13px] font-semibold text-[#5b6b82]"> · {a.title}</span>
      </Link>
      <span className="text-[13.5px] font-bold text-foreground">{windowLabel(a.windowStart, a.windowEnd)}</span>
      {wide && phase === 'open' ? (
        <NmButton variant={variant} className="h-[46px]" onClick={() => setDialog(true)}>{ht('hubx.start')}</NmButton>
      ) : wide && phase === 'started' && a.attemptId ? (
        <NmButton variant={variant} className="h-[46px]" onClick={() => router.push(playerUrl(a.attemptId!))}>{ht('hubx.continue')}</NmButton>
      ) : (
        <span className="max-md:hidden" />
      )}
      {phase === 'open' ? <StartDialog open={dialog} onOpenChange={setDialog} exam={exam ?? null} assignment={a} /> : null}
    </NmCard>
  );
}

export function AssignmentStrips({ list, exams, now }: { list: HubAssignment[]; exams: HubExam[]; now: number }) {
  const [all, setAll] = useState(false);
  const shown = all ? list : list.slice(0, 3);
  // One primary per screen: the first strip whose window is open (or attempt unfinished).
  const firstActionable = list.findIndex((a) => ['open', 'started'].includes(assignmentPhase(a, now)));
  return (
    <div className="flex flex-col gap-3">
      {shown.map((a, i) => (
        <Strip key={a.id} a={a} exam={exams.find((e) => e.code === a.examCode)} now={now} primary={i === firstActionable} />
      ))}
      {!all && list.length > 3 ? (
        <NmButton variant="ghost" className="self-start" onClick={() => setAll(true)}>{ht('hubx.more_assignments', { n: list.length - 3 })}</NmButton>
      ) : null}
    </div>
  );
}
