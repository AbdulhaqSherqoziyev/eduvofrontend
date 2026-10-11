import { api } from './client';
import { cleanParams } from './http';

/** v3 console additions — contract `_api-contract.md` §2b (credits, AI grading, centre test bank). */

export type Family = 'IELTS' | 'CEFR' | 'SAT' | 'TOEFL' | 'HSK';
export type SectionMethod = 'auto' | 'ai' | 'mix';

export interface CatalogKpis {
  attemptsThisMonth: number; attemptsDeltaVsLastMonth: number; activeMocks: number; liveNow: number;
  avgIelts30d: number | null; credits: number; fullMocksApprox: number;
}
export interface FamilySection { key: string; sectionKey: string; title: string; durationMin: number | null; durationLabel: string; content: string; method: SectionMethod }
export interface CatalogFamily {
  family: Family; abbr: string; name: string; ver: string; desc: string;
  sections: FamilySection[]; sectionChips: string[]; durationLabel: string; priceCredits: number;
  avg: string | null; estimate: boolean; examCodes: string[]; hasPublishedTest: boolean;
  /** Backend launch flag (TOEFL/HSK/CEFR = true); missing → `COMING_SOON` fallback. */
  comingSoon?: boolean;
}

export type CreditKind = 'PURCHASE' | 'ATTEMPT' | 'REFUND' | 'ADJUST';
export interface CreditTxn { id: string; delta: number; balanceAfter: number; kind: CreditKind; note: string | null; createdAt: string }
export interface CreditPackage { key: string; name: string; credits: number; priceUzs: number; note: string }
export interface Credits {
  credits: number; fullMocksApprox: number;
  prices: { family: Family; fullCredits: number; sectionCredits: number }[];
  packages: CreditPackage[]; walletBalanceUzs: number; history: CreditTxn[]; total: number;
}
export interface PurchaseResult { credits: number; walletBalanceUzs: number; txn: CreditTxn }

export interface ResultKpis {
  avgOverall: number | null;
  strongest: { section: string; avg: number } | null;
  weakest: { section: string; avg: number; range: string | null } | null;
  c1Plus: { count: number; of: number };
}
/** Per-row v3 fields added to §2.9 rows: section labels ("7.5", "6.0–6.5") only when READY. */
export interface ResultRowV3 {
  listening: string | null; reading: string | null; writing: string | null; speaking: string | null;
  overallLabel: string | null; cefrLevel: string | null; grading: boolean;
}

export interface GradingStats {
  gradedToday: number; writingToday: number; speakingToday: number; avgTurnaroundSec: number | null;
  agreementPct: number | null; calibration: number | null; pending: number;
}
export type JobStatus = 'done' | 'run' | 'third' | 'retry';
/** `final` / `passes` are band labels ("6.0–6.5", "4.5"); null while not graded. */
export interface GradingJob { id: string; studentName: string; task: string; kind: 'w' | 's'; status: JobStatus; final: string | null; step: number; meta: string; createdAt: string }
export interface GradingJobDetail extends GradingJob {
  passes: [string | null, string | null, string | null];
  criteria: { name: string; score: number; max: number; note: string }[];
  text: string | null; transcript: string | null;
}

export interface BankTest {
  id: string; title: string; examCode: string; family: Family | null; questionsLabel: string;
  status: 'PUBLISHED' | 'DRAFT'; owner: 'platform' | 'center';
}
export interface ImportCheck { level: 'ok' | 'err' | 'warn'; text: string }
export interface ImportResult { fileName: string; errors: number; checks: ImportCheck[]; counts?: { stages: number; questions: number }; testId?: string }
export interface ConversionTable { title: string; code: string; isEstimated: boolean; routes: string[]; rows: { raw: string; band: string }[] }
export interface AcceptedVariants { q: string; list: string[] }

/** Saves a Blob response under the server's file name (Content-Disposition) or `fallback`. */
function saveBlob(data: Blob, disposition: string | undefined, fallback: string) {
  const m = /filename\*?=(?:UTF-8'')?"?([^";]+)"?/i.exec(disposition ?? '');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(data);
  a.download = m ? decodeURIComponent(m[1]) : fallback;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1_000);
}

const download = (url: string, params: Record<string, unknown>, fallback: string) =>
  api.get<Blob>(url, { params: cleanParams(params), responseType: 'blob', timeout: 60_000 })
    .then((r) => saveBlob(r.data, r.headers['content-disposition'] as string | undefined, fallback));

export const examsV3Api = {
  credits: (page = 1, limit = 20) => api.get<Credits>('/exams/credits', { params: { page, limit } }).then((r) => r.data),
  purchase: (packageKey: string) => api.post<PurchaseResult>('/exams/credits/purchase', { packageKey }).then((r) => r.data),

  resultsXlsx: (q: { assignmentId?: string; examCode?: string }) =>
    // Content-Disposition is not CORS-exposed, so the fallback mirrors the server's name.
    download('/exams/results', { ...q, format: 'xlsx' }, `mock-natijalar-${new Date().toISOString().slice(0, 10)}.xlsx`),

  gradingStats: () => api.get<GradingStats>('/exams/grading/stats').then((r) => r.data),
  gradingJobs: (status?: JobStatus) =>
    api.get<GradingJob[]>('/exams/grading/jobs', { params: cleanParams({ status }) }).then((r) => r.data),
  gradingJob: (id: string) => api.get<GradingJobDetail>(`/exams/grading/jobs/${id}`).then((r) => r.data),

  bankTests: () => api.get<BankTest[]>('/exams/bank/tests').then((r) => r.data),
  /** multipart: the test .json + its audio/images -> 200 (dry run / errors) or 201 (DRAFT created). Excel -> one err check. */
  bankImport: (files: File[], dryRun: boolean) => {
    const fd = new FormData();
    files.forEach((f) => fd.append('files', f, f.name));
    return api.post<ImportResult>('/exams/bank/import', fd, { params: dryRun ? { dryRun: 1 } : {}, timeout: 300_000 })
      .then((r) => r.data);
  },
  bankPublish: (id: string) => api.post<{ ok: true; status: 'PUBLISHED'; checks: ImportCheck[] }>(`/exams/bank/tests/${id}/publish`).then((r) => r.data),
  conversionTable: (examCode: string, section: string) =>
    api.get<ConversionTable>('/exams/bank/conversion-tables', { params: { examCode, section } }).then((r) => r.data),
  accepted: (testId: string) => api.get<AcceptedVariants[]>(`/exams/bank/tests/${testId}/accepted`).then((r) => r.data),
  template: (examCode: string) => download('/exams/bank/template', { examCode }, `${examCode.toLowerCase()}-shablon.json`),
};
