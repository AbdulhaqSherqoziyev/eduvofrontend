export interface FinanceReportRow {
  label: string;
  income: number;
  expense: number;
}

export interface FinanceCategoryRow {
  category: string;
  amount: number;
}

export interface FinanceReport {
  collected: number;
  expected: number;
  expense: number;
  net: number;
  months: number;
  rows: FinanceReportRow[];
  byCategory: FinanceCategoryRow[];
}

export interface AttendanceReportRow {
  groupName: string;
  rate: number;
  lateCount: number;
  absentCount: number;
}

export interface AttendanceReport {
  averageRate: number;
  rows: AttendanceReportRow[];
}

export interface TeacherReportRow {
  fullName: string;
  groupCount: number;
  studentCount: number;
  rating: number;
  revenue: number;
}

export interface TeacherReport {
  rows: TeacherReportRow[];
}

export interface ReportParams {
  months?: number;
  from?: string;
  to?: string;
}
