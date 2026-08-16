/**
 * The money half of the metrics is OPTIONAL: `/dashboard/metrics` sends it only
 * to a `report.finance` holder and omits the fields for everyone else. An
 * absent field means "do not draw the card" — never draw it as `0`, which a
 * reader takes for "the center earned nothing" rather than "you may not see
 * this" [Sevara].
 */
export interface DashboardMetrics {
  revenue?: number;
  revenueDeltaPct?: number;
  expected?: number;
  expectedInvoices?: number;
  activeStudents: number;
  studentsAddedThisMonth: number;
  attendanceRate: number;
}

export interface IncomePoint {
  month: string;
  value: number;
}

export interface Debtor {
  id: string;
  fullName: string;
  groupName: string;
  amount: number;
  days: number;
}

export interface TeacherPerformance {
  id: string;
  fullName: string;
  subject: string;
  rating: number;
  studentCount: number;
}

export interface ActivityItem {
  id: string;
  text: string;
  time: string;
  type: 'payment' | 'student' | 'attendance' | 'debt' | 'other';
}
