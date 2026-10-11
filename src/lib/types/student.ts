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

/**
 * `groupId` on a PATCH MOVES the student; `fromGroupId` names the group being
 * left (needed when the student sits in 2+ groups, else 409 MULTI_GROUP).
 */
export interface UpdateStudentInput extends Partial<CreateStudentInput> {
  fromGroupId?: string;
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

/**
 * This month's invoice seen from one group. `amount`/`paidAmount` are this
 * group's line; `hasPayment` is invoice-wide — the same test the PATCH uses to
 * choose CURRENT_PERIOD vs NEXT_PERIOD.
 */
export interface EnrollmentCurrentInvoice {
  period: string;
  amount: number;
  paidAmount: number;
  hasPayment: boolean;
}

export interface StudentProfileGroup {
  id: string;
  name: string;
  subjectName: string | null;
  teacherName: string | null;
  schedule: string;
  startTime: string;
  /** The GROUP's price (not what this student pays). */
  price: number;
  enrollmentId: string;
  /**
   * The three below are sent ONLY to `payment.read` — the keys are absent, not
   * null, for everyone else, so `effectivePrice === undefined` hides the price.
   * `customPrice`: null = group price, 0 = free.
   */
  customPrice?: number | null;
  effectivePrice?: number;
  currentInvoice?: EnrollmentCurrentInvoice | null;
}

export type PriceAppliedTo = 'CURRENT_PERIOD' | 'NEXT_PERIOD';

/** `PATCH /enrollments/:id` body — null returns the student to the group price. */
export interface UpdateEnrollmentPriceInput {
  price: number | null;
}

export interface EnrollmentPriceResult {
  id: string;
  studentId: string;
  groupId: string;
  groupPrice: number;
  customPrice: number | null;
  effectivePrice: number;
  previousCustomPrice: number | null;
  appliedTo: PriceAppliedTo;
  /** "YYYY-MM" — the first month the new price is charged. */
  period: string;
  /**
   * The invoice's new TOTAL after a CURRENT_PERIOD rewrite (0 = the invoice
   * came out empty and was removed); null for NEXT_PERIOD or no invoice yet.
   * Optional until the backend ships it.
   */
  invoiceAmount?: number | null;
}

export interface StudentProfile extends Student {
  groups: StudentProfileGroup[];
  attendance: { present: number; late: number; absent: number; excused: number; total: number; rate: number | null };
  invoices: { id: string; period: string; amount: number; paidAmount: number; status: string }[];
  transactions: { id: string; seq: number; date: string; type: 'INCOME' | 'EXPENSE'; amount: number; method: string; note: string }[];
  assignments: { total: number; graded: number; avgScore: number | null };
}
