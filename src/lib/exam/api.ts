/**
 * Exam player API — portal `apiFetch` style: never throws, and a dead
 * connection, an expired session and a 500 are different outcomes. Only the
 * player uses this; hub/admin will use TanStack Query.
 * `NEXT_PUBLIC_EXAM_API_MOCK=1` swaps in the in-browser mock (api.mock.ts).
 */
import type {
  AttemptState, IntegrityEvent, ResultResp, SaveResp, ServerAnswer, StageStartResp, SubmitResp,
} from './types';
import type { RecordingUploadResp, RestartReason, RestartResp } from './speaking-types';
import { createMockApi } from './api.mock';

export const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
export const IS_MOCK = process.env.NEXT_PUBLIC_EXAM_API_MOCK === '1';
const TIMEOUT_MS = 10_000;

export type FailKind = 'network' | 'auth' | 'client' | 'server';
export type ExamResult<T> =
  | { ok: true; data: T }
  | { ok: false; kind: FailKind; status?: number; code?: string; message?: string; body?: Record<string, unknown> };

export type SaveBody = { stageKey: string; answers: Omit<ServerAnswer, 'stageKey'>[] };

export interface ExamApi {
  getAttempt(id: string): Promise<ExamResult<AttemptState>>;
  startStage(id: string, stageKey: string): Promise<ExamResult<StageStartResp>>;
  saveAnswers(id: string, body: SaveBody): Promise<ExamResult<SaveResp>>;
  submitStage(id: string, stageKey: string, reason: 'user' | 'timeout'): Promise<ExamResult<SubmitResp>>;
  reportSkip(id: string, stageKey: string, part: number): Promise<ExamResult<{ techSkippedParts: number[] }>>;
  integrity(id: string, events: IntegrityEvent[]): Promise<ExamResult<{ ok: true }>>;
  result(id: string): Promise<ExamResult<ResultResp>>;
  /** req: `GET /portal/exams/time` → `{serverNow}` (clock sync + connection check). */
  time(): Promise<ExamResult<{ serverNow: string }>>;
  /** Last-gasp save on pagehide: fetch keepalive (carries Authorization, unlike sendBeacon). */
  saveOnExit(id: string, body: SaveBody): void;
  /** Media bytes for preload; the mock serves synthesized audio. */
  fetchMedia(url: string, signal?: AbortSignal): Promise<Response>;
  /** Speaking contract §2: one recording per item (multipart). */
  uploadRecording(id: string, b: { file: Blob; stageKey: string; itemKey: string; durationMs: number }): Promise<ExamResult<RecordingUploadResp>>;
  /** Speaking contract §4a: restart an item once after a technical interruption. */
  restartItem(id: string, stageKey: string, itemKey: string, b: { reason: RestartReason; interruptedAt?: string }): Promise<ExamResult<RestartResp>>;
}

// ── clock samples: every response with serverNow feeds the offset estimator ──
type Sample = (t0: number, t1: number, serverNowIso: string) => void;
let onSample: Sample | null = null;
export function setClockSampler(fn: Sample | null) { onSample = fn; }
export function reportSample(t0: number, t1: number, body: unknown) {
  const sn = (body as { serverNow?: string } | null)?.serverNow;
  if (sn && onSample) onSample(t0, t1, sn);
}

/**
 * Transport host settings. ERP/portal never call this, so they keep API + the plain token (no
 * renewal). mock.eduvo.uz sets a same-origin base and a token renewal (15-min learner tokens,
 * contract §7.3.2): one 401 → renew → retry once.
 */
let transport: { base: string; renewAuth: (() => Promise<boolean>) | null } = { base: API, renewAuth: null };
export function configureExamTransport(t: Partial<typeof transport>) { transport = { ...transport, ...t }; }

/** Media URLs from the API are relative to the API base ("/portal/exams/media/…"). */
export function absMedia(url: string): string {
  return /^(https?:|data:|blob:|mock:)/.test(url) ? url : `${transport.base}${url.startsWith('/') ? '' : '/'}${url}`;
}

let token: string | null = null;
export function setExamToken(t: string | null) { token = t; }

async function req<T>(path: string, method = 'GET', body?: unknown): Promise<ExamResult<T>> {
  const first = await send<T>(path, method, body);
  if (!first.ok && first.kind === 'auth' && transport.renewAuth && (await transport.renewAuth().catch(() => false))) {
    return send<T>(path, method, body);
  }
  return first;
}

async function send<T>(path: string, method = 'GET', body?: unknown): Promise<ExamResult<T>> {
  // No navigator.onLine short-circuit: it can read false while the link works (Chrome on Linux /
  // VPN / Wi-Fi hand-over) and would silence autosave, heartbeat and integrity together. A truly
  // offline fetch rejects at once anyway.
  const ctrl = new AbortController();
  // recordings (≤ 5 MB) get a longer budget than JSON calls — slow uplinks must not abort them
  const timer = setTimeout(() => ctrl.abort(), body instanceof FormData ? 60_000 : TIMEOUT_MS);
  const t0 = performance.now();
  try {
    const r = await fetch(`${transport.base}${path}`, {
      method,
      signal: ctrl.signal,
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(body !== undefined && !(body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}),
      },
      ...(body !== undefined ? { body: body instanceof FormData ? body : JSON.stringify(body) } : {}),
    });
    const text = await r.text();
    let data: Record<string, unknown> | null = null;
    try { data = text ? JSON.parse(text) : null; } catch { data = null; }
    reportSample(t0, performance.now(), data);
    if (r.ok) return { ok: true, data: data as T };
    const code = typeof data?.error === 'string' ? data.error : undefined;
    const msg = Array.isArray(data?.message) ? (data?.message as string[]).join(', ') : (data?.message as string | undefined);
    if (r.status === 401 || (r.status === 403 && (!code || code === 'Forbidden'))) return { ok: false, kind: 'auth', status: r.status, code };
    return { ok: false, kind: r.status >= 500 ? 'server' : 'client', status: r.status, code, message: msg, body: data ?? undefined };
  } catch {
    return { ok: false, kind: 'network' };
  } finally {
    clearTimeout(timer);
  }
}

const A = (id: string) => `/portal/exams/attempts/${encodeURIComponent(id)}`;

const realApi: ExamApi = {
  getAttempt: (id) => req(A(id)),
  startStage: (id, k) => req(`${A(id)}/stages/${encodeURIComponent(k)}/start`, 'POST'),
  saveAnswers: (id, body) => req(`${A(id)}/answers`, 'PUT', body),
  submitStage: (id, k, reason) => req(`${A(id)}/stages/${encodeURIComponent(k)}/submit`, 'POST', { reason }),
  reportSkip: (id, k, part) => req(`${A(id)}/stages/${encodeURIComponent(k)}/report-skip`, 'POST', { part, reason: 'audio_load_failed' }),
  integrity: (id, events) => req(`${A(id)}/integrity`, 'POST', { events }),
  result: (id) => req(`${A(id)}/result`),
  time: () => req('/portal/exams/time'),
  saveOnExit(id, body) {
    try {
      void fetch(`${transport.base}${A(id)}/answers`, {
        method: 'PUT',
        keepalive: true,
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify(body),
      }).catch(() => undefined);
    } catch {
      /* the device copy in localStorage is the fallback; it syncs on the next visit */
    }
  },
  fetchMedia: (url, signal) => fetch(absMedia(url), { signal }),
  uploadRecording: (id, b) => {
    const f = new FormData();
    const ext = b.file.type.includes('mp4') ? 'm4a' : b.file.type.includes('ogg') ? 'ogg' : 'webm';
    f.append('file', b.file, `${b.itemKey}.${ext}`);
    f.append('stageKey', b.stageKey);
    f.append('itemKey', b.itemKey);
    f.append('durationMs', String(Math.round(b.durationMs)));
    return req(`${A(id)}/recordings`, 'POST', f);
  },
  restartItem: (id, k, item, b) => req(`${A(id)}/stages/${encodeURIComponent(k)}/items/${encodeURIComponent(item)}/restart`, 'POST', b),
};

export const examApi: ExamApi = IS_MOCK ? createMockApi() : realApi;
