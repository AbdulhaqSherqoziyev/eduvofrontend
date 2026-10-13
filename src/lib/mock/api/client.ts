/**
 * Same-origin client for the mock site API (`/api/mock/*`, contract §0).
 * - Access token lives in memory only (never localStorage); the refresh token is the httpOnly
 *   `mock_rt` cookie, so refresh/logout send `credentials: 'include'` + `X-Requested-With`.
 * - A 401 on a learner call triggers ONE refresh and one retry (§0.3 UNAUTHENTICATED).
 * - Errors surface as MockApiError with the contract `error` code; `message` is never shown to users.
 */
import type { AuthSession, Learner } from './types';

/** Browser base. On mock.eduvo.uz nginx proxies `/api/` to the backend; in dev see MOCK_API_PROXY. */
const BROWSER_BASE = process.env.NEXT_PUBLIC_MOCK_API_BASE || '/api';

export class MockApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly fields: Array<{ field: string; code: string }>;
  readonly body: Record<string, unknown>;
  constructor(status: number, code: string, body: Record<string, unknown> = {}) {
    super(code);
    this.status = status;
    this.code = code;
    this.body = body;
    this.fields = Array.isArray(body.fields) ? (body.fields as Array<{ field: string; code: string }>) : [];
  }
  get retryAfterSec(): number | null {
    const v = this.body.retryAfterSec;
    return typeof v === 'number' ? v : null;
  }
}

/** network down / CORS / aborted — the UI shows the generic connection message */
export const isNetworkError = (e: unknown) => e instanceof MockApiError && e.code === 'NETWORK';

/* ---------------- session store (module singleton, browser only) ---------------- */

export type SessionState =
  | { status: 'unknown' }
  | { status: 'guest' }
  | { status: 'learner'; learner: Learner };

let accessToken: string | null = null;
let state: SessionState = { status: 'unknown' };
const listeners = new Set<() => void>();

function emit() { listeners.forEach((l) => l()); }
export function subscribeSession(l: () => void) { listeners.add(l); return () => { listeners.delete(l); }; }
export function getSession(): SessionState { return state; }
const SERVER_STATE: SessionState = { status: 'unknown' };
export function getServerSession(): SessionState { return SERVER_STATE; }

/**
 * Non-secret hint that a refresh cookie probably exists, so guests do not send a refresh request
 * (and get a 401) on every page view. The httpOnly cookie itself stays the source of truth.
 */
const HINT_KEY = 'eduvo_mock_li';
export function hasSessionHint() { try { return localStorage.getItem(HINT_KEY) === '1'; } catch { return true; } }
function setHint(on: boolean) { try { if (on) localStorage.setItem(HINT_KEY, '1'); else localStorage.removeItem(HINT_KEY); } catch { /* ignore */ } }

export function setAuthSession(s: AuthSession) {
  setHint(true);
  accessToken = s.accessToken;
  state = { status: 'learner', learner: s.learner };
  emit();
}
export function setLearner(learner: Learner) {
  state = { status: 'learner', learner };
  emit();
}
export function clearSession() {
  setHint(false);
  accessToken = null;
  state = { status: 'guest' };
  emit();
}
/** Current access token (the exam player host reads it). */
export const currentAccessToken = () => accessToken;

/* ---------------- fetch ---------------- */

interface ReqOpts {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
  /** send the Bearer token and refresh once on 401 (default true) */
  auth?: boolean;
  signal?: AbortSignal;
  /** cookie endpoints (refresh, logout) */
  cookie?: boolean;
}

async function raw<T>(path: string, o: ReqOpts): Promise<T> {
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (o.body !== undefined) headers['Content-Type'] = 'application/json';
  if (o.cookie) headers['X-Requested-With'] = 'eduvo-mock';
  if (o.auth !== false && accessToken) headers.Authorization = `Bearer ${accessToken}`;
  let res: Response;
  try {
    res = await fetch(`${BROWSER_BASE}${path}`, {
      method: o.method ?? 'GET',
      headers,
      body: o.body === undefined ? undefined : JSON.stringify(o.body),
      credentials: o.cookie ? 'include' : 'same-origin',
      signal: o.signal,
      cache: 'no-store',
    });
  } catch (e) {
    if ((e as Error)?.name === 'AbortError') throw e;
    throw new MockApiError(0, 'NETWORK');
  }
  if (res.status === 204) return undefined as T;
  // anything that is not the API's JSON (an HTML page from a misrouted /api path, a proxy error page)
  // is a failure, never data
  const isJson = (res.headers.get('content-type') ?? '').includes('application/json');
  if (!isJson) throw new MockApiError(res.ok ? 502 : res.status, res.status >= 500 || res.ok ? 'BAD_GATEWAY' : `HTTP_${res.status}`);
  let json: Record<string, unknown> = {};
  try { json = await res.json(); } catch { throw new MockApiError(502, 'BAD_GATEWAY'); }
  if (!res.ok) {
    const code = typeof json.error === 'string' && /^[A-Z_]+$/.test(json.error) ? json.error : res.status >= 500 ? 'INTERNAL' : `HTTP_${res.status}`;
    throw new MockApiError(res.status, code, json);
  }
  return json as T;
}

let refreshing: Promise<boolean> | null = null;

/** POST /mock/auth/refresh (A4). Resolves true when a session was restored. Concurrent callers share one request. */
export function refreshSession(): Promise<boolean> {
  if (!refreshing) {
    refreshing = raw<AuthSession>('/mock/auth/refresh', { method: 'POST', cookie: true, auth: false })
      .then((s) => { setAuthSession(s); return true; })
      .catch((e: unknown) => {
        if (e instanceof MockApiError && e.status === 401) { clearSession(); return false; }
        // network / 5xx: keep whatever we had; a guest stays guest
        if (state.status === 'unknown') { state = { status: 'guest' }; emit(); }
        return false;
      })
      .finally(() => { refreshing = null; });
  }
  return refreshing;
}

const AUTH_RETRY_CODES = new Set(['UNAUTHENTICATED', 'INVALID_TOKEN', 'HTTP_401']);

export async function api<T>(path: string, o: ReqOpts = {}): Promise<T> {
  try {
    return await raw<T>(path, o);
  } catch (e) {
    if (o.auth !== false && e instanceof MockApiError && e.status === 401 && AUTH_RETRY_CODES.has(e.code)) {
      const ok = await refreshSession();
      if (ok) return raw<T>(path, o);
    }
    throw e;
  }
}

/** Mark the visitor as a guest without asking the server (no session hint). */
export function markGuest() {
  if (state.status === 'unknown') { state = { status: 'guest' }; emit(); }
}

/** Wait until the first refresh decided guest vs learner (pages that need a learner call this — always asks the server). */
export async function ensureSession(): Promise<SessionState> {
  if (state.status === 'unknown') await refreshSession();
  return state;
}
