import { api } from './client';
import { cleanParams } from './http';
import type { Paginated } from './http';
import type { Assignment, AssignmentFile, AssignmentListParams, CreateAssignmentInput } from '../types/assignment';

export const assignmentsApi = {
  list: (params: AssignmentListParams = {}) =>
    api.get<Paginated<Assignment>>('/assignments', { params: cleanParams(params) }).then((r) => r.data),
  get: (id: string) => api.get<Assignment>(`/assignments/${id}`).then((r) => r.data),
  create: (input: CreateAssignmentInput) => api.post<Assignment>('/assignments', input).then((r) => r.data),
  softDelete: (id: string) => api.delete(`/assignments/${id}`).then((r) => r.data),
  uploadFile: (file: File) => {
    const body = new FormData();
    body.append('file', file);
    return api.post<AssignmentFile>('/assignments/files', body).then((r) => r.data);
  },
};
