'use client';
/** Hub `/exams` (§2): assignment strips → family filter → exam cards. */
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import { NmSegmented } from '@/components/ui/nm-segmented';
import { bestBySection, liveAssignments } from '@/lib/exam/hub-derive';
import { ht } from '@/lib/exam/i18n/hub';
import { readCodeSession } from '@/lib/exam/session';
import { useCanRunPlayer, useHub, useHubNow, useProgress } from '@/lib/exam/use-hub';
import { AssignmentStrips } from './assignment-strip';
import { ExamCard, examSoon } from './exam-card';
import { Delayed, HubError, NoExams, SkeletonBlock } from './hub-states';
import { OpenOnComputer } from './open-on-computer';

const GRID = 'grid grid-cols-[repeat(auto-fill,minmax(min(360px,100%),1fr))] gap-[22px]';

function HubSkeleton() {
  return (
    <Delayed>
      <div className="flex flex-col gap-[22px]">
        <SkeletonBlock h={46} className="w-[260px] max-w-full rounded-[15px]" />
        <div className={GRID}>
          {[0, 1, 2, 3].map((i) => <SkeletonBlock key={i} h={300} />)}
        </div>
      </div>
    </Delayed>
  );
}

export function HubView() {
  const router = useRouter();
  const params = useSearchParams();
  const now = useHubNow();
  const wide = useCanRunPlayer();
  const code = useMemo(() => (typeof window === 'undefined' ? null : readCodeSession()), []);
  useEffect(() => {
    if (code) router.replace(`/exams/${encodeURIComponent(code.assignment.examCode)}`);
  }, [code, router]);

  const hub = useHub(!code);
  const progress = useProgress(!code);
  const family = (params.get('family') ?? 'all').toUpperCase();

  if (code) return null;
  if (hub.isLoading) return <HubSkeleton />;
  if (hub.isError || !hub.data) return <HubError error={hub.error} onRetry={() => void hub.refetch()} />;

  const { exams, assignments } = hub.data;
  if (!exams.length) return <NoExams />;
  const families = [...new Set(exams.map((e) => e.family))];
  const shown = family === 'ALL' ? exams : exams.filter((e) => e.family === family);
  // "Tez kunda" exams never start: their assignments get no strip / start button.
  const soonCodes = new Set(exams.filter(examSoon).map((e) => e.code));
  const live = liveAssignments(assignments.filter((a) => !soonCodes.has(a.examCode)), now);
  const setFamily = (v: string) => router.replace(v === 'all' ? '/exams' : `/exams?family=${v.toLowerCase()}`, { scroll: false });

  return (
    <>
      {live.length ? <AssignmentStrips list={live} exams={exams} now={now} /> : null}
      {wide === false && live.length ? <OpenOnComputer narrow={window.innerWidth >= 1024} /> : null}
      {families.length > 1 ? (
        <NmSegmented
          size="sm"
          className="w-full sm:w-[320px]"
          value={family === 'ALL' ? 'all' : family}
          onValueChange={setFamily}
          items={[{ value: 'all', label: ht('hubx.all') }, ...families.map((f) => ({ value: f, label: f }))]}
        />
      ) : null}
      <div className={GRID}>
        {shown.map((e) => {
          const mine = progress.data?.byExam.find((b) => b.code === e.code)?.attempts ?? [];
          return (
            <ExamCard key={e.code} exam={e} now={now} best={bestBySection(mine)} assignment={live.find((a) => a.examCode === e.code)} />
          );
        })}
      </div>
    </>
  );
}
