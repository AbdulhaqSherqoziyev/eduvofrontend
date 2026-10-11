import type { PillTone } from '@/components/shared/status-pill';
import type { StudentStatus } from './student';
import type { AttendanceStatus } from './attendance';

export type GroupLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'KIDS';

export interface Group {
  id: string;
  name: string;
  subjectId?: string;
  subjectName: string;
  teacherId?: string;
  teacherName: string;
  roomId?: string | null;
  roomName: string;
  schedule: string;
  startTime: string;
  endTime: string;
  price: number;
  studentCount: number;
  attendanceRate: number;
  level: GroupLevel;
  createdAt: string;
  /** Students paying their own price here. `GET /groups/:id` only, `payment.read` only. */
  customPriceCount?: number;
}

export interface RosterEntry {
  id: string;
  studentId: string;
  fullName: string;
  status: StudentStatus;
  balance: number;
  recentAttendance: AttendanceStatus[];
  /** Present only for `payment.read` (never for the teacher). null = group price, 0 = free. */
  customPrice?: number | null;
  effectivePrice?: number;
}

export interface CreateGroupInput {
  name: string;
  subjectId?: string;
  teacherId?: string;
  roomId?: string;
  schedule: string;
  startTime: string;
  endTime?: string;
  price: number;
  level: GroupLevel;
}

export const GROUP_LEVEL_META: Record<GroupLevel, { label: string; tone: PillTone }> = {
  BEGINNER: { label: "Boshlang'ich", tone: 'muted' },
  INTERMEDIATE: { label: "O'rta", tone: 'primary' },
  ADVANCED: { label: 'Yuqori', tone: 'primary' },
  KIDS: { label: 'Bolalar', tone: 'success' },
};
