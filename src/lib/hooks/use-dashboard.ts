import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../api/dashboard';

const KEY = 'dashboard';

export function useDashboardMetrics() {
  return useQuery({ queryKey: [KEY, 'metrics'], queryFn: dashboardApi.metrics });
}

export function useIncomeChart() {
  return useQuery({ queryKey: [KEY, 'income'], queryFn: dashboardApi.income });
}

export function useDebtors() {
  return useQuery({ queryKey: [KEY, 'debtors'], queryFn: dashboardApi.debtors });
}

export function useTeacherPerformance() {
  return useQuery({ queryKey: [KEY, 'teacher-performance'], queryFn: dashboardApi.teacherPerformance });
}

export function useRecentActivity() {
  return useQuery({ queryKey: [KEY, 'activity'], queryFn: dashboardApi.activity });
}
