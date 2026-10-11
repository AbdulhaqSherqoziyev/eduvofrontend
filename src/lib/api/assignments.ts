import { api } from './client';
import { cleanParams } from './http';
import type { Paginated } from './http';
import type { Assignment, AssignmentFile, AssignmentListParams, CreateAssignmentInput } from '../types/assignment';
import type { HomeworkSource, MarkState, SaveMarksInput, SaveMarksResponse } from '../types/homework';

/** One enrolled student + their homework row (every student, submitted or not). */
export interface AssignmentSubmissionRow {
  submissionId: string | null;
  studentId: string;
  studentName: string;
  content: string;
  link: string;
  status: string;
  score: number | null;
  submittedAt: string | null;
  /** §A.9 — what the teacher strip shows. */
  state: MarkState;
  /** Scale snapshot of this mark; null until a score is stored. */
  scoreMax: number | null;
  /** Set from the second teacher correction on (§A.6 trace). */
  editedAt: string | null;
  source: HomeworkSource | null;
  required: boolean;
}

export const assignmentsApi = {
  list: (params: AssignmentListParams = {}) =>
    api.get<Paginated<Assignment>>('/assignments', { params: cleanParams(params) }).then((r) => r.data),
  get: (id: string) => api.get<Assignment>(`/assignments/${id}`).then((r) => r.data),
  create: (input: CreateAssignmentInput) => api.post<Assignment>('/assignments', input).then((r) => r.data),
  softDelete: (id: string) => api.delete(`/assignments/${id}`).then((r) => r.data),
  submissions: (id: string) =>
    api.get<AssignmentSubmissionRow[]>(`/assignments/${id}/submissions`).then((r) => r.data),
  /** §D.3 bulk upsert — the teacher marks a student with or without a portal submission. */
  saveMarks: (assignmentId: string, payload: SaveMarksInput) =>
    api.post<SaveMarksResponse>(`/assignments/${assignmentId}/marks`, payload).then((r) => r.data),
  grade: (submissionId: string, payload: { score?: number; status?: string }) =>
    api.patch(`/assignments/submissions/${submissionId}/grade`, payload).then((r) => r.data),
  uploadFile: (file: File) => {
    const body = new FormData();
    body.append('file', file);
    return api.post<AssignmentFile>('/assignments/files', body).then((r) => r.data);
  },
};
