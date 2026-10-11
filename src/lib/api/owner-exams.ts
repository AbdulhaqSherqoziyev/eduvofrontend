import { api } from './client';

/** Platform test bank — contract `_api-contract.md` §3 (OWNER / `exam.manage`). */

export type TestStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export interface BankTestRow {
  id: string; examCode: string; title: string; status: TestStatus; configVersion: string;
  questionCount: number; createdAt: string; publishedAt: string | null; errorCount?: number; warnCount?: number;
}
export interface ReportLine { level: 'ok' | 'warn' | 'error'; path: string; message: string }
export interface ImportResult {
  ok: boolean; testId: string | null; report: ReportLine[]; counts?: { stages: number; questions: number };
  media?: { name: string; assetId: string; kind: string; durationMs: number | null }[];
}

export interface BankQuestion {
  id: string; no: number; type: string; check: string; content: Record<string, unknown>;
  answerKey: unknown; accepted: string[]; points: number; isScored: boolean; explanation: string | null;
}
export interface BankGroup { id: string; layout: string | null; instructions: string | null; content: Record<string, unknown> | null; multiGroup: boolean; questions: BankQuestion[] }
export interface BankPart { id: string; part: number; title: string | null; instructions: string | null; passageHtml: string | null; audioAssetId: string | null; audioDurationMs: number | null; imageAssetId: string | null; groups: BankGroup[] }
export interface BankStage { id: string; sectionKey: string; stageKey: string; variantKey: string; meta: Record<string, unknown> | null; parts: BankPart[] }
export interface BankTest { id: string; examCode: string; title: string; status: TestStatus; configVersion: string; publishedAt: string | null; stages: BankStage[] }

export interface QuestionPatch { id: string; answerKey?: unknown[]; accepted?: string[]; explanation?: string | null }

export interface ConfigRow { code: string; family: string; name: string; status: string; version: string; isActive: boolean }
export interface TableRow { code: string; version: string | number; examCode: string | null; section: string | null; route: string | null; input: string; isEstimated: boolean; rowsCount: number }
export interface TableDetail extends Omit<TableRow, 'rowsCount'> { rows: { min: number; value: number | string; label?: string }[] }

/** axios throws on 422 — the dry-run report is still the body we want. */
async function importCall(form: FormData, dryRun: boolean): Promise<ImportResult> {
  try {
    const r = await api.post<ImportResult>(`/platform/exams/tests/import${dryRun ? '?dryRun=1' : ''}`, form, { timeout: 300_000 });
    return r.data;
  } catch (e) {
    const data = (e as { response?: { status?: number; data?: ImportResult & { message?: string } } }).response;
    if (data?.status === 422 && data.data?.report) return data.data;
    throw e;
  }
}

export const ownerExamsApi = {
  configs: () => api.get<{ items: ConfigRow[] }>('/platform/exams/configs').then((r) => r.data.items),
  tests: (examCode?: string) => api.get<{ items: BankTestRow[] }>('/platform/exams/tests', { params: examCode ? { examCode } : {} }).then((r) => r.data.items),
  test: (id: string) => api.get<BankTest>(`/platform/exams/tests/${id}`).then((r) => r.data),
  patch: (id: string, questions: QuestionPatch[]) => api.patch<{ ok: boolean; updated: number }>(`/platform/exams/tests/${id}`, { questions }).then((r) => r.data),
  publish: (id: string) => api.post<{ ok: boolean; report?: ReportLine[] }>(`/platform/exams/tests/${id}/publish`).then((r) => r.data),
  unpublish: (id: string) => api.post(`/platform/exams/tests/${id}/unpublish`).then((r) => r.data),
  remove: (id: string) => api.delete(`/platform/exams/tests/${id}`).then((r) => r.data),
  importTest: importCall,
  template: (examCode: string) => api.get<{ examCode: string; template: unknown; notes?: unknown }>(`/platform/exams/templates/${examCode}`).then((r) => r.data),
  tables: (examCode?: string) => api.get<{ items: TableRow[] }>('/platform/exams/conversion-tables', { params: examCode ? { examCode } : {} }).then((r) => r.data.items),
  table: (code: string) => api.get<TableDetail>(`/platform/exams/conversion-tables/${code}`).then((r) => r.data),
  putTable: (code: string, body: { rows: TableDetail['rows']; isEstimated: boolean }) => api.put(`/platform/exams/conversion-tables/${code}`, body).then((r) => r.data),
  preview: (id: string) => api.post<{ attemptId: string; token: string; expiresAt: string }>(`/platform/exams/tests/${id}/preview`, {}).then((r) => r.data),
  mediaBlob: (assetId: string) => api.get<Blob>(`/platform/exams/media/${assetId}/file`, { responseType: 'blob', timeout: 60_000 }).then((r) => r.data),
};

/** answerKey is JSON on the server: array, single value, object (SPR range) or null. */
export function keyList(v: unknown): unknown[] {
  if (v && typeof v === 'object' && !Array.isArray(v) && Array.isArray((v as { answers?: unknown }).answers)) return (v as { answers: unknown[] }).answers;
  return Array.isArray(v) ? v : v == null ? [] : [v];
}

/** PATCH rewrites the key as `{answers}` — keys with extra parts (orders, ranges) are import-only. */
export function keyLocked(v: unknown): boolean {
  if (v && typeof v === 'object' && !Array.isArray(v)) {
    const o = v as Record<string, unknown>;
    if (Object.keys(o).some((k) => k !== 'answers')) return true;
  }
  return keyList(v).some((x) => typeof x !== 'string');
}

/** "80 + 2 + 3"-style label is design-only; v1 shows the objective count. */
export function statusLabel(s: TestStatus): string {
  return s === 'PUBLISHED' ? 'Nashr' : s === 'ARCHIVED' ? 'Arxiv' : 'Qoralama';
}
