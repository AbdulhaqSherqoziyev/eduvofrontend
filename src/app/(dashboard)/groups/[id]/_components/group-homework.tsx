'use client';

import { FileText } from 'lucide-react';
import { QueryBoundary } from '@/components/shared/query-boundary';
import { EmptyState } from '@/components/shared/empty-state';
import { RowsSkeleton } from '@/components/shared/skeleton';
import { ProgressBar } from '@/components/ui/progress-bar';
import { useAssignments } from '@/lib/hooks/use-assignments';
import { formatDate } from '@/lib/utils/date';

/** Homework assignments for a group with submission progress. */
export function GroupHomework({ groupId }: { groupId: string }) {
  const query = useAssignments({ groupId });

  return (
    <QueryBoundary
      query={query}
      loading={<RowsSkeleton rows={5} />}
      isEmpty={(d) => d.items.length === 0}
      empty={<EmptyState title="Vazifa yo'q" hint="Bu guruhga hali uyga vazifa berilmagan." />}
    >
      {(data) => (
        <div className="flex flex-col gap-2.5">
          {data.items.map((a) => {
            const pct = a.totalCount > 0 ? (a.submittedCount / a.totalCount) * 100 : 0;
            return (
              <div
                key={a.id}
                className="flex items-center gap-[15px] rounded-[16px] px-4 py-[13px] hover:shadow-nm-inset-sm"
              >
                <span className="grid h-[40px] w-[40px] shrink-0 place-items-center rounded-[12px] bg-background text-primary shadow-nm-sm">
                  <FileText className="h-[18px] w-[18px]" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[14px] font-bold text-foreground">{a.title}</div>
                  <div className="text-[12px] font-semibold text-muted">Muddat: {formatDate(a.dueDate)}</div>
                </div>
                <ProgressBar value={pct} className="w-[160px]" />
                <div className="w-[120px] text-right text-[12.5px] font-bold text-[#5b6b82]">
                  {a.submittedCount}/{a.totalCount} topshirdi
                </div>
              </div>
            );
          })}
        </div>
      )}
    </QueryBoundary>
  );
}
