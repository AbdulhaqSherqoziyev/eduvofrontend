import { api } from './client';
import { cleanParams } from './http';
import type { Paginated, ListParams } from './http';
import type { CreateSubjectInput, Subject } from '../types/subject';

export const subjectsApi = {
  list: (params: ListParams = {}) =>
    api.get<Paginated<Subject>>('/subjects', { params: cleanParams(params) }).then((r) => r.data),
  create: (input: CreateSubjectInput) => api.post<Subject>('/subjects', input).then((r) => r.data),
  update: (id: string, input: Partial<CreateSubjectInput>) =>
    api.patch<Subject>(`/subjects/${id}`, input).then((r) => r.data),
  softDelete: (id: string) => api.delete(`/subjects/${id}`).then((r) => r.data),
};
