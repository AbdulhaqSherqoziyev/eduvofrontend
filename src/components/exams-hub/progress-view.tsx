'use client';
/** "Natijalarim" `/exams/progress` (§5). */
import { LineChart, Medal, ListChecks, CalendarDays, TrendingUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { StatCard } from '@/components/shared/stat-card';
import { NmCard } from '@/components/ui/nm-card';
import { NmSegmented } from '@/components/ui/nm-segmented';
import { examTitle, resultLine } from '@/lib/exam/hub-format';
import { ht } from '@/lib/exam/i18n/hub';
import { progressFacts } from '@/lib/exam/progress-derive';
import { useHub, useProgress } from '@/lib/exam/use-hub';
import { AttemptsTable } from './attempts-table';
import { Delayed, HubError, SkeletonBlock, StateCard } from './hub-states';
import { SkillsCard, WeakTypesCard } from './progress-skills';
import { ProgressTrend } from './progress-trend';

function ProgressSkeleton() {
  return (
    <Delayed>
      <div className="grid gap-5 md:grid-cols-3">{[0, 1, 2].map((i) => <SkeletonBlock key={i} h={130} />)}</div>
      <div className="mt-5 grid gap-5 lg:grid-cols-[1.6fr_1fr]"><SkeletonBlock h={320} /><SkeletonBlock h={320} /></div>
    </Delayed>
  );
}

export function ProgressView() {
  const router = useRouter();
  const p = useProgress();
  const hub = useHub();
  const [pick, setPick] = useState<string | null>(null);

  if (p.isLoading || hub.isLoading) return <ProgressSkeleton />;
  if (p.isError || !p.data) return <HubError error={p.error} onRetry={() => void p.refetch()} />;
  const groups = p.data.byExam.filter((g) => g.attempts.length);
  if (!groups.length) {
    return (
      <StateCard
        icon={<LineChart className="size-8 text-muted" aria-hidden />}
        title={ht('hubx.no_result_title')}
        body={ht('hubx.no_result_body')}
        action={{ label: ht('hubx.go_exams'), on: () => router.push('/exams'), primary: true }}
      />
    );
  }
  const g = groups.find((x) => x.code === pick) ?? groups[0]!;
  const exam = hub.data?.exams.find((e) => e.code === g.code);
  const family = exam?.family ?? (g.code.split('_')[0] as 'IELTS');
  const sections = exam?.sections ?? [];
  const f = progressFacts(g.attempts, sections, family);
  const label = (code: string) => hub.data?.exams.find((e) => e.code === code)?.family ?? code;

  return (
    <>
      {groups.length > 1 ? (
        <NmSegmented size="sm" className="w-full sm:w-[280px]" value={g.code} onValueChange={setPick} items={groups.map((x) => ({ value: x.code, label: label(x.code) }))} />
      ) : null}
      <div className="grid gap-5 md:grid-cols-3">
        <StatCard label={ht('hubx.stat_mocks')} value={String(f.count)} icon={<ListChecks className="size-5" />} />
        <StatCard label={ht('hubx.stat_best')} value={f.best} icon={<Medal className="size-5" />} />
        <StatCard
          label={ht('hubx.stat_last')}
          value={f.last}
          icon={<CalendarDays className="size-5" />}
          footer={f.lastUp ? (
            <span className="inline-flex items-center gap-1 text-[12.5px] font-bold text-[#1F7A55]">
              <TrendingUp className="size-3.5" aria-hidden />{f.lastUp.section}: {ht('hubx.since_last_short', { delta: f.lastUp.delta })}
            </span>
          ) : null}
        />
      </div>
      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <ProgressTrend list={g.attempts} keys={f.keys} sections={sections} family={family} best={f.best} />
        <SkillsCard skills={f.skills} family={family} />
      </div>
      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]">
        <WeakTypesCard attemptIds={g.attempts.map((a) => a.attemptId)} />
        <NmCard className="flex min-w-0 flex-col gap-4 rounded-[24px] p-6 max-md:p-4">
          <h2 className="text-[17px] font-extrabold text-foreground">{ht('hubx.history')}</h2>
          <AttemptsTable
            withExam
            empty={ht('hubx.attempts_empty')}
            rows={[...g.attempts].reverse().map((a) => ({
              id: a.attemptId,
              at: a.at,
              exam: examTitle(exam?.name ?? g.name),
              mode: a.mode === 'full' ? ht('hubx.mode_full') : sections.find((s) => a.sections[s.key] != null)?.title ?? '',
              variant: null,
              result: resultLine(family, sections, a.sections),
              state: Object.entries(a.sections).some(([k, v]) => k !== 'speaking' && v == null && sections.find((s) => s.key === k)?.available) ? 'grading' : 'ready',
            }))}
          />
        </NmCard>
      </div>
    </>
  );
}
