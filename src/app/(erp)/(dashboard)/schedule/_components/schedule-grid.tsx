"use client";

import { useState } from "react";
import { useWeeklySchedule } from "@/lib/hooks/use-schedule";
import { WEEK_DAYS } from "@/lib/types/schedule";
import { QueryBoundary } from "@/components/shared/query-boundary";
import { RowsSkeleton } from "@/components/shared/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { NmSelect } from "@/components/ui/nm-select";
import { Can } from "@/components/shared/can";
import { useTeacherOptions } from "@/lib/hooks/use-teachers";
import { DayColumn } from "./day-column";
import { ExtraLessonDialog } from "./extra-lesson-dialog";

/** Weekly 7-day schedule — teacher filter + extra-lesson booking. */
export function ScheduleGrid() {
  const [teacherId, setTeacherId] = useState("");
  const teachers = useTeacherOptions();
  const query = useWeeklySchedule(teacherId ? { teacherId } : {});

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <NmSelect value={teacherId} onChange={(e) => setTeacherId(e.target.value)} className="sm:max-w-[260px]">
          <option value="">Barcha o‘qituvchilar</option>
          {teachers.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </NmSelect>
        <Can permission="lesson.update">
          <ExtraLessonDialog />
        </Can>
      </div>
      <QueryBoundary
        query={query}
        loading={<RowsSkeleton rows={6} />}
        isEmpty={() => false}
        empty={<EmptyState title="Dars jadvali bo‘sh" hint="Hozircha darslar yo‘q." />}
      >
        {(sessions) => (
          <div className="overflow-x-auto pb-1.5">
            <div className="grid grid-cols-7 gap-[12px] min-w-[1200px]">
              {WEEK_DAYS.map((day) => (
                <DayColumn
                  key={day.key}
                  label={day.label}
                  sessions={sessions
                    .filter((s) => s.day === day.key)
                    .sort((a, b) => a.startTime.localeCompare(b.startTime))}
                />
              ))}
            </div>
          </div>
        )}
      </QueryBoundary>
    </div>
  );
}
