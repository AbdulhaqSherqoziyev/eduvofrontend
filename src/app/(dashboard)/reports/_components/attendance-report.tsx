'use client';

import { NmCard } from '@/components/ui/nm-card';
import { CircularProgress } from '@/components/ui/circular-progress';
import { QueryBoundary } from '@/components/shared/query-boundary';
import { EmptyState } from '@/components/shared/empty-state';
import { CardGridSkeleton } from '@/components/shared/skeleton';
import { useAttendanceReport } from '@/lib/hooks/use-reports';

/** Attendance report — average rate dial + per-group rates. */
export function AttendanceReport() {
  const query = useAttendanceReport();

  return (
    <QueryBoundary
      query={query}
      loading={<CardGridSkeleton count={2} />}
      isEmpty={(d) => d.rows.length === 0}
      empty={<EmptyState title="Ma'lumot yo'q" />}
    >
      {(data) => (
        <div className="flex flex-col gap-[22px]">
          <NmCard className="flex items-center gap-6 p-[22px]">
            <CircularProgress value={data.averageRate} size={90} />
            <div className="text-[11px] font-bold uppercase tracking-[0.7px] text-muted">
              O&apos;RTACHA DAVOMAT
            </div>
          </NmCard>
          <NmCard className="p-[22px]">
            <div className="flex flex-col gap-3">
              {data.rows.map((row) => (
                <div
                  key={row.groupName}
                  className="grid grid-cols-[2fr_1fr_1fr_1fr] items-center gap-4 text-[13px]"
                >
                  <div className="font-bold text-foreground">{row.groupName}</div>
                  <div className="text-right font-bold text-primary">{row.rate}%</div>
                  <div className="text-right font-bold text-warning">{row.lateCount} kech</div>
                  <div className="text-right font-bold text-danger">{row.absentCount} yo&apos;q</div>
                </div>
              ))}
            </div>
          </NmCard>
        </div>
      )}
    </QueryBoundary>
  );
}
