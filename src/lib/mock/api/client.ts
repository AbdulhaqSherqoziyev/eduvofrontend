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

/**
 * `offline` = the refresh could not reach the server (network, 5xx, 429 after retries). The learner
 * is NOT logged out — pages keep their skeleton and the session banner offers a retry.
 */
export type SessionState =
  | { status: 'unknown' }
  | { status: 'offline' }
  | { status: 'guest' }
  | { status: 'learner'; learner: Learner };

let accessToken: string | null = null;
/** epoch ms; a token is reused (tabs, page loads) only while it has more than FRESH_MS left */
let accessExpiresAt = 0;
const FRESH_MS = 60_000;
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

/** Email of the last learner on this page — survives clearSession for the in-player "Log in again" modal. */
let lastEmail: string | null = null;
export const lastLearnerEmail = () => lastEmail;

const tokenFresh = () => !!accessToken && accessExpiresAt - Date.now() > FRESH_MS;

/*
 * Tabs share one session over a BroadcastChannel (the token never touches storage):
 *  - a new page asks open tabs for their token before it spends a refresh (`ask` → `session`);
 *  - a refresh or login in one tab hands the new token to the others;
 *  - an explicit logout logs every tab out.
 */
type Msg =
  | { type: 'ask' }
  | { type: 'session'; session: AuthSession }
  | { type: 'learner'; learner: Learner }
  | { type: 'logout' };
let channel: BroadcastChannel | null | undefined;
function bus(): BroadcastChannel | null {
  if (channel !== undefined) return channel;
  channel = typeof window !== 'undefined' && 'BroadcastChannel' in window ? new BroadcastChannel('eduvo-mock-session') : null;
  channel?.addEventListener('message', (ev: MessageEvent<Msg>) => {
    const m = ev.data;
    if (!m || typeof m !== 'object') return;
    if (m.type === 'ask') {
      if (tokenFresh() && state.status === 'learner') {
        channel?.postMessage({ type: 'session', session: { accessToken: accessToken!, accessExpiresAt: new Date(accessExpiresAt).toISOString(), learner: state.learner } } satisfies Msg);
      }
    } else if (m.type === 'session') {
      const exp = Date.parse(m.session.accessExpiresAt);
      if (m.session.accessToken !== accessToken && exp > accessExpiresAt) applySession(m.session);
    } else if (m.type === 'learner') {
      if (state.status === 'learner' && state.learner.id === m.learner.id) { state = { status: 'learner', learner: m.learner }; emit(); }
    } else if (m.type === 'logout') {
      dropSession();
    }
  });
  return channel;
}
const post = (m: Msg) => { try { bus()?.postMessage(m); } catch { /* closed channel */ } };

function applySession(s: AuthSession) {
  setHint(true);
  lastEmail = s.learner.email;
  accessToken = s.accessToken;
  const exp = Date.parse(s.accessExpiresAt);
  accessExpiresAt = Number.isFinite(exp) ? exp : Date.now() + 14 * 60_000;
  state = { status: 'learner', learner: s.learner };
  emit();
}
function dropSession() {
  setHint(false);
  accessToken = null;
  accessExpiresAt = 0;
  state = { status: 'guest' };
  emit();
}

export function setAuthSession(s: AuthSession) {
  applySession(s);
  post({ type: 'session', session: s });
}
export function setLearner(learner: Learner) {
  lastEmail = learner.email;
  state = { status: 'learner', learner };
  emit();
  post({ type: 'learner', learner });
}
/** Local logout (this tab). `everywhere` also logs the other open tabs out (explicit Log out). */
export function clearSession(everywhere = false) {
  dropSession();
  if (everywhere) post({ type: 'logout' });
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
    const ra = Number(res.headers.get('retry-after'));
    if (res.status === 429 && typeof json.retryAfterSec !== 'number' && Number.isFinite(ra) && ra > 0) json.retryAfterSec = ra;
    throw new MockApiError(res.status, code, json);
  }
  return json as T;
}

let refreshing: Promise<boolean> | null = null;

/**
 * The refresh cookie rotates on every use and a replayed one revokes the whole session family
 * (contract §0.2). Two tabs loading at once would both send the same cookie, so the request runs
 * under a cross-tab lock (Web Locks API); the tab that waited usually got the token over the
 * channel meanwhile and does not refresh at all.
 */
function withRefreshLock<T>(fn: () => Promise<T>): Promise<T> {
  const locks = typeof navigator !== 'undefined' && 'locks' in navigator ? navigator.locks : undefined;
  return locks ? (locks.request('eduvo-mock-refresh', fn) as Promise<T>) : fn();
}

const sleep = (ms: number) => new Promise<void>((r) => { window.setTimeout(r, ms); });

/** Ask the other open tabs for their token; resolves true when one was adopted. */
function askPeers(waitMs = 120): Promise<boolean> {
  const ch = bus();
  if (!ch) return Promise.resolve(false);
  return new Promise((resolve) => {
    const done = (v: boolean) => { ch.removeEventListener('message', on); window.clearTimeout(timer); resolve(v); };
    // the channel's own listener adopts the session first; this one only notices it
    const on = (ev: MessageEvent<Msg>) => { if (ev.data?.type === 'session') window.setTimeout(() => done(tokenFresh()), 0); };
    const timer = window.setTimeout(() => done(tokenFresh()), waitMs);
    ch.addEventListener('message', on);
    post({ type: 'ask' });
  });
}

/** retry schedule for 5xx / network (ms); a 429 waits Retry-After instead */
const BACKOFF = [1000, 2000, 4000, 8000];
const MAX_RETRY_AFTER_S = 60;

/**
 * POST /mock/auth/refresh (A4) with retries. Only a 401 means "no session" (→ guest); 429, 5xx and
 * network errors are retried (Retry-After / backoff) and never log the learner out.
 */
async function refreshWithRetry(rejected: string | null): Promise<boolean> {
  for (let i = 0; ; i++) {
    try {
      const s = await raw<AuthSession>('/mock/auth/refresh', { method: 'POST', cookie: true, auth: false });
      setAuthSession(s);
      return true;
    } catch (e) {
      if (e instanceof MockApiError && e.status === 401) { dropSession(); return false; }
      const retryAfter = e instanceof MockApiError && e.status === 429 ? Math.min(e.retryAfterSec ?? 5, MAX_RETRY_AFTER_S) * 1000 : null;
      if (i >= BACKOFF.length) {
        if (state.status === 'unknown') { state = { status: 'offline' }; emit(); }
        return false;
      }
      await sleep(retryAfter ?? BACKOFF[i]);
      // another tab may have refreshed while this one waited
      if (tokenFresh() && accessToken !== rejected) return true;
    }
  }
}

/**
 * Restore / renew the session. Resolves true when a usable access token is in memory.
 * `force` = the server rejected the current token (401), so a fresh-looking one is not trusted.
 * Concurrent callers share one run.
 */
export function refreshSession(force = false): Promise<boolean> {
  if (!refreshing) {
    if (!force && tokenFresh()) return Promise.resolve(true);
    const rejected = force ? accessToken : null;
    refreshing = (async () => {
      if (!force && (await askPeers())) return true;
      return withRefreshLock(async () => {
        // a tab that held the lock may have handed its new token over meanwhile
        if (tokenFresh() && accessToken !== rejected) return true;
        return refreshWithRetry(rejected);
      });
    })().finally(() => { refreshing = null; });
  }
  return refreshing;
}

/** Retry after `offline` (session banner "Try again"). */
export function retrySession() {
  if (state.status === 'offline') { state = { status: 'unknown' }; emit(); }
  return refreshSession();
}

const AUTH_RETRY_CODES = new Set(['UNAUTHENTICATED', 'INVALID_TOKEN', 'HTTP_401']);

export async function api<T>(path: string, o: ReqOpts = {}): Promise<T> {
  try {
    return await raw<T>(path, o);
  } catch (e) {
    if (o.auth !== false && e instanceof MockApiError && e.status === 401 && AUTH_RETRY_CODES.has(e.code)) {
      const ok = await refreshSession(true);
      if (ok) return raw<T>(path, o);
    }
    throw e;
  }
}

/** Mark the visitor as a guest without asking the server (no session hint). */
export function markGuest() {
  if (state.status === 'unknown') { state = { status: 'guest' }; emit(); }
}

/**
 * Wait until the session is decided. Guests without the session hint are not sent to the server
 * (no refresh 401 noise); `offline` means "could not decide" — callers must not treat it as guest.
 */
export async function ensureSession(): Promise<SessionState> {
  if (state.status === 'unknown') {
    if (hasSessionHint()) await refreshSession(); else markGuest();
  }
  return state;
}
