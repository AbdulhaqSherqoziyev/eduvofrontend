import { useEffect, useState } from 'react';
import type { AttendanceMark, AttendanceStatus } from '../types/attendance';

export interface LocalMark {
  status: AttendanceStatus;
  lateMinutes: number;
}

/** Local, editable copy of attendance marks seeded from the server sheet. */
export function useAttendanceMarks(initial?: AttendanceMark[]) {
  const [marks, setMarks] = useState<Record<string, LocalMark>>({});

  useEffect(() => {
    if (!initial) return;
    const next: Record<string, LocalMark> = {};
    initial.forEach((m) => {
      next[m.studentId] = { status: m.status, lateMinutes: m.lateMinutes ?? 0 };
    });
    setMarks(next);
  }, [initial]);

  const setStatus = (id: string, status: AttendanceStatus) =>
    setMarks((p) => ({ ...p, [id]: { status, lateMinutes: p[id]?.lateMinutes ?? 0 } }));

  const changeLate = (id: string, delta: number) =>
    setMarks((p) => {
      const cur = p[id] ?? { status: 'LATE' as AttendanceStatus, lateMinutes: 0 };
      const lateMinutes = Math.max(0, Math.min(180, cur.lateMinutes + delta));
      return { ...p, [id]: { ...cur, lateMinutes } };
    });

  return { marks, setStatus, changeLate };
}
