import type { PillTone } from '@/components/shared/status-pill';

export type StudentStatus = 'ACTIVE' | 'DEBTOR' | 'TRIAL';

export interface Student {
  id: string;
  fullName: string;
  phone: string;
  studentCode?: string;
  groupId?: string;
  groupName?: string;
  balance: number;
  status: StudentStatus;
  createdAt?: string;
  deletedAt?: string | null;
}

export interface CreateStudentInput {
  fullName: string;
  phone: string;
  groupId?: string;
}

export interface StudentListParams {
  search?: string;
  status?: StudentStatus;
  page?: number;
  limit?: number;
}

export const STUDENT_STATUS_META: Record<StudentStatus, { label: string; tone: PillTone }> = {
  ACTIVE: { label: 'Faol', tone: 'success' },
  DEBTOR: { label: 'Qarzdor', tone: 'danger' },
  TRIAL: { label: 'Sinov', tone: 'warning' },
};

/** Segmented filter for the students screen (value '' = all). */
export const STUDENT_FILTERS: { value: string; label: string }[] = [
  { value: '', label: 'Hammasi' },
  { value: 'ACTIVE', label: 'Faol' },
  { value: 'DEBTOR', label: 'Qarzdorlar' },
  { value: 'TRIAL', label: 'Sinov' },
];
