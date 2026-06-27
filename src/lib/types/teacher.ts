import type { PillTone } from '@/components/shared/status-pill';

export type TeacherStatus = 'ACTIVE' | 'ON_LEAVE';
export type SalaryType = 'PERCENTAGE' | 'PER_LESSON' | 'PER_HOUR' | 'FIXED';

export interface Teacher {
  id: string;
  fullName: string;
  phone: string;
  directions: string;
  groupCount: number;
  studentCount: number;
  rating: number;
  salary: number;
  salaryType: SalaryType;
  status: TeacherStatus;
}

export interface CreateTeacherInput {
  fullName: string;
  phone: string;
  salary: number;
  subjectId?: string;
}

export const TEACHER_STATUS_META: Record<TeacherStatus, { label: string; tone: PillTone }> = {
  ACTIVE: { label: 'Faol', tone: 'success' },
  ON_LEAVE: { label: "Ta'tilda", tone: 'warning' },
};
