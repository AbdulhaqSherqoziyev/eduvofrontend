import { api } from './client';
import { cleanParams } from './http';
import type { Paginated } from './http';
import type {
  CreateStudentInput, CredentialRow, CredentialsView, GenerateCredentialsInput, ImportStudentRow,
  ParentCredentialsInput, SetStudentCredentialsInput, Student, StudentListParams, StudentProfile,
} from '../types/student';

export const studentsApi = {
  list: (params: StudentListParams) =>
    api.get<Paginated<Student>>('/students', { params: cleanParams(params) }).then((r) => r.data),
  listDeleted: (params: StudentListParams) =>
    api.get<Paginated<Student>>('/students/trash', { params: cleanParams(params) }).then((r) => r.data),
  get: (id: string) => api.get<Student>(`/students/${id}`).then((r) => r.data),
  profile: (id: string) => api.get<StudentProfile>(`/students/${id}/profile`).then((r) => r.data),
  create: (input: CreateStudentInput) => api.post<Student>('/students', input).then((r) => r.data),
  update: (id: string, input: Partial<CreateStudentInput>) =>
    api.patch<Student>(`/students/${id}`, input).then((r) => r.data),
  softDelete: (id: string) => api.delete(`/students/${id}`).then((r) => r.data),
  restore: (id: string) => api.post(`/students/${id}/restore`).then((r) => r.data),
  importStudents: (students: ImportStudentRow[]) =>
    api.post<{ created: number }>('/students/import', { students }).then((r) => r.data),
  generateCredentials: (input: GenerateCredentialsInput) =>
    api.post<CredentialRow[]>('/students/credentials', input).then((r) => r.data),
  getCredentials: (id: string) =>
    api.get<CredentialsView>(`/students/${id}/credentials`).then((r) => r.data),
  setCredentials: (id: string, input: SetStudentCredentialsInput) =>
    api.put<CredentialsView>(`/students/${id}/credentials`, input).then((r) => r.data),
  createParent: (id: string, input: ParentCredentialsInput) =>
    api.post<CredentialsView>(`/students/${id}/parents`, input).then((r) => r.data),
  setParentCredentials: (id: string, parentId: string, input: ParentCredentialsInput) =>
    api.put<CredentialsView>(`/students/${id}/parents/${parentId}/credentials`, input).then((r) => r.data),
};
