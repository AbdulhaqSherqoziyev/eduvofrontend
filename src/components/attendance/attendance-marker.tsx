'use client';

import { Can } from '@/components/shared/can';
import { NmButton } from '@/components/ui/nm-button';
import { ErrorCard } from '@/components/shared/error-card';
import { EmptyState } from '@/components/shared/empty-state';
import { RowsSkeleton } from '@/components/shared/skeleton';
import { useAttendanceSheet, useSaveAttendance } from '@/lib/hooks/use-attendance';
import { useAttendanceMarks } from '@/lib/hooks/use-attendance-marks';
import { AttendanceStudentRow } from './attendance-student-row';

/** Marking UI shared by the /attendance screen and the group-detail tab. */
export function AttendanceMarker({ groupId }: { groupId?: string }) {
  const sheet = useAttendanceSheet({ groupId });
  const save = useSaveAttendance();
  const { marks, setStatus, changeLate } = useAttendanceMarks(sheet.data?.marks);

  if (sheet.isLoading) return <RowsSkeleton rows={6} />;
  if (sheet.isError || !sheet.data) return <ErrorCard onRetry={() => sheet.refetch()} />;
  if (sheet.data.marks.length === 0) return <EmptyState title="Dars topilmadi" hint="Bugun uchun dars yo'q." />;

  const onSave = () =>
    save.mutate({
      lessonId: sheet.data.lesson.id,
      marks: Object.entries(marks).map(([studentId, m]) => ({
        studentId,
        status: m.status,
        lateMinutes: m.lateMinutes,
      })),
    });

  return (
    <div className="flex flex-col gap-3">
      {sheet.data.marks.map((m) => (
        <AttendanceStudentRow
          key={m.studentId}
          fullName={m.fullName}
          mark={marks[m.studentId]}
          onStatus={(s) => setStatus(m.studentId, s)}
          onLate={(d) => changeLate(m.studentId, d)}
        />
      ))}
      <Can permission="attendance.mark">
        <NmButton size="lg" className="mt-1 w-full" disabled={save.isPending} onClick={onSave}>
          {save.isPending ? '...' : 'Davomatni saqlash'}
        </NmButton>
      </Can>
    </div>
  );
}
