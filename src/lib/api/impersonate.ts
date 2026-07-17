import { api } from './client';
import type { Session } from '../auth/types';

export interface StudentImpersonation {
  accessToken: string;
  role: string;
  studentName: string;
}

/** Tenant-side "login as" — director/admin enters a user's view. */
export const impersonateApi = {
  user: (id: string) => api.post<Session>(`/impersonate/user/${id}`).then((r) => r.data),
  teacher: (id: string) => api.post<Session>(`/impersonate/teacher/${id}`).then((r) => r.data),
  student: (id: string) => api.post<StudentImpersonation>(`/impersonate/student/${id}`).then((r) => r.data),
};
