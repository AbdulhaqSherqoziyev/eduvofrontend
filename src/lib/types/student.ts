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

export interface ImportStudentRow {
  fullName: string;
  phone?: string;
  gender?: string;
  age?: number;
}

export interface CredentialRow {
  studentName: string;
  studentLogin: string;
  studentPassword: string;
  parentLogin?: string;
  parentPassword?: string;
}

export interface GenerateCredentialsInput {
  studentIds?: string[];
  includeParents?: boolean;
}

export interface ParentCredential {
  id: string;
  fullName: string;
  phone: string;
  login: string | null;
}

/** Admin view of a student's + parents' portal logins (no passwords). */
export interface CredentialsView {
  studentId: string;
  studentName: string;
  login: string | null;
  parents: ParentCredential[];
}

export interface SetStudentCredentialsInput {
  login?: string;
  password?: string;
}

export interface ParentCredentialsInput {
  fullName?: string;
  phone?: string;
  login?: string;
  password?: string;
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
];

export interface StudentProfileGroup {
  id: string;
  name: string;
  subjectName: string | null;
  teacherName: string | null;
  schedule: string;
  startTime: string;
  price: number;
}

export interface StudentProfile extends Student {
  groups: StudentProfileGroup[];
  attendance: { present: number; late: number; absent: number; excused: number; total: number; rate: number | null };
  invoices: { id: string; period: string; amount: number; paidAmount: number; status: string }[];
  transactions: { id: string; seq: number; date: string; type: 'INCOME' | 'EXPENSE'; amount: number; method: string; note: string }[];
  assignments: { total: number; graded: number; avgScore: number | null };
}
