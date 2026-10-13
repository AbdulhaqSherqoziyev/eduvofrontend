'use client';

import { useTeacherPerformance } from '@/lib/hooks/use-dashboard';
import { QueryBoundary } from '@/components/shared/query-boundary';
import { EmptyState } from '@/components/shared/empty-state';
import { RowsSkeleton } from '@/components/shared/skeleton';
import { NmCard } from '@/components/ui/nm-card';
import { Avatar } from '@/components/ui/avatar';
import { ProgressBar } from '@/components/ui/progress-bar';

/** Teacher performance ratings with progress bars. */
export function TeacherPerformanceCard() {
  const query = useTeacherPerformance();

  return (
    <NmCard className="col-span-1 sm:col-span-2 md:col-span-7 p-[22px]">
      <div className="mb-[18px] text-[17px] font-extrabold tracking-[-0.3px] text-foreground">
        O,qituvchilar samaradorligi
      </div>
      <QueryBoundary
        query={query}
        loading={<RowsSkeleton rows={5} />}
        isEmpty={(d) => d.length === 0}
        empty={<EmptyState title="Ma'lumot yo'q" />}
      >
        {(list) => (
          <div className="flex flex-col gap-3.5">
            {list.map((t) => (
              <div key={t.id} className="flex items-center gap-3">
                <Avatar name={t.fullName} size={38} />
                <div className="w-[148px] min-w-0">
                  <div className="truncate font-bold text-foreground">{t.fullName}</div>
                  <div className="truncate text-muted">{t.subject}</div>
                </div>
                <ProgressBar value={t.rating} className="flex-1" />
                <div className="w-[42px] text-right font-bold text-primary">{t.rating}%</div>
                <div className="w-[84px] text-right text-muted">{t.studentCount} o,quvchi</div>
              </div>
            ))}
          </div>
        )}
      </QueryBoundary>
    </NmCard>
  );
}
