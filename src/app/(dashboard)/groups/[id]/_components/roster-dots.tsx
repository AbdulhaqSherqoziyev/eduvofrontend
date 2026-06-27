import { ATTENDANCE_META, type AttendanceStatus } from '@/lib/types/attendance';

/** Tiny coloured dots showing the last lessons' attendance for a student. */
export function RosterDots({ dots }: { dots: AttendanceStatus[] }) {
  if (dots.length === 0) return <span className="text-[12px] font-semibold text-muted">—</span>;
  return (
    <div className="flex items-center gap-1.5">
      {dots.map((d, i) => (
        <span
          key={i}
          className="h-[10px] w-[10px] rounded-full"
          style={{ backgroundColor: ATTENDANCE_META[d].dot }}
        />
      ))}
    </div>
  );
}
