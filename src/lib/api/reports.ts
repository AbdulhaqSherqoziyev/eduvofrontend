import { api } from './client';
import { cleanParams } from './http';
import type { AttendanceReport, FinanceReport, ReportParams, TeacherReport } from '../types/report';

export const reportsApi = {
  finance: (params: ReportParams = {}) =>
    api.get<FinanceReport>('/reports/finance', { params: cleanParams(params) }).then((r) => r.data),
  attendance: (params: ReportParams = {}) =>
    api.get<AttendanceReport>('/reports/attendance', { params: cleanParams(params) }).then((r) => r.data),
  teacher: (params: ReportParams = {}) =>
    api.get<TeacherReport>('/reports/teacher', { params: cleanParams(params) }).then((r) => r.data),
};
