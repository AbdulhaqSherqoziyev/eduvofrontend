import { useEffect, useState } from 'react';
import type { AttendanceMark, AttendanceStatus } from '../types/attendance';

export interface LocalMark {
  status: AttendanceStatus;
  lateMinutes: number;
  /** Lesson score; null = none. Only sent when the centre has a scale. */
  score: number | null;
}

/** A score only makes sense for someone who was in the room. */
export function isScorable(status: AttendanceStatus): boolean {
  return status === 'PRESENT' || status === 'LATE';
}

/** Local, editable copy of attendance marks seeded from the server sheet. */
export function useAttendanceMarks(initial?: AttendanceMark[]) {
  const [marks, setMarks] = useState<Record<string, LocalMark>>({});

  useEffect(() => {
    if (!initial) return;
    const next: Record<string, LocalMark> = {};
    initial.forEach((m) => {
      next[m.studentId] = { status: m.status, lateMinutes: m.lateMinutes ?? 0, score: m.score ?? null };
    });
    setMarks(next);
  }, [initial]);

  // Absent / excused drops the score; coming back leaves it empty to be re-entered.
  const setStatus = (id: string, status: AttendanceStatus) =>
    setMarks((p) => ({
      ...p,
      [id]: {
        status,
        lateMinutes: p[id]?.lateMinutes ?? 0,
        score: isScorable(status) ? (p[id]?.score ?? null) : null,
      },
    }));

  const changeLate = (id: string, delta: number) =>
    setMarks((p) => {
      const cur = p[id] ?? { status: 'LATE' as AttendanceStatus, lateMinutes: 0, score: null };
      const lateMinutes = Math.max(0, Math.min(180, cur.lateMinutes + delta));
      return { ...p, [id]: { ...cur, lateMinutes } };
    });

  const setScore = (id: string, score: number | null) =>
    setMarks((p) => {
      const cur = p[id] ?? { status: 'PRESENT' as AttendanceStatus, lateMinutes: 0, score: null };
      return { ...p, [id]: { ...cur, score } };
    });

  return { marks, setStatus, changeLate, setScore };
}
