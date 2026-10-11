'use client';
/** AssignmentCard (§3.4, right column top) — the screen's one primary while a window is open. */
import { CalendarClock, PlayCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { NmButton } from '@/components/ui/nm-button';
import { NmCard } from '@/components/ui/nm-card';
import { assignmentPhase } from '@/lib/exam/hub-derive';
import { dayLong, hm, windowLabel } from '@/lib/exam/hub-format';
import type { HubAssignment, HubExam } from '@/lib/exam/hub-types';
import { ht } from '@/lib/exam/i18n/hub';
import { useCanRunPlayer, useHubNow } from '@/lib/exam/use-hub';
import { playerUrl, resultUrl } from '@/lib/exam/use-start-attempt';
import { PhasePill, useStartedSection } from './assignment-status';
import { OpenOnComputer } from './open-on-computer';
import { StartDialog } from './start-dialog';

interface Props {
  a: HubAssignment;
  exam: Pick<HubExam, 'sections' | 'code'> | null;
  variant: string | null;
}

export function TryInterfaceLink({ code }: { code: string }) {
  return (
    <Link href={`/exam/try/${encodeURIComponent(code)}`} className="inline-flex items-center gap-1.5 text-[13px] font-bold text-primary hover:underline">
      <PlayCircle className="size-4" aria-hidden />
      {ht('hubx.try_interface')}
    </Link>
  );
}

export function AssignmentCard({ a, exam, variant }: Props) {
  const router = useRouter();
  const now = useHubNow(30_000);
  const wide = useCanRunPlayer();
  const [dialog, setDialog] = useState(false);
  const phase = assignmentPhase(a, now);
  const section = useStartedSection(a, phase, now);
  const needsPc = wide === false && (phase === 'open' || phase === 'started');
  const name = [a.title, variant && variant !== a.title ? variant : null].filter(Boolean).join(' · ');

  return (
    <NmCard className="flex flex-col gap-3 p-[22px]">
      <div className="text-[10.5px] font-bold tracking-[0.8px] text-[#9aa6b8]">{ht('hubx.assigned_session')}</div>
      <div className="text-[15px] font-extrabold text-foreground">{name}</div>
      <div className="flex items-center gap-1.5 text-[13.5px] font-bold text-foreground">
        <CalendarClock className="size-4 text-[#5b6b82]" aria-hidden />
        {windowLabel(a.windowStart, a.windowEnd, ' – ')}
      </div>
      <div className="text-[12.5px] font-semibold text-muted">{ht('hub.center_pays')}</div>
      <div><PhasePill a={a} phase={phase} now={now} section={section} /></div>

      {needsPc ? <OpenOnComputer code={exam?.code ?? a.examCode} narrow={typeof window !== 'undefined' && window.innerWidth >= 1024} /> : null}
      {!needsPc && phase === 'upcoming' ? (
        <>
          <NmButton size="lg" disabled aria-disabled className="w-full">{ht('hubx.start')}</NmButton>
          <p className="text-[12px] font-semibold text-muted">{ht('errors.window_not_open', { date: dayLong(a.windowStart), time: hm(a.windowStart) })}</p>
        </>
      ) : null}
      {!needsPc && phase === 'open' ? (
        <NmButton size="lg" className="h-12 w-full" onClick={() => setDialog(true)}>{ht('hubx.start')}</NmButton>
      ) : null}
      {!needsPc && phase === 'started' && a.attemptId ? (
        <NmButton size="lg" className="h-12 w-full" onClick={() => router.push(playerUrl(a.attemptId!))}>{ht('hubx.continue')}</NmButton>
      ) : null}
      {phase === 'submitted' && a.attemptId ? (
        <NmButton variant="soft" className="w-full" onClick={() => router.push(resultUrl(a.attemptId!))}>{ht('hubx.view_result')}</NmButton>
      ) : null}
      {phase === 'closed' ? (
        <p className="text-[12.5px] font-semibold leading-[1.5] text-muted">{ht('errors.window_closed', { date: dayLong(a.windowEnd), time: hm(a.windowEnd) })}</p>
      ) : null}

      <TryInterfaceLink code={exam?.code ?? a.examCode} />
      {phase === 'open' ? <StartDialog open={dialog} onOpenChange={setDialog} exam={exam} assignment={a} /> : null}
    </NmCard>
  );
}
