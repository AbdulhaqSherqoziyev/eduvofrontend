import { api } from './client';
import { cleanParams } from './http';
import type { CatalogFamily, CatalogKpis, ResultKpis, ResultRowV3 } from './center-exams-v3';

/** Centre staff console — contract `_api-contract.md` §2.1–2.12 (`/api/exams/*`). */

export type GradingKind = 'objective' | 'ai_writing' | 'ai_speaking';
export interface SectionBrief {
  key: string; title: string; order: number; durationSec: number | null; gradingKind: GradingKind;
  available: boolean; separateSitting: boolean;
  brief: { durationSec: number | null; questions: number | null; parts: number | null; tasks: number | null };
}
export interface CatalogExam {
  code: string; family: string; name: string; label: string; configVersion: string;
  sections: SectionBrief[]; fullMock: boolean;
  prices: { full: number | null; section: number | null };
  stats: { attempts30d: number; completed30d: number; avgOverall: number | null };
}
/** §2.1 + §2b: `kpis` / `families` drive the v3 catalogue (one card per family). */
export interface Catalog { exams: CatalogExam[]; balanceUzs: number; serverNow: string; kpis: CatalogKpis; families: CatalogFamily[] }

export interface PublishedTest { id: string; examCode: string; title: string; configVersion: string; publishedAt: string | null; sections: string[] }

export type AssignmentStatusFilter = 'active' | 'upcoming' | 'past';
export interface Assignment {
  id: string; title: string; examCode: string; testId: string; testTitle: string | null;
  mode: 'full' | 'section'; sectionKey: string | null; groupId: string | null; groupName: string | null;
  windowStart: string; windowEnd: string; studentCount: number; startedCount: number; completedCount: number;
  priceUzs: number | null; priceCredits?: number | null; createdAt: string; createdByName: string | null;
}
export type AttemptStatus = 'ACTIVE' | 'COMPLETED' | 'EXPIRED' | 'CANCELLED';
export interface AssignmentStudent { studentId: string; fullName: string; attemptId: string | null; attemptStatus: AttemptStatus | null; hasAccessCode: boolean }
export interface AssignmentDetail { assignment: Assignment; students: AssignmentStudent[] }

export interface CreateAssignmentInput {
  title?: string; testId: string; mode: 'full' | 'section'; sectionKey?: string;
  groupId?: string; studentIds?: string[]; windowStart: string; windowEnd: string;
}
export interface PatchAssignmentInput { title?: string; windowStart?: string; windowEnd?: string }

export type LiveStatus = 'NOT_STARTED' | 'ACTIVE' | 'COMPLETED' | 'EXPIRED' | 'CANCELLED';
export interface LiveRow {
  studentId: string; fullName: string; attemptId: string | null; status: LiveStatus;
  currentStageKey: string | null; currentSectionKey: string | null; progressPct: number;
  answeredCount: number; totalQuestions: number; integrityCount: number; lastSeenAt: string | null; deadlineAt: string | null;
}
export interface Live { rows: LiveRow[]; serverNow: string }

export interface ResultSection { key: string; scaled: number | null; label: string | null; status: string }
export interface ResultRow {
  attemptId: string; studentId: string; fullName: string; examCode: string; testTitle: string | null;
  mode: 'full' | 'section'; status: AttemptStatus; finishedAt: string | null;
  sections: ResultSection[]; overall: number | null; integrityCount: number;
  /** `?includePreview=1` (2026-10-12): staff preview attempts ("Sinov") and who ran them. */
  isPreview?: boolean; previewBy?: { id: string; fullName: string } | null;
  /** v1.8: overall from the READY sections (also when Speaking is missing). */
  overallBand?: { value: number | null; label: string | null } | null;
}
export type ResultRowFull = ResultRow & Partial<ResultRowV3>;
export interface Results { rows: ResultRowFull[]; kpis?: ResultKpis }
export interface ResultsQuery { assignmentId?: string; groupId?: string; examCode?: string; from?: string; to?: string; includePreview?: boolean }

/** Contract §2c (v1.8). Staff-only fields are optional and read defensively (see `staff-result.ts`). */
export type StaffAttemptResult = import('@/lib/exam/types').ResultResp & {
  isPreview?: boolean; previewBy?: { id: string; fullName: string } | null;
  student?: { id: string; fullName: string; group: { id: string; name: string } | null } | null;
  assignment?: { id: string; title: string | null } | null;
  test?: { id: string; title: string | null } | null;
  attemptStatus?: string; startedAt?: string | null; finishedAt?: string | null;
  integrity?: unknown; timing?: unknown; essays?: unknown;
};

export interface PreviewSession { attemptId: string; token: string; expiresAt: string }
export interface AccessCode { studentId: string; fullName: string; code: string }

export const centerExamsApi = {
  catalog: () => api.get<Catalog>('/exams/catalog').then((r) => r.data),
  tests: (examCode?: string) =>
    api.get<{ items: PublishedTest[] }>('/exams/tests', { params: cleanParams({ examCode }) }).then((r) => r.data.items),
  assignments: (p: { status?: AssignmentStatusFilter; page?: number; limit?: number }) =>
    api.get<{ items: Assignment[]; total: number }>('/exams/assignments', { params: cleanParams(p) }).then((r) => r.data),
  create: (input: CreateAssignmentInput) =>
    api.post<{ assignment: Assignment; estimatedCostCredits: number; credits: number }>('/exams/assignments', input).then((r) => r.data),
  assignment: (id: string) => api.get<AssignmentDetail>(`/exams/assignments/${id}`).then((r) => r.data),
  patch: (id: string, input: PatchAssignmentInput) =>
    api.patch<{ assignment: Assignment }>(`/exams/assignments/${id}`, input).then((r) => r.data.assignment),
  remove: (id: string) => api.delete<{ ok: true }>(`/exams/assignments/${id}`).then((r) => r.data),
  live: (id: string) => api.get<Live>(`/exams/assignments/${id}/live`).then((r) => r.data),
  results: (q: ResultsQuery) =>
    api.get<Results>('/exams/results', { params: cleanParams({ ...q, includePreview: q.includePreview ? 1 : undefined }) }).then((r) => r.data),
  /** Staff full result (2026-10-12): the student's §1.10 result + essay text, student, assignment, integrity, timing. */
  attemptResult: (id: string) => api.get<StaffAttemptResult>(`/exams/attempts/${id}/result`).then((r) => r.data),
  preview: (testId: string, sectionKey?: string) =>
    api.post<PreviewSession>('/exams/attempts/preview', cleanParams({ testId, sectionKey })).then((r) => r.data),
  accessCodes: (assignmentId: string, studentIds?: string[]) =>
    api.post<{ codes: AccessCode[] }>('/exams/access-codes', cleanParams({ assignmentId, studentIds })).then((r) => r.data.codes),
};
