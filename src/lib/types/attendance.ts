import type { PillTone } from '@/components/shared/status-pill';

export type AttendanceStatus = 'PRESENT' | 'LATE' | 'ABSENT' | 'EXCUSED';

export interface AttendanceMark {
  studentId: string;
  fullName: string;
  status: AttendanceStatus;
  lateMinutes: number;
  lateEdited?: boolean;
  /** Lesson score (separate from homework). null = none; absent when the centre is unscored. */
  score?: number | null;
  scoreMax?: number | null;
}

export interface AttendanceLesson {
  id: string;
  groupId: string;
  groupName: string;
  date: string;
  startTime: string;
  lessonNo: number;
}

export interface AttendanceSheet {
  lesson: AttendanceLesson;
  marks: AttendanceMark[];
  /** The centre's scale; null = unscored, so no score UI at all. */
  scoreMax?: number | null;
}

export interface SaveAttendanceInput {
  lessonId: string;
  /** `score` left out keeps the saved value; null clears it; a number is clipped to the scale server-side. */
  marks: { studentId: string; status: AttendanceStatus; lateMinutes: number; score?: number | null }[];
}

export const ATTENDANCE_META: Record<AttendanceStatus, { label: string; tone: PillTone; dot: string }> = {
  PRESENT: { label: 'Keldi', tone: 'success', dot: '#2BB673' },
  LATE: { label: 'Kechikdi', tone: 'warning', dot: '#E8A13A' },
  ABSENT: { label: 'Kelmadi', tone: 'danger', dot: '#E4574C' },
  EXCUSED: { label: 'Sababli', tone: 'muted', dot: '#7A8699' },
};
