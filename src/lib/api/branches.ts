import { api } from './client';
import type { Session } from '../auth/types';
import type { Branch, CreateBranchInput } from '../types/branch';

export const branchesApi = {
  list: () => api.get<Branch[]>('/branches').then((r) => r.data),
  create: (input: CreateBranchInput) =>
    api.post<{ id: string; name: string }>('/branches', input).then((r) => r.data),
  enter: (id: string) => api.post<Session>(`/branches/${id}/enter`).then((r) => r.data),
};
