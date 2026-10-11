'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronDown, LineChart } from 'lucide-react';
import { QueryBoundary } from '@/components/shared/query-boundary';
import { EmptyState } from '@/components/shared/empty-state';
import { RowsSkeleton, Skeleton } from '@/components/shared/skeleton';
import { useExamAssignments, useExamResults } from '@/lib/hooks/use-center-exams';
import { examsV3Api } from '@/lib/api/center-exams-v3';
import type { Assignment, Results } from '@/lib/api/center-exams';
import { phaseOf } from '../assignment-meta';
import { examErrorText } from '../exam-errors';
import { capitalize, dayMonthFull, formatScore } from '../exam-meta';
import { Card, ConsoleHeader, KpiCard, KpiGrid, SoftButton } from '../ui';
import { ResultsTable } from './results-table';

const SKELETON = <><Skeleton className="mb-[22px] h-[112px] w-full" /><RowsSkeleton rows={6} /></>;

const sessionTitle = (s: Assignment) =>
  [s.groupName ?? s.title, s.testTitle, s.mode === 'section' && s.sectionKey ? capitalize(s.sectionKey) : null, dayMonthFull(new Date(s.windowStart))]
    .filter(Boolean).join(' · ');

/** Natijalar (design v3 RESULTS): KPI row → one session table with Excel export. */
export function ResultsView() {
  const router = useRouter();
  const params = useSearchParams();
  const sessions = useExamAssignments(undefined, 1, 100);
  const list = (sessions.data?.items ?? []).filter((s) => phaseOf(s) !== 'upcoming');
  // Design shows one session; default = the latest one that has started.
  const fromUrl = params.get('assignmentId');
  const assignmentId = fromUrl ?? [...list].sort((a, b) => b.windowStart.localeCompare(a.windowStart))[0]?.id ?? '';
  const waiting = fromUrl == null && sessions.isLoading;
  const results = useExamResults({ assignmentId: assignmentId || undefined }, !waiting);
  const session = list.find((s) => s.id === assignmentId);
  const pick = (id: string) => router.replace(`/exams/results?assignmentId=${encodeURIComponent(id)}`);

  return (
    <section className="flex flex-col pb-6">
      <ConsoleHeader title="Natijalar" subtitle="Guruh bo'yicha ballar va CEFR darajalari" />
      {waiting ? SKELETON : null}
      {waiting ? null : (
      <QueryBoundary query={results} loading={SKELETON}>
        {(data) => (
          <>
            <ResultKpis data={data} scope={session?.groupName ?? session?.title} />
            <Card className="px-[18px] py-4">
              <div className="flex flex-wrap items-center justify-between gap-3 px-2 pb-4 pt-1.5">
                <label className="relative flex min-w-0 max-w-full items-center">
                  <select
                    aria-label="Tayinlov"
                    value={assignmentId}
                    onChange={(e) => pick(e.target.value)}
                    className="max-w-full cursor-pointer appearance-none truncate bg-transparent pr-6 text-[16px] font-extrabold text-foreground outline-none"
                  >
                    <option value="">Barcha natijalar</option>
                    {list.map((s) => <option key={s.id} value={s.id}>{sessionTitle(s)}</option>)}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-0 size-4 text-muted" />
                </label>
                <ExportButton assignmentId={assignmentId} disabled={data.rows.length === 0} />
              </div>
              {data.rows.length === 0 ? (
                <EmptyState icon={<LineChart className="size-6" />} title="Hali natija yo'q" hint="O'quvchilar tayinlangan mockni topshirgach, ballar shu yerda chiqadi." />
              ) : (
                <ResultsTable rows={data.rows} />
              )}
            </Card>
          </>
        )}
      </QueryBoundary>
      )}
    </section>
  );
}

function ExportButton({ assignmentId, disabled }: { assignmentId: string; disabled: boolean }) {
  const [state, setState] = useState<{ busy: boolean; error: string | null }>({ busy: false, error: null });
  const run = () => {
    setState({ busy: true, error: null });
    examsV3Api.resultsXlsx({ assignmentId: assignmentId || undefined })
      .then(() => setState({ busy: false, error: null }))
      .catch((e) => setState({ busy: false, error: examErrorText(e, "Faylni yuklab bo'lmadi.") }));
  };
  return (
    <div className="flex flex-col items-end gap-1">
      <SoftButton className="h-[38px] rounded-[12px] px-4 text-[13px] font-bold text-primary" disabled={disabled || state.busy} onClick={run}>
        {state.busy ? 'Tayyorlanmoqda…' : "Excel'ga eksport"}
      </SoftButton>
      {state.error ? <span className="text-[11.5px] font-bold text-danger">{state.error}</span> : null}
    </div>
  );
}

function ResultKpis({ data, scope }: { data: Results; scope?: string }) {
  const k = data.kpis;
  const people = new Set(data.rows.map((r) => r.studentId)).size;
  const weakAvg = k?.weakest ? k.weakest.range ?? formatScore(k.weakest.avg) : null;
  return (
    <KpiGrid>
      <KpiCard label="O'RTACHA UMUMIY" value={formatScore(k?.avgOverall)} sub={`${scope ? `${scope} · ` : ''}${people} o'quvchi`} />
      <KpiCard label="ENG KUCHLI" value={k?.strongest ? capitalize(k.strongest.section) : '—'} sub={k?.strongest ? `o'rtacha ${formatScore(k.strongest.avg)}` : undefined} />
      <KpiCard label="ENG ZAIF" value={k?.weakest ? capitalize(k.weakest.section) : '—'} sub={weakAvg ? `o'rtacha ${weakAvg}` : undefined} />
      <KpiCard label="C1 VA YUQORI" value={String(k?.c1Plus.count ?? '—')} sub={k ? `${k.c1Plus.of} tadan` : undefined} />
    </KpiGrid>
  );
}
