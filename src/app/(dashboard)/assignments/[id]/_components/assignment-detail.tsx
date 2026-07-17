'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, Paperclip } from 'lucide-react';
import { NmCard } from '@/components/ui/nm-card';
import { NmInput } from '@/components/ui/nm-input';
import { NmButton } from '@/components/ui/nm-button';
import { ProgressBar } from '@/components/ui/progress-bar';
import { Avatar } from '@/components/ui/avatar';
import { StatusPill } from '@/components/shared/status-pill';
import { QueryBoundary } from '@/components/shared/query-boundary';
import { RowsSkeleton } from '@/components/shared/skeleton';
import { EmptyState } from '@/components/shared/empty-state';
import { useAssignment, useSubmissions, useGradeSubmission } from '@/lib/hooks/use-assignments';
import { formatDate } from '@/lib/utils/date';
import { ASSIGNMENT_STATUS_META } from '@/lib/types/assignment';

/** Full assignment profile: info card + per-student submission/grade list. */
export function AssignmentDetail({ id }: { id: string }) {
  const query = useAssignment(id);
  const submissions = useSubmissions(id, true);
  const grade = useGradeSubmission(id);
  const [scores, setScores] = useState<Record<string, string>>({});

  return (
    <section className="flex flex-col gap-5">
      <Link href="/assignments" className="flex w-fit items-center gap-1.5 text-[13px] font-bold text-muted hover:text-primary">
        <ChevronLeft className="size-[15px]" strokeWidth={2.4} /> Vazifalar ro&apos;yxati
      </Link>

      <QueryBoundary query={query} loading={<RowsSkeleton rows={3} />} isEmpty={() => false} empty={null}>
        {(a) => {
          const pct = a.totalCount > 0 ? (a.submittedCount / a.totalCount) * 100 : 0;
          const meta = ASSIGNMENT_STATUS_META[a.status];
          return (
            <NmCard className="p-[22px]">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <h1 className="text-[20px] font-extrabold tracking-[-0.3px] text-foreground">{a.title}</h1>
                    <StatusPill label={meta.label} tone={meta.tone} />
                  </div>
                  <p className="mt-1 text-[13px] font-semibold text-muted">
                    {a.groupName} · Muddat: {formatDate(a.dueDate)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <ProgressBar value={pct} className="w-[170px]" />
                  <span className="text-[12.5px] font-semibold text-muted">{a.submittedCount}/{a.totalCount} topshirdi</span>
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
        <h2 className="text-[16px] font-extrabold tracking-[-0.3px] text-foreground">Topshiriqlar</h2>
        <QueryBoundary
          query={submissions}
          loading={<RowsSkeleton rows={5} />}
          isEmpty={(d) => d.length === 0}
          empty={<EmptyState title="Guruhda o'quvchi yo'q" />}
        >
          {(rows) => (
            <div className="flex flex-col gap-2.5">
              {rows.map((s) => {
                const raw = scores[s.submissionId ?? ''] ?? (s.score != null ? String(s.score) : '');
                const parsed = Number(raw);
                const valid = raw.trim() !== '' && Number.isInteger(parsed) && parsed >= 0 && parsed <= 100;
                return (
                  <div key={s.studentId} className="rounded-[14px] bg-background px-4 py-3 shadow-nm-inset-sm">
                    <div className="flex items-center gap-3">
                      <Avatar name={s.studentName} size={34} />
                      <span className="min-w-0 flex-1 truncate text-[13.5px] font-bold text-foreground">{s.studentName}</span>
                      {s.submissionId ? (
                        <StatusPill tone={s.score != null ? 'success' : 'primary'}
                          label={s.score != null ? `${s.score} ball` : 'Topshirgan'} />
                      ) : (
                        <StatusPill tone="danger" label="Topshirmagan" />
                      )}
                    </div>
                    {s.content ? <p className="mt-2 whitespace-pre-wrap text-[12.5px] font-medium text-muted">{s.content}</p> : null}
                    {s.link ? (
                      <a href={s.link} target="_blank" rel="noreferrer" className="mt-1 block truncate text-[12.5px] font-semibold text-primary underline">
                        {s.link}
                      </a>
                    ) : null}
                    {s.submittedAt ? <p className="mt-1 text-[11.5px] font-semibold text-muted">Topshirilgan: {formatDate(s.submittedAt)}</p> : null}
                    {s.submissionId ? (
                      <div className="mt-2.5 flex items-center gap-2">
                        <NmInput
                          inputMode="numeric"
                          placeholder="Ball (0-100)"
                          className="max-w-[130px]"
                          value={raw}
                          onChange={(e) => setScores({ ...scores, [s.submissionId as string]: e.target.value })}
                        />
                        <NmButton size="sm" disabled={grade.isPending || !valid}
                          onClick={() => grade.mutate({ submissionId: s.submissionId as string, score: parsed })}>
                          Baholash
                        </NmButton>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}
        </QueryBoundary>
      </NmCard>
    </section>
  );
}
