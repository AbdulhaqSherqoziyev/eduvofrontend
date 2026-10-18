/**
 * fetch client for `/api/platform/mock/*` (same origin; dev: next.config rewrite via MOCK_API_PROXY).
 * Errors become AdminApiError with the backend `error` code (contract §0.4). A 401 on a token route
 * clears the session and sends the admin to /login?next=… (auth routes handle 401 themselves).
 */
import { clearAdminToken, getAdminToken, loginUrl } from './session';

export const ADMIN_API_BASE = process.env.NEXT_PUBLIC_ADMIN_MOCK_API_BASE ?? '/api/platform/mock';

export class AdminApiError extends Error {
  constructor(public status: number, public code: string, public data: Record<string, unknown> = {}) {
    super(code);
  }
}

export type Query = Record<string, string | number | boolean | null | undefined | string[]>;

export function qs(q?: Query) {
  if (!q) return '';
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(q)) {
    if (v === undefined || v === null || v === '') continue;
    p.set(k, Array.isArray(v) ? v.join(',') : String(v));
  }
  const s = p.toString();
  return s ? `?${s}` : '';
}

export function newIdemKey() {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
      });
}

interface Opts {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  query?: Query;
  body?: unknown;
  idem?: string;
  /** auth endpoints: a 401 is a normal answer, not "session gone" */
  auth?: boolean;
  signal?: AbortSignal;
}

let redirecting = false;

async function raw(path: string, o: Opts): Promise<Response> {
  const headers: Record<string, string> = { Accept: 'application/json' };
  const token = o.auth ? null : getAdminToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (o.idem) headers['Idempotency-Key'] = o.idem;
  let body: BodyInit | undefined;
  if (o.body instanceof FormData) body = o.body;
  else if (o.body !== undefined) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(o.body);
  }
  let res: Response;
  try {
    res = await fetch(`${ADMIN_API_BASE}${path}${qs(o.query)}`, { method: o.method ?? 'GET', headers, body, signal: o.signal, cache: 'no-store' });
  } catch (e) {
    if ((e as Error)?.name === 'AbortError') throw e;
    throw new AdminApiError(0, 'NETWORK');
  }
  if (res.ok) return res;
  let data: Record<string, unknown> = {};
  try { data = await res.json(); } catch { /* not json (nginx 502 page etc.) */ }
  const code = typeof data.error === 'string' ? data.error : res.status >= 500 ? 'INTERNAL' : `HTTP_${res.status}`;
  if (res.status === 401 && !o.auth && typeof window !== 'undefined') {
    clearAdminToken();
    if (!redirecting && !window.location.pathname.startsWith('/login')) {
      redirecting = true;
      window.location.replace(loginUrl());
    }
  }
  throw new AdminApiError(res.status, code, data);
}

export async function req<T>(path: string, o: Opts = {}): Promise<T> {
  const res = await raw(path, o);
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

/** Bearer-protected file (receipt image, CSV): returns a Blob (+ server file name). */
export async function reqBlob(path: string, o: Opts = {}): Promise<{ blob: Blob; filename: string | null }> {
  const res = await raw(path, o);
  const cd = res.headers.get('Content-Disposition') ?? '';
  const m = /filename\*?=(?:UTF-8'')?"?([^";]+)"?/i.exec(cd);
  return { blob: await res.blob(), filename: m ? decodeURIComponent(m[1]) : null };
}

/** Saves a Blob as a file (CSV export). */
export function saveBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
