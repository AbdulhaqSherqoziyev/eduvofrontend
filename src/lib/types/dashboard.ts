export interface DashboardMetrics {
  revenue: number;
  revenueDeltaPct: number;
  expected: number;
  expectedInvoices: number;
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
