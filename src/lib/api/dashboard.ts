import { api } from './client';
import type {
  ActivityItem, DashboardMetrics, Debtor, IncomePoint, TeacherPerformance,
} from '../types/dashboard';

export const dashboardApi = {
  metrics: () => api.get<DashboardMetrics>('/dashboard/metrics').then((r) => r.data),
  income: () => api.get<IncomePoint[]>('/dashboard/income').then((r) => r.data),
  debtors: () => api.get<Debtor[]>('/dashboard/debtors').then((r) => r.data),
  teacherPerformance: () =>
    api.get<TeacherPerformance[]>('/dashboard/teacher-performance').then((r) => r.data),
  activity: () => api.get<ActivityItem[]>('/dashboard/activity').then((r) => r.data),
};
