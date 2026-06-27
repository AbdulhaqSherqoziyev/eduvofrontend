import { api } from './client';
import { cleanParams } from './http';
import type { Paginated, ListParams } from './http';
import type { CreateStaffInput, Staff, UpdateStaffInput } from '../types/user';

export const usersApi = {
  list: (params: ListParams = {}) =>
    api.get<Paginated<Staff>>('/users', { params: cleanParams(params) }).then((r) => r.data),
  create: (input: CreateStaffInput) => api.post<Staff>('/users', input).then((r) => r.data),
  update: (id: string, input: UpdateStaffInput) =>
    api.patch<Staff>(`/users/${id}`, input).then((r) => r.data),
  resetPassword: (id: string, newPassword: string) =>
    api.post(`/users/${id}/reset-password`, { newPassword }).then((r) => r.data),
  remove: (id: string) => api.delete(`/users/${id}`).then((r) => r.data),
};
