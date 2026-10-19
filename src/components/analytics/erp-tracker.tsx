'use client';
/**
 * ERP tracker (API contract §4.1/§4.3): `POST {API}/a/e` with the staff token (fetch keepalive —
 * sendBeacon cannot send headers). Mounted ONLY in the staff-panel layout and on /login; the portal,
 * Telegram mini app, owner panel, exam/student zones never load it. A client-side allowlist (contract
 * §6.5 module catalogue) mirrors the backend's: a path outside it sends nothing.
 *
 * Errors (spec §7 erpErrors, Q9): window errors, unhandled rejections and API 5xx / network failures,
 * minus "Script error.", "ResizeObserver loop…" and browser-extension sources. ≤ 20 per page load,
 * one per (kind, status) per 10 s.
 */
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import type { AxiosError } from 'axios';
import { api } from '@/lib/api/client';
import { getSessionUser, getToken } from '@/lib/auth/session';
import { Engagement, clip, handleOptOutParam, isOptedOut, newPid } from '@/lib/analytics/tracker-core';

const ENDPOINT = `${process.env.NEXT_PUBLIC_API_URL ?? ''}/a/e`;

/** Contract §6.5 module keys (= NAV_ITEMS href without the leading "/"). Longest prefix wins. */
const MODULES = [
  'dashboard', 'groups', 'attendance', 'payments', 'assignments', 'schedule', 'my-salary', 'help', 'transactions',
  'leads', 'students', 'teachers', 'profile', 'login', 'directions', 'manage-groups', 'rooms', 'branches', 'payroll',
  'reports', 'staff', 'roles', 'modules', 'exams/catalog', 'exams/assignments', 'exams/results', 'exams/ai',
  'exams/tests', 'exams/credits', 'exams/billing',
];

export function erpModuleOf(pathname: string): string | null {
  const p = pathname.replace(/\/+$/, '').replace(/^\/+/, '');
  let best: string | null = null;
  for (const m of MODULES) if ((p === m || p.startsWith(`${m}/`)) && (!best || m.length > best.length)) best = m;
  return best;
}

let current: { pid: string; u: string; errs: number; last: Map<string, number> } | null = null;

/** Owner / impersonation never counts (spec §2.8); the backend drops those too. */
function skipUser(): boolean {
  const u = getSessionUser();
  return !!u && (!!u.isPlatform || !!u.impersonated);
}

function post(hit: Record<string, unknown>) {
  if (isOptedOut() || skipUser() || !process.env.NEXT_PUBLIC_API_URL) return;
  const token = getToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  try {
    void fetch(ENDPOINT, { method: 'POST', keepalive: true, credentials: 'omit', headers, body: JSON.stringify({ v: 1, ...hit }) }).catch(() => {});
  } catch { /* never break the app */ }
}

const startsExt = (s?: string) => !!s && /^(chrome|moz)-extension:\/\//.test(s);

function reportError(err: { kind: 'js' | 'promise' | 'api' | 'network'; status?: number; msg?: string; src?: string }) {
  const c = current;
  if (!c) return;
  if (err.msg === 'Script error.' || (err.msg ?? '').startsWith('ResizeObserver loop') || startsExt(err.src)) return;
  if (err.kind === 'api' && !(err.status && err.status >= 500 && err.status <= 599)) return;
  if (c.errs >= 20) return;
  const key = `${err.kind}:${err.status ?? ''}`;
  const now = Date.now();
  if (now - (c.last.get(key) ?? 0) < 10_000) return;
  c.last.set(key, now);
  c.errs += 1;
  post({ t: 'err', u: c.u, pid: c.pid, err: { kind: err.kind, status: err.status, msg: clip(err.msg, 200), src: clip(err.src, 200) }, mtp: navigator.maxTouchPoints });
}

const firstFrame = (stack?: string) => (stack ?? '').split('\n').map((l) => l.trim()).find((l) => /(https?|chrome-extension|moz-extension):\/\//.test(l));

export function ErpTracker() {
  const pathname = usePathname();

  // once per mount: opt-out param, global error listeners, axios 5xx/network hook
  useEffect(() => {
    handleOptOutParam();
    const onError = (e: ErrorEvent) => reportError({ kind: 'js', msg: e.message, src: e.filename || firstFrame((e.error as Error | undefined)?.stack) });
    const onRejection = (e: PromiseRejectionEvent) => {
      const r = e.reason as { message?: string; stack?: string; isAxiosError?: boolean } | undefined;
      if (r?.isAxiosError) return; // API failures are reported by the interceptor below (4xx are not errors)
      reportError({ kind: 'promise', msg: r?.message ?? (typeof e.reason === 'string' ? e.reason : undefined), src: firstFrame(r?.stack) });
    };
    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onRejection);
    const id = api.interceptors.response.use(undefined, (error: AxiosError) => {
      const status = error.response?.status;
      if (status === undefined) { if (error.code !== 'ERR_CANCELED') reportError({ kind: 'network', status: 0 }); }
      else if (status >= 500) reportError({ kind: 'api', status });
      return Promise.reject(error);
    });
    return () => {
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onRejection);
      api.interceptors.response.eject(id);
    };
  }, []);

  // one pageview per pathname (client navigation included); query strings are not pages
  useEffect(() => {
    const u = window.location.pathname;
    if (!erpModuleOf(u)) { current = null; return; }
    const pid = newPid();
    current = { pid, u: clip(u, 300)!, errs: 0, last: new Map() };
    post({ t: 'pv', u: current.u, pid, mtp: navigator.maxTouchPoints });
    const eng = new Engagement((ms, fin) => post({ t: 'en', u: clip(u, 300), pid, ms, fin: fin || undefined }));
    return () => { eng.stop(); if (current?.pid === pid) current = null; };
  }, [pathname]);

  return null;
}
