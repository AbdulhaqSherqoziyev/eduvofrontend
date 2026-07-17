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
}

export interface RosterEntry {
  id: string;
  studentId: string;
  fullName: string;
  status: StudentStatus;
  balance: number;
  recentAttendance: AttendanceStatus[];
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
