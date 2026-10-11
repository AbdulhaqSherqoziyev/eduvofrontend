'use client';

import Link from 'next/link';
import { ChevronLeft, Paperclip } from 'lucide-react';
import { NmCard } from '@/components/ui/nm-card';
import { ProgressBar } from '@/components/ui/progress-bar';
import { Avatar } from '@/components/ui/avatar';
import { StatusPill } from '@/components/shared/status-pill';
import { RowIndex } from '@/components/shared/row-index';
import { QueryBoundary } from '@/components/shared/query-boundary';
import { RowsSkeleton } from '@/components/shared/skeleton';
import { EmptyState } from '@/components/shared/empty-state';
import { HomeworkStrip } from '@/components/homework/homework-strip';
import { can } from '@/lib/auth/permissions';
import { useAssignment, useSubmissions } from '@/lib/hooks/use-assignments';
import { formatDate } from '@/lib/utils/date';
import { ASSIGNMENT_STATUS_META } from '@/lib/types/assignment';
import { countMarked } from '@/lib/types/homework';

/**
 * Assignment profile: info card + one homework strip per enrolled student (§A.9).
 * Every student is listed — a child who never opens the portal is marked here
 * by the teacher, with or without a score.
 */
export function AssignmentDetail({ id }: { id: string }) {
  const query = useAssignment(id);
  const submissions = useSubmissions(id, true);
  const canGrade = can('assignment.grade');
  const counter = submissions.data ? countMarked(submissions.data) : null;
  const scoreMax = query.data?.scoreMax ?? null;

  return (
    <section className="flex flex-col gap-5">
      <Link href="/assignments" className="flex w-fit items-center gap-1.5 text-[13px] font-bold text-muted hover:text-primary">
        <ChevronLeft className="size-[15px]" strokeWidth={2.4} /> Vazifalar ro&apos;yxati
      </Link>

      <QueryBoundary query={query} loading={<RowsSkeleton rows={3} />} isEmpty={() => false} empty={null}>
        {(a) => {
          // `submittedCount` is "rows with any mark", so it is the right fallback until the list loads.
          const marked = counter?.marked ?? a.submittedCount;
          const total = counter?.total ?? a.totalCount;
          const pct = total > 0 ? (marked / total) * 100 : 0;
          const meta = ASSIGNMENT_STATUS_META[a.status];
          return (
            <NmCard className="p-[22px]">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-[20px] font-extrabold tracking-[-0.3px] text-foreground">{a.title}</h1>
                    <StatusPill label={meta.label} tone={meta.tone} />
                  </div>
                  <p className="mt-1 text-[13px] font-semibold text-muted">
                    {a.groupName} · Muddat: {formatDate(a.dueDate)}
                    {a.scoreMax != null ? ` · /${a.scoreMax}` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <ProgressBar value={pct} className="w-[170px] max-w-full" />
                  <span className="whitespace-nowrap text-[12.5px] font-semibold text-muted">
                    Belgilandi {marked} / {total}
                  </span>
                </div>
              </div>
              {a.description ? (
                <p className="mt-4 whitespace-pre-wrap rounded-[14px] bg-background px-4 py-3 text-[13.5px] font-medium text-foreground shadow-nm-inset-sm">
                  {a.description}
                </p>
              ) : null}
              {a.files?.length ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {a.files.map((f) => (
                    <a key={f.id} href={f.url} target="_blank" rel="noreferrer"
                      className="flex items-center gap-1.5 rounded-[10px] px-3 py-1.5 text-[12px] font-bold text-primary shadow-nm-sm nm-pressable">
                      <Paperclip className="size-[13px]" strokeWidth={2.2} /> {f.name}
                    </a>
                  ))}
                </div>
              ) : null}
            </NmCard>
          );
        }}
      </QueryBoundary>

      <NmCard className="flex flex-col gap-3 p-[22px]">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-[16px] font-extrabold tracking-[-0.3px] text-foreground">O&apos;quvchilar</h2>
          {counter ? (
            <span className="text-[12.5px] font-semibold text-muted">Belgilandi {counter.marked} / {counter.total}</span>
          ) : null}
        </div>
        <QueryBoundary
          query={submissions}
          loading={<RowsSkeleton rows={6} />}
          isEmpty={(d) => d.length === 0}
          empty={<EmptyState title="Guruhda o'quvchi yo'q" hint="Avval guruhga o'quvchi qo'shing." />}
        >
          {(rows) => (
            <div className="flex flex-col gap-2.5">
              {rows.map((s, i) => (
                <div key={s.studentId} className="rounded-[18px] bg-background p-3.5 shadow-nm-sm">
                  <div className="flex items-center gap-3">
                    <RowIndex n={i + 1} />
                    <Avatar name={s.studentName} size={34} />
                    <span className="min-w-0 flex-1 truncate text-[13.5px] font-bold text-foreground">{s.studentName}</span>
                  </div>
                  {s.content ? <p className="mt-2 whitespace-pre-wrap text-[12.5px] font-medium text-muted">{s.content}</p> : null}
                  {s.link ? (
                    <a href={s.link} target="_blank" rel="noreferrer" className="mt-1 block truncate text-[12.5px] font-semibold text-primary underline">
                      {s.link}
                    </a>
                  ) : null}
                  {s.source === 'PORTAL' && s.submittedAt ? (
                    <p className="mt-1 text-[11.5px] font-semibold text-muted">Topshirilgan: {formatDate(s.submittedAt)}</p>
                  ) : null}
                  <HomeworkStrip
                    className="mt-3"
                    assignmentId={id}
                    studentId={s.studentId}
                    state={s.state}
                    score={s.score}
                    scoreMax={scoreMax}
                    source={s.source}
                    editedAt={s.editedAt}
                    readOnly={!canGrade}
                  />
                </div>
              ))}
            </div>
          )}
        </QueryBoundary>
      </NmCard>
    </section>
  );
}
