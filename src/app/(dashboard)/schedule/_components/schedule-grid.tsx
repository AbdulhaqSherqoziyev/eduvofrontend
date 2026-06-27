'use client';

import { useWeeklySchedule } from '@/lib/hooks/use-schedule';
import { WEEK_DAYS } from '@/lib/types/schedule';
import { QueryBoundary } from '@/components/shared/query-boundary';
import { RowsSkeleton } from '@/components/shared/skeleton';
import { EmptyState } from '@/components/shared/empty-state';
import { DayColumn } from './day-column';

/** Owns the weekly schedule query and renders six day columns. */
export function ScheduleGrid() {
  const query = useWeeklySchedule({});

  return (
    <QueryBoundary
      query={query}
      loading={<RowsSkeleton rows={6} />}
      isEmpty={(d) => d.length === 0}
      empty={<EmptyState title="Dars jadvali bo,sh" hint="Hozircha rejalashtirilgan darslar yo,q." />}
    >
      {(sessions) => (
        <div className="overflow-x-auto pb-1.5">
          <div className="grid grid-cols-6 gap-[14px] min-w-[1040px]">
            {WEEK_DAYS.map((day) => (
              <DayColumn
                key={day.key}
                label={day.label}
                sessions={sessions
                  .filter((s) => s.day === day.key)
                  .sort((a, b) => a.time.localeCompare(b.time))}
              />
            ))}
          </div>
        </div>
      )}
    </QueryBoundary>
  );
}
