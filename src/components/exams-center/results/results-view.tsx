'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronDown, LineChart } from 'lucide-react';
import { NmSwitch } from '@/components/ui/nm-switch';
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

/** Natijalar (design v3 RESULTS): KPI row → one session table with Excel export; rows open `/exams/results/[attemptId]`. */
export function ResultsView() {
  const router = useRouter();
  const params = useSearchParams();
  const sessions = useExamAssignments(undefined, 1, 100);
  const list = (sessions.data?.items ?? []).filter((s) => phaseOf(s) !== 'upcoming');
  // Design shows one session; default = the latest one that has started.
  const fromUrl = params.get('assignmentId');
  const assignmentId = fromUrl ?? [...list].sort((a, b) => b.windowStart.localeCompare(a.windowStart))[0]?.id ?? '';
  const waiting = fromUrl == null && sessions.isLoading;
  // "Sinov urinishlarini ko'rsatish" (staff previews, `includePreview`) — kept in the URL so "back" from a detail keeps it.
  const includePreview = params.get('preview') === '1';
  const results = useExamResults({ assignmentId: assignmentId || undefined, includePreview: includePreview || undefined }, !waiting);
  const session = list.find((s) => s.id === assignmentId);
  const go = (next: { assignmentId?: string; preview?: boolean }) => {
    const q = new URLSearchParams(params.toString());
    if (next.assignmentId !== undefined) q.set('assignmentId', next.assignmentId);
    if (next.preview !== undefined) { if (next.preview) q.set('preview', '1'); else q.delete('preview'); }
    // Previews belong to no session → turning them on with no explicit session shows "Barcha natijalar".
    if (next.preview && !q.has('assignmentId')) q.set('assignmentId', '');
    router.replace(`/exams/results?${q.toString()}`);
  };
  const pick = (id: string) => go({ assignmentId: id });

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
                <div className="flex flex-wrap items-center gap-4">
                  <label className="flex cursor-pointer items-center gap-2.5 text-[13px] font-bold text-[#5b6b82]">
                    <NmSwitch checked={includePreview} onCheckedChange={(v) => go({ preview: v })} aria-label="Sinov urinishlarini ko'rsatish" />
                    Sinov urinishlarini ko&apos;rsatish
                  </label>
                  <ExportButton assignmentId={assignmentId} disabled={data.rows.filter((r) => !r.isPreview).length === 0} />
                </div>
              </div>
              {data.rows.length === 0 ? (
                includePreview ? (
                  <EmptyState icon={<LineChart className="size-6" />} title="Hali natija yo'q" hint="O'quvchi yoki sinov urinishi tugagach, ballar shu yerda chiqadi." />
                ) : (
                  <EmptyState
                    icon={<LineChart className="size-6" />}
                    title="Hali o'quvchi urinishi yo'q"
                    hint="O'quvchilar tayinlangan mockni topshirgach, ballar shu yerda chiqadi. Katalogdagi «Sinab ko'rish» urinishlaringizni ham ko'rishingiz mumkin."
                    action={<SoftButton className="h-[38px] rounded-[12px] px-4 text-[13px] font-bold text-primary" onClick={() => go({ preview: true })}>Sinov urinishlarini ko&apos;rish</SoftButton>}
                  />
                )
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
