'use client';
/** StartDialog (§3.3, round 2): v1 = assigned only → "To'lovni markaz qiladi". */
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { NmButton } from '@/components/ui/nm-button';
import { NmDialog } from '@/components/ui/nm-dialog';
import { sectionTime, takeable } from '@/lib/exam/hub-format';
import type { HubAssignment, HubExam } from '@/lib/exam/hub-types';
import { ht } from '@/lib/exam/i18n/hub';
import { useCanRunPlayer } from '@/lib/exam/use-hub';
import { playerUrl, useStartAttempt } from '@/lib/exam/use-start-attempt';
import { OpenOnComputer } from './open-on-computer';

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  exam: Pick<HubExam, 'sections'> | null;
  assignment: HubAssignment;
}

/** "Listening 32 daq → Reading 60 daq → Writing 60 daq, tanaffussiz." */
function orderLine(exam: Props['exam'], a: HubAssignment): string | null {
  if (!exam) return null;
  const list = takeable(exam).filter((s) => a.mode === 'full' || s.key === a.sectionKey);
  if (!list.length) return null;
  const line = list.map((s) => [s.title, sectionTime(s)].filter(Boolean).join(' ')).join(' → ');
  return list.length > 1 ? `${line}, tanaffussiz.` : `${line}.`;
}

export function StartDialog({ open, onOpenChange, exam, assignment }: Props) {
  const router = useRouter();
  const wide = useCanRunPlayer();
  const { start, issue, clear, busy } = useStartAttempt();
  const section = exam?.sections.find((s) => s.key === assignment.sectionKey);
  const title = assignment.mode === 'section' && section
    ? ht('hubx.start_title_section', { s: section.title })
    : ht('hubx.start_title_full');
  const close = () => {
    clear();
    onOpenChange(false);
  };
  const order = orderLine(exam, assignment);

  return (
    <NmDialog open={open} onOpenChange={(v) => (v ? onOpenChange(true) : close())} title={title} className="w-[460px] rounded-[28px]">
      <div className="flex flex-col gap-2 text-[14px] font-medium leading-[1.6] text-[#5b6b82]">
        <p>{ht('hub.start_body_assigned')}</p>
        {order ? <p>{order}</p> : null}
      </div>

      {issue ? (
        <p role="alert" className="mt-4 rounded-[14px] p-3 text-[13.5px] font-semibold leading-[1.5] text-foreground shadow-nm-inset-sm">
          {issue.text}
        </p>
      ) : null}

      {wide === false ? (
        <div className="mt-4"><OpenOnComputer code={assignment.examCode} narrow={typeof window !== 'undefined' && window.innerWidth >= 1024} /></div>
      ) : (
        <div className="mt-5 flex gap-3 max-[380px]:flex-col-reverse">
          <NmButton variant="soft" className="flex-1" onClick={close}>
            {issue?.kind === 'window' ? ht('hubx.close') : ht('hubx.cancel')}
          </NmButton>
          {issue?.kind === 'active' ? (
            <NmButton className="flex-1" onClick={() => router.push(playerUrl(issue.attemptId))}>{ht('hubx.continue')}</NmButton>
          ) : issue?.kind === 'window' ? null : (
            <NmButton className="flex-1" disabled={busy || wide === null} onClick={() => void start(assignment)}>
              {busy ? <><Loader2 className="size-4 animate-spin" aria-hidden />{ht('hubx.preparing')}</> : issue ? ht('hubx.retry') : ht('hubx.start')}
            </NmButton>
          )}
        </div>
      )}
    </NmDialog>
  );
}
