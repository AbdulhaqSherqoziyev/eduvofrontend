import type { PillTone } from '@/components/shared/status-pill';

export type TeacherStatus = 'ACTIVE' | 'ON_LEAVE';

export interface TeacherGroupBrief {
  id: string;
  name: string;
  direction: string;
}

export interface Teacher {
  id: string;
  fullName: string;
  phone: string;
  directions: string;
  groups: TeacherGroupBrief[];
  groupCount: number;
  studentCount: number;
  rating: number;
  status: TeacherStatus;
}

export interface CreateTeacherInput {
  fullName: string;
  phone: string;
  directions?: string;
}

/** A teacher's login account (the User row matched by phone). */
export interface TeacherAccount {
  exists: boolean;
  login: string | null;
  fullName: string;
}

export interface SetTeacherAccountInput {
  phone?: string;
  password?: string;
}

export const TEACHER_STATUS_META: Record<TeacherStatus, { label: string; tone: PillTone }> = {
  ACTIVE: { label: 'Faol', tone: 'success' },
  ON_LEAVE: { label: "Ta'tilda", tone: 'warning' },
};
