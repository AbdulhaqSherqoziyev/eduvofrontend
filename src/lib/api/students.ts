import { api } from './client';
import { cleanParams } from './http';
import type { Paginated } from './http';
import type { CreateStudentInput, Student, StudentListParams } from '../types/student';

export const studentsApi = {
  list: (params: StudentListParams) =>
    api.get<Paginated<Student>>('/students', { params: cleanParams(params) }).then((r) => r.data),
  listDeleted: (params: StudentListParams) =>
    api.get<Paginated<Student>>('/students/trash', { params: cleanParams(params) }).then((r) => r.data),
  get: (id: string) => api.get<Student>(`/students/${id}`).then((r) => r.data),
  create: (input: CreateStudentInput) => api.post<Student>('/students', input).then((r) => r.data),
  update: (id: string, input: Partial<CreateStudentInput>) =>
    api.patch<Student>(`/students/${id}`, input).then((r) => r.data),
  softDelete: (id: string) => api.delete(`/students/${id}`).then((r) => r.data),
  restore: (id: string) => api.post(`/students/${id}/restore`).then((r) => r.data),
};
