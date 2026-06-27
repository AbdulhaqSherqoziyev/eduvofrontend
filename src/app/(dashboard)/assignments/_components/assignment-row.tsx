import { ProgressBar } from '@/components/ui/progress-bar';
import { StatusPill } from '@/components/shared/status-pill';
import { formatDate } from '@/lib/utils/date';
import { ASSIGNMENT_STATUS_META, type Assignment } from '@/lib/types/assignment';
import { AssignmentRowActions } from './assignment-row-actions';

/** One assignment row — title, group, due date, submission progress + status. */
export function AssignmentRow({ assignment }: { assignment: Assignment }) {
  const { title, groupName, dueDate, submittedCount, totalCount, status } = assignment;
  const pct = totalCount > 0 ? (submittedCount / totalCount) * 100 : 0;
  const meta = ASSIGNMENT_STATUS_META[status];

  return (
    <div className="flex items-center gap-4 rounded-[16px] px-4 py-[13px] transition-shadow hover:shadow-nm-inset-sm">
      <span className="size-[10px] shrink-0 rounded-full bg-grad-primary" />
      <div className="min-w-0 flex-1">
        <div className="truncate text-[14.5px] font-bold text-foreground">{title}</div>
        <div className="truncate text-[12px] font-semibold text-muted">
          {groupName} · Muddat: {formatDate(dueDate)}
        </div>
      </div>
      <ProgressBar value={pct} className="w-[170px]" />
      <div className="shrink-0 text-[12.5px] font-semibold text-[#5b6b82]">
        {submittedCount}/{totalCount} topshirdi
      </div>
      <StatusPill label={meta.label} tone={meta.tone} />
      <AssignmentRowActions id={assignment.id} title={title} />
    </div>
  );
}
