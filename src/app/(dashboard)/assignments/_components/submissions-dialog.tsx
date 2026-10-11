'use client';

import { useState } from 'react';
import { ClipboardList } from 'lucide-react';
import { NmDialog } from '@/components/ui/nm-dialog';
import { NmIconButton } from '@/components/ui/nm-icon-button';
import { Avatar } from '@/components/ui/avatar';
import { RowsSkeleton } from '@/components/shared/skeleton';
import { ErrorCard } from '@/components/shared/error-card';
import { HomeworkStrip } from '@/components/homework/homework-strip';
import { can } from '@/lib/auth/permissions';
import { useSubmissions } from '@/lib/hooks/use-assignments';
import { countMarked } from '@/lib/types/homework';

interface Props {
  assignmentId: string;
  title: string;
  /** The assignment's scale (null = Bajardi/Qilmadi only) — comes from the list row. */
  scoreMax: number | null;
}

/** Teacher view from the list: every enrolled student with the same strip as the detail page (§A.9). */
export function SubmissionsDialog({ assignmentId, title, scoreMax }: Props) {
  const [open, setOpen] = useState(false);
  const query = useSubmissions(assignmentId, open);
  const canGrade = can('assignment.grade');
  const rows = query.data;
  const counter = rows ? countMarked(rows) : null;

  return (
    <NmDialog
      open={open}
      onOpenChange={setOpen}
      title={title}
      trigger={
        <NmIconButton aria-label="Uy vazifasi belgilari">
          <ClipboardList className="size-[15px]" strokeWidth={2} />
        </NmIconButton>
      }
    >
      <div className="flex max-h-[60vh] flex-col gap-2.5 overflow-y-auto pr-1">
        {query.isLoading ? <RowsSkeleton rows={4} /> : null}
        {query.isError ? <ErrorCard onRetry={() => query.refetch()} /> : null}
        {counter ? (
          <p className="text-[12.5px] font-semibold text-muted">Belgilandi {counter.marked} / {counter.total}</p>
        ) : null}
        {rows?.map((s) => (
          <div key={s.studentId} className="rounded-[16px] bg-background p-3 shadow-nm-sm">
            <div className="flex items-center gap-2.5">
              <Avatar name={s.studentName} size={30} />
              <span className="min-w-0 flex-1 truncate text-[13px] font-bold text-foreground">{s.studentName}</span>
            </div>
            {s.content ? <p className="mt-1.5 whitespace-pre-wrap text-[12px] text-muted">{s.content}</p> : null}
            {s.link ? (
              <a href={s.link} target="_blank" rel="noreferrer" className="mt-0.5 block truncate text-[12px] font-semibold text-primary underline">
                {s.link}
              </a>
            ) : null}
            <HomeworkStrip
              className="mt-2.5"
              assignmentId={assignmentId}
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
        {rows && rows.length === 0 ? <p className="text-[13px] text-muted">Guruhda o&apos;quvchi yo&apos;q</p> : null}
      </div>
    </NmDialog>
  );
}
