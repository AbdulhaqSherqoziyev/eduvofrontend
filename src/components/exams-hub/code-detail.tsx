'use client';
/**
 * PIN session detail (§7 "faqat shu tayinlov; PriceCard yo'q, AssignmentCard
 * primary bilan"). The backend keeps `GET /portal/exams/:code` student-only
 * (CODE_SESSION_LIMITED), so this view is built from the login answer and the
 * attempt itself — no FormatTable until the API opens the detail to PIN sessions.
 */
import { NmCard } from '@/components/ui/nm-card';
import type { HubAssignment } from '@/lib/exam/hub-types';
import type { CodeSession } from '@/lib/exam/session';
import { useAttemptState } from '@/lib/exam/use-hub';
import { AssignmentCard } from './assignment-card';
import { Delayed, SkeletonBlock } from './hub-states';

export function CodeDetail({ session }: { session: CodeSession }) {
  const st = useAttemptState(session.attemptId);
  if (session.attemptId && st.isLoading) {
    return <Delayed><SkeletonBlock h={260} className="mx-auto w-full max-w-[460px] rounded-[24px]" /></Delayed>;
  }
  const a: HubAssignment = {
    ...session.assignment,
    attemptId: session.attemptId,
    // Unknown status (request failed) → treat as unfinished so the student can still re-enter the player.
    attemptStatus: session.attemptId ? st.data?.attempt.status ?? 'ACTIVE' : null,
  };
  const sections = (st.data?.config.sections ?? []).map((s) => ({
    key: s.key, title: s.title, order: s.order, durationSec: s.brief?.durationSec ?? null, gradingKind: 'objective' as const,
    available: true, separateSitting: !!s.separate_sitting,
    brief: { durationSec: s.brief?.durationSec ?? null, questions: s.brief?.questions ?? null, parts: s.brief?.parts ?? null, tasks: s.brief?.tasks ?? null },
  }));
  return (
    <div className="mx-auto flex w-full max-w-[460px] flex-col gap-5">
      <NmCard className="p-5">
        <div className="text-[13px] font-semibold text-muted">{session.student.fullName}</div>
        <h1 className="mt-1 text-[21px] font-extrabold tracking-[-0.4px] text-foreground">{session.assignment.title}</h1>
      </NmCard>
      <AssignmentCard a={a} exam={{ code: a.examCode, sections }} variant={null} />
    </div>
  );
}
