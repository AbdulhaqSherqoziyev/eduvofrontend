'use client';

import { useRecentActivity } from '@/lib/hooks/use-dashboard';
import { QueryBoundary } from '@/components/shared/query-boundary';
import { EmptyState } from '@/components/shared/empty-state';
import { RowsSkeleton } from '@/components/shared/skeleton';
import { NmCard } from '@/components/ui/nm-card';
import { cn } from '@/lib/utils/cn';
import type { ActivityItem } from '@/lib/types/dashboard';

const DOT: Record<ActivityItem['type'], string> = {
  payment: 'bg-success',
  student: 'bg-primary',
  attendance: 'bg-primary',
  debt: 'bg-danger',
  other: 'bg-muted',
};

/** Recent activity timeline feed. */
export function ActivityFeed() {
  const query = useRecentActivity();

  return (
    <NmCard className="col-span-1 sm:col-span-2 md:col-span-5 p-[22px]">
      <div className="mb-[18px] text-[17px] font-extrabold tracking-[-0.3px] text-foreground">So,nggi faoliyat</div>
      <QueryBoundary
        query={query}
        loading={<RowsSkeleton rows={5} />}
        isEmpty={(d) => d.length === 0}
        empty={<EmptyState title="Faoliyat yo,q" />}
      >
        {(list) => (
          <div className="flex flex-col">
            {list.map((a, i) => (
              <div key={a.id} className="flex gap-3.5">
                <div className="relative flex w-3 flex-shrink-0 flex-col items-center">
                  <span className={cn('mt-1 size-3 flex-shrink-0 rounded-full', DOT[a.type])} />
                  {i < list.length - 1 ? <span className="w-px flex-1 bg-[#9aa6b8]/40" /> : null}
                </div>
                <div className="pb-4">
                  <div className="text-[13px] font-medium text-foreground">{a.text}</div>
                  <div className="text-muted">{a.time}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </QueryBoundary>
    </NmCard>
  );
}
