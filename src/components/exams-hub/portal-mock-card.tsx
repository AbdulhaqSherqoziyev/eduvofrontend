'use client';
/**
 * PortalMockCard (§6): mobile-first card on the student portal home. The player
 * needs a computer, so on a phone the card hands over the link instead of a start.
 * Module off → the card is not drawn at all.
 */
import { CalendarClock, CircleDot, ClipboardCheck, Monitor, RotateCw } from 'lucide-react';
import Link from 'next/link';
import { useRef } from 'react';
import { StatusPill } from '@/components/shared/status-pill';
import { NmButton } from '@/components/ui/nm-button';
import { NmCard } from '@/components/ui/nm-card';
import { NmSkeleton } from '@/components/ui/nm-skeleton';
import { examsLink } from '@/lib/exam/clipboard';
import { isModuleOff, needsLogin } from '@/lib/exam/hub-api';
import { assignmentPhase, bestBySection, liveAssignments } from '@/lib/exam/hub-derive';
import { bestLine, examTitle, takeable, windowLabel } from '@/lib/exam/hub-format';
import { ht } from '@/lib/exam/i18n/hub';
import { useCanRunPlayer, useDelayed, useHub, useHubNow, useProgress } from '@/lib/exam/use-hub';
import { examSoon } from './exam-card';
import { CopyLinkButton } from './open-on-computer';

export function PortalMockCard() {
  const hub = useHub();
  const progress = useProgress(!!hub.data);
  const now = useHubNow();
  const wide = useCanRunPlayer();
  const linkRef = useRef<HTMLSpanElement>(null);
  const showSkeleton = useDelayed(hub.isLoading);

  if (hub.isLoading) return showSkeleton ? <NmSkeleton h={150} className="rounded-card" /> : null;
  if (hub.isError && (isModuleOff(hub.error) || needsLogin(hub.error))) return null;
  if (hub.isError || !hub.data) {
    return (
      <NmCard className="flex items-center justify-between gap-3 p-4">
        <span className="text-[13px] font-semibold text-muted">{ht('hubx.card_error')}</span>
        <NmButton variant="ghost" size="sm" onClick={() => void hub.refetch()}><RotateCw className="size-4" aria-hidden />{ht('hubx.retry')}</NmButton>
      </NmCard>
    );
  }

  // Portal card covers launched exams only (IELTS / SAT); "Tez kunda" ones are left out.
  const soonCodes = new Set(hub.data.exams.filter(examSoon).map((e) => e.code));
  const live = liveAssignments(hub.data.assignments.filter((x) => !soonCodes.has(x.examCode)), now);
  const byExam = (progress.data?.byExam ?? []).filter((b) => !soonCodes.has(b.code));
  const a = live[0];
  // No assignment → "Eng yaxshi" comes from the most recently attempted exam, labelled with its family.
  const lastAt = (b: { attempts: { at: string }[] }) => Math.max(0, ...b.attempts.map((x) => Date.parse(x.at)));
  const recent = [...byExam].filter((b) => b.attempts.length).sort((x, y) => lastAt(y) - lastAt(x))[0];
  const exam = hub.data.exams.find((e) => e.code === (a?.examCode ?? recent?.code)) ?? (a ? hub.data.exams.find((e) => !examSoon(e)) : undefined);
  const mine = byExam.find((b) => b.code === exam?.code)?.attempts ?? [];
  const bestV = exam ? bestLine(exam.family, takeable(exam), bestBySection(mine)) : null;
  const best = bestV && exam ? (a ? ht('hubx.card_best', { v: bestV }) : ht('hubx.card_best_family', { f: exam.family, v: bestV })) : null;
  const open = a ? assignmentPhase(a, now) === 'open' : false;
  const url = examsLink(a?.examCode);
  const empty = !a && !byExam.some((b) => b.attempts.length);

  return (
    <NmCard className="flex flex-col gap-3 rounded-[24px] p-[18px]">
      <div className="flex items-center gap-2.5">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-[12px] shadow-nm-inset-sm"><ClipboardCheck className="size-[18px] text-primary" aria-hidden /></span>
        <span className="min-w-0 flex-1 text-[15px] font-extrabold text-foreground">{ht('hubx.card_title')}</span>
        {a ? (
          open
            ? <StatusPill tone="success" icon={<CircleDot className="size-3.5" aria-hidden />} label={ht('hubx.open_short')} />
            : <StatusPill tone="primary" icon={<CalendarClock className="size-3.5" aria-hidden />} label={ht('hubx.assigned')} />
        ) : null}
      </div>

      {a && exam ? (
        <div>
          <div className="text-[13.5px] font-bold text-foreground">{examTitle(exam.name)} — {takeable(exam).map((s) => s.title[0]).join(', ')}</div>
          <div className="text-[12.5px] font-semibold text-muted">{windowLabel(a.windowStart, a.windowEnd)} · {a.title}</div>
        </div>
      ) : null}
      {best ? <div className="text-[13px] font-bold text-foreground tabular-nums">{best}</div> : null}
      {empty ? <p className="text-[13px] font-semibold leading-[1.5] text-[#5b6b82]">{ht('hubx.card_empty')}</p> : null}

      {wide ? (
        <Link href={a ? `/exams/${encodeURIComponent(a.examCode)}` : '/exams'} className="flex h-[46px] w-full items-center justify-center rounded-ctl bg-grad-primary text-[14px] font-bold text-white shadow-nm-primary">
          {ht('hubx.card_go')}
        </Link>
      ) : empty ? null : (
        <>
          <div className="flex items-start gap-2">
            <Monitor className="mt-0.5 size-4 shrink-0 text-[#5b6b82]" aria-hidden />
            <div className="min-w-0 text-[13px] font-medium text-[#5b6b82]">
              {ht('gate.title')}.{' '}
              <span ref={linkRef} className="select-all break-all font-extrabold text-foreground">{url.replace(/^https?:\/\//, '')}</span>
            </div>
          </div>
          <CopyLinkButton url={url} textRef={linkRef} className="h-[46px]" />
        </>
      )}
      {empty ? null : (
        <Link href="/exams/progress" className="self-start text-[13px] font-bold text-muted hover:text-primary">{ht('hubx.card_results')} →</Link>
      )}
    </NmCard>
  );
}
