'use client';
/** Detail `/exams/[code]` (§3): left card · right (AssignmentCard, PriceCard, how graded) · attempts. */
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { NmCard } from '@/components/ui/nm-card';
import { errCode } from '@/lib/exam/hub-api';
import { assignmentPhase, attemptRowState, type AssignmentPhase } from '@/lib/exam/hub-derive';
import { resultLine } from '@/lib/exam/hub-format';
import type { DetailResp } from '@/lib/exam/hub-types';
import { ht } from '@/lib/exam/i18n/hub';
import { readCodeSession } from '@/lib/exam/session';
import { useExamDetail, useHubNow } from '@/lib/exam/use-hub';
import { AssignmentCard, TryInterfaceLink } from './assignment-card';
import { AttemptsTable, type AttemptRow } from './attempts-table';
import { CodeDetail } from './code-detail';
import { DetailMain } from './detail-main';
import { examSoon } from './exam-card';
import { Delayed, HubError, SkeletonBlock } from './hub-states';
import { HowGraded, PriceCard } from './price-card';

const RANK: Record<AssignmentPhase, number> = { open: 0, started: 1, upcoming: 2, submitted: 3, closed: 4 };

export function BackToExams() {
  return (
    <Link href="/exams" className="inline-flex items-center gap-1.5 self-start text-[13.5px] font-bold text-[#5b6b82] hover:text-primary">
      <ArrowLeft className="size-4" aria-hidden />
      {ht('hubx.back_exams')}
    </Link>
  );
}

function rows(d: DetailResp): AttemptRow[] {
  return d.attempts.filter((a) => a.status !== 'CANCELLED').map((a) => ({
    id: a.id,
    at: a.finishedAt ?? a.startedAt,
    mode: a.mode === 'full' ? ht('hubx.mode_full') : d.exam.sections.find((s) => s.key === a.sectionKey)?.title ?? a.sectionKey ?? '',
    variant: d.tests.find((t) => t.id === a.testId)?.title ?? null,
    result: a.resultSummary ? resultLine(d.exam.family, d.exam.sections, a.resultSummary.sections) : null,
    state: attemptRowState(a),
  }));
}

function DetailSkeleton() {
  return (
    <Delayed>
      <div className="grid gap-[22px] lg:grid-cols-[minmax(0,1.7fr)_minmax(340px,1fr)]">
        <SkeletonBlock h={520} />
        <div className="flex flex-col gap-5"><SkeletonBlock h={220} /><SkeletonBlock h={180} /></div>
      </div>
    </Delayed>
  );
}

export function DetailView({ code }: { code: string }) {
  const now = useHubNow();
  const q = useExamDetail(code);
  const session = typeof window === 'undefined' ? null : readCodeSession();

  if (q.isLoading) return <><BackToExams /><DetailSkeleton /></>;
  if (session && errCode(q.error) === 'CODE_SESSION_LIMITED') return <CodeDetail session={session} />;
  if (q.isError || !q.data) return <><BackToExams /><HubError error={q.error} onRetry={() => void q.refetch()} /></>;

  const d = q.data;
  const soon = examSoon(d.exam);
  const sorted = [...(soon ? [] : d.assignments)].sort((a, b) => RANK[assignmentPhase(a, now)] - RANK[assignmentPhase(b, now)]);
  const shown = sorted.filter((a) => assignmentPhase(a, now) !== 'closed').slice(0, 2);
  const cards = shown.length ? shown : sorted.slice(0, 1);
  const done = new Set(d.attempts.filter((a) => a.status === 'COMPLETED').map((a) => a.testId));

  return (
    <>
      <BackToExams />
      <div className="grid items-start gap-[22px] lg:grid-cols-[minmax(0,1.7fr)_minmax(340px,1fr)]">
        <DetailMain exam={d.exam} />
        <div className="flex flex-col gap-5 max-lg:order-first">
          {cards.map((a) => (
            <AssignmentCard key={a.id} a={a} exam={d.exam} variant={d.tests.find((t) => t.id === a.testId)?.title ?? null} />
          ))}
          {soon ? (
            <NmCard className="flex flex-col gap-2 p-6">
              <div className="text-[20px] font-extrabold tracking-[-0.4px] text-[#B7790F]">{ht('hubx.coming_soon')}</div>
            </NmCard>
          ) : (
            <PriceCard tests={d.tests} doneTests={done} hasAssignment={d.assignments.length > 0} />
          )}
          <HowGraded exam={d.exam} />
        </div>
      </div>
      <NmCard className="flex flex-col gap-4 rounded-[24px] p-6 max-md:p-5">
        <h2 className="text-[17px] font-extrabold text-foreground">{ht('hubx.prev_attempts')}</h2>
        <AttemptsTable
          rows={rows(d)}
          empty={<span className="flex flex-wrap items-center gap-3">{ht('hubx.attempts_empty')} {soon ? null : <TryInterfaceLink code={d.exam.code} />}</span>}
        />
      </NmCard>
    </>
  );
}
