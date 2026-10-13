'use client';

import { NmCard } from '@/components/ui/nm-card';
import { QueryBoundary } from '@/components/shared/query-boundary';
import { EmptyState } from '@/components/shared/empty-state';
import { RowsSkeleton } from '@/components/shared/skeleton';
import { useTeacherReport } from '@/lib/hooks/use-reports';
import { formatSom } from '@/lib/utils/format';

/** Teacher report — per-teacher groups, students, rating and revenue. */
export function TeacherReport() {
  const query = useTeacherReport();

  return (
    <NmCard className="p-[22px]">
      <QueryBoundary
        query={query}
        loading={<RowsSkeleton rows={6} />}
        isEmpty={(d) => d.rows.length === 0}
        empty={<EmptyState title="Ma'lumot yo'q" />}
      >
        {(data) => (
          <div className="flex flex-col gap-3">
            {data.rows.map((row) => (
              <div
                key={row.fullName}
                className="grid grid-cols-[2fr_1fr_1.2fr_0.8fr_1.2fr] items-center gap-4 text-[13px]"
              >
                <div className="font-bold text-foreground">{row.fullName}</div>
                <div className="text-right font-bold text-muted">{row.groupCount} guruh</div>
                <div className="text-right font-bold text-muted">{row.studentCount} o&apos;quvchi</div>
                <div className="text-right font-bold text-primary">{row.rating}%</div>
                <div className="text-right font-bold text-foreground">{formatSom(row.revenue)}</div>
              </div>
            ))}
          </div>
        )}
      </QueryBoundary>
    </NmCard>
  );
}
