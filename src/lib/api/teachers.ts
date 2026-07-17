import { api } from './client';
import { cleanParams } from './http';
import type { Paginated, ListParams } from './http';
import type { CreateTeacherInput, SetTeacherAccountInput, Teacher, TeacherAccount } from '../types/teacher';

export const teachersApi = {
  list: (params: ListParams = {}) =>
    api.get<Paginated<Teacher>>('/teachers', { params: cleanParams(params) }).then((r) => r.data),
  get: (id: string) => api.get<Teacher>(`/teachers/${id}`).then((r) => r.data),
  create: (input: CreateTeacherInput) => api.post<Teacher>('/teachers', input).then((r) => r.data),
  update: (id: string, input: Partial<CreateTeacherInput>) =>
    api.patch<Teacher>(`/teachers/${id}`, input).then((r) => r.data),
  softDelete: (id: string) => api.delete(`/teachers/${id}`).then((r) => r.data),
  getAccount: (id: string) => api.get<TeacherAccount>(`/teachers/${id}/account`).then((r) => r.data),
  setAccount: (id: string, input: SetTeacherAccountInput) =>
    api.put<TeacherAccount>(`/teachers/${id}/account`, input).then((r) => r.data),
};
