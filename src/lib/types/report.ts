export interface FinanceReportRow {
  label: string;
  income: number;
  expense: number;
  /** YYYY-MM-DD bounds of the bucket (Tashkent day). */
  from?: string;
  to?: string;
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
  /** Resolved YYYY-MM-DD bounds the server actually reported on. */
  from?: string;
  to?: string;
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

/** Either `months` (preset) or `from` + `to` (YYYY-MM-DD, max 24 months) — never both. */
export interface ReportParams {
  months?: number;
  from?: string;
  to?: string;
}
