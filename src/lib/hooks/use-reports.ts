import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '../api/reports';
import type { ReportParams } from '../types/report';

const KEY = 'reports';

export function useFinanceReport(params: ReportParams = {}) {
  return useQuery({ queryKey: [KEY, 'finance', params], queryFn: () => reportsApi.finance(params) });
}

export function useAttendanceReport(params: ReportParams = {}) {
  return useQuery({ queryKey: [KEY, 'attendance', params], queryFn: () => reportsApi.attendance(params) });
}

export function useTeacherReport(params: ReportParams = {}) {
  return useQuery({ queryKey: [KEY, 'teacher', params], queryFn: () => reportsApi.teacher(params) });
}
