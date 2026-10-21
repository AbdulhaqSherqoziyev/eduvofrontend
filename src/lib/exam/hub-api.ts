/**
 * Student hub API (contract §1.1–1.3, 1.10, 1.11, 1.13). Same transport rules
 * as the player (`api.ts`): portal/PIN Bearer, 10 s timeout, a dead connection
 * is not an expired session. Throws `HubError` so TanStack Query sees failures.
 * Every response carries `serverNow`; the offset feeds `hubNow()`.
 */
import type {
  CodeLoginResp, CreateAttemptBody, CreateAttemptResp, DetailResp, HubResp, ProgressResp,
} from './hub-types';
import { examStudentToken } from './session';
import type { AttemptState, ResultResp } from './types';

// Not imported from api.ts: that module pulls the in-browser mock into the bundle.
const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
const TIMEOUT_MS = 10_000;

export type HubFailKind = 'network' | 'auth' | 'client' | 'server';

export class HubError extends Error {
  constructor(
    public kind: HubFailKind,
    public status?: number,
    public code?: string,
    public body?: Record<string, unknown>,
  ) {
    super(code ?? kind);
  }
}

let offsetMs = 0;
/** Server time estimate (windows and countdowns follow the server, not the phone clock). */
export const hubNow = () => Date.now() + offsetMs;

async function call<T>(path: string, method = 'GET', body?: unknown, auth = true): Promise<T> {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) throw new HubError('network');
  const token = auth ? examStudentToken() : null;
  if (auth && !token) throw new HubError('auth', 401, 'NO_TOKEN');
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  const t0 = Date.now();
  let r: Response;
  try {
    r = await fetch(`${API}${path}`, {
      method,
      signal: ctrl.signal,
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });
  } catch {
    throw new HubError('network');
  } finally {
    clearTimeout(timer);
  }
  let data: Record<string, unknown> | null = null;
  try {
    const text = await r.text();
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }
  const sn = typeof data?.serverNow === 'string' ? Date.parse(data.serverNow) : NaN;
  if (!Number.isNaN(sn)) offsetMs = sn - (t0 + Date.now()) / 2;
  if (r.ok) return data as T;
  const code = typeof data?.error === 'string' ? data.error : undefined;
  if (r.status === 401) throw new HubError('auth', 401, code, data ?? undefined);
  throw new HubError(r.status >= 500 ? 'server' : 'client', r.status, code, data ?? undefined);
}

const enc = encodeURIComponent;

export const hubApi = {
  hub: () => call<HubResp>('/portal/exams'),
  detail: (code: string) => call<DetailResp>(`/portal/exams/${enc(code)}`),
  progress: () => call<ProgressResp>('/portal/exams/progress'),
  attempt: (id: string) => call<AttemptState>(`/portal/exams/attempts/${enc(id)}`),
  result: (id: string) => call<ResultResp>(`/portal/exams/attempts/${enc(id)}/result`),
  /** Speaking contract §6: delete the learner's own recordings (all, or one item). */
  deleteRecordings: (id: string, itemKey?: string) =>
    call<{ deleted: number; serverNow: string }>(`/portal/exams/attempts/${enc(id)}/recordings${itemKey ? `?itemKey=${enc(itemKey)}` : ''}`, 'DELETE'),
  createAttempt: (b: CreateAttemptBody) => call<CreateAttemptResp>('/portal/exams/attempts', 'POST', b),
  /** Header name for portal sessions (PIN sessions carry the name in the login answer). */
  me: () => call<{ student: { fullName: string } }>('/portal/overview'),
  codeLogin: (code: string, fullName: string) =>
    call<CodeLoginResp>('/portal/exams/code-login', 'POST', { code, fullName }, false),
};

/** 403 kinds the hub treats as states, not failures. */
export const errCode = (e: unknown) => (e instanceof HubError ? e.code : undefined);
export const isModuleOff = (e: unknown) => errCode(e) === 'MODULE_DISABLED';
export const needsLogin = (e: unknown) =>
  e instanceof HubError && (e.kind === 'auth' || e.code === 'CABINET_DISABLED' || e.code === 'STUDENT_ONLY');
