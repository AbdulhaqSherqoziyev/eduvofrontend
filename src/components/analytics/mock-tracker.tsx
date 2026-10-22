'use client';
/**
 * mock.eduvo.uz tracker (API contract §4.1/§4.2): same-origin `POST /api/mock/a/c` via sendBeacon
 * (text/plain, no CORS preflight). Renders nothing, changes nothing in the site's i18n.
 * NOT active in the exam player (`/<lang>/exam/:id`) — no listeners, no hits there.
 * `a: 0|1` (admin analytics contract §10.1) = a learner session exists in this browser — a boolean only:
 * no learner id, email, token or session id is ever sent.
 */
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { isLocale } from '@/i18n/locales';
import { Engagement, clip, handleOptOutParam, inAppBrowser, isOptedOut, newPid } from '@/lib/analytics/tracker-core';
import { getSession, hasSessionHint } from '@/lib/mock/api/client';

const ENDPOINT = `${process.env.NEXT_PUBLIC_MOCK_API_BASE || '/api'}/mock/a/c`;

type Hit = Record<string, unknown>;

/** 1 = signed in (or, before the session is resolved, the non-secret "probably signed in" hint) */
function authFlag(): 0 | 1 {
  const s = getSession();
  if (s.status === 'learner') return 1;
  if (s.status === 'guest') return 0;
  return hasSessionHint() ? 1 : 0;
}

function post(hit: Hit) {
  if (isOptedOut()) return;
  const body = JSON.stringify({ v: 1, s: 'mock', ...hit, a: authFlag() });
  try {
    if (navigator.sendBeacon && navigator.sendBeacon(ENDPOINT, body)) return;
  } catch { /* fall through */ }
  try { void fetch(ENDPOINT, { method: 'POST', body, keepalive: true, credentials: 'omit', headers: { 'Content-Type': 'text/plain;charset=UTF-8' } }).catch(() => {}); } catch { /* ignore */ }
}

/** Visible path without `/m/` and the locale (`/uz/exam/x` → `/exam/x`). */
function restOf(pathname: string) {
  const parts = pathname.split('/').filter(Boolean);
  if (parts[0] === 'm') parts.shift();
  if (isLocale(parts[0])) parts.shift();
  return `/${parts.join('/')}`;
}
const isPlayer = (pathname: string) => restOf(pathname).startsWith('/exam/');

let current: { pid: string; u: string } | null = null;
let firstPv = true;

let quoteSent = false;

/**
 * Custom event (contract §4.4: `lang_switch`; admin analytics contract §10.2: `checkout_quote_view`,
 * once per visit, no props — no sku or price).
 */
export function trackMockEvent(n: 'lang_switch' | 'checkout_quote_view', p?: Record<string, string>) {
  if (typeof window === 'undefined' || !current || isPlayer(window.location.pathname)) return;
  if (n === 'checkout_quote_view') {
    if (quoteSent) return;
    quoteSent = true;
    p = undefined;
  }
  post({ t: 'ev', u: clip(window.location.pathname, 300), pid: current.pid, n, p });
}

function utmOf(search: string) {
  const q = new URLSearchParams(search);
  const u = { s: clip(q.get('utm_source'), 100), m: clip(q.get('utm_medium'), 100), c: clip(q.get('utm_campaign'), 100), t: clip(q.get('utm_term'), 100), ct: clip(q.get('utm_content'), 100) };
  return Object.values(u).some(Boolean) ? u : undefined;
}

export function MockTracker() {
  const pathname = usePathname();

  useEffect(() => { handleOptOutParam(); }, []);

  useEffect(() => {
    const loc = window.location.pathname;
    if (isPlayer(loc)) { current = null; return; }
    const pid = newPid();
    const u = clip(loc, 300)!;
    current = { pid, u };
    post({
      t: 'pv', u, pid,
      r: firstPv ? clip(document.referrer, 500) : undefined,
      utm: utmOf(window.location.search),
      lang: clip(navigator.language, 20),
      mtp: navigator.maxTouchPoints,
      ia: inAppBrowser(),
      wd: navigator.webdriver ? true : undefined,
    });
    firstPv = false;
    const eng = new Engagement((ms, fin) => post({ t: 'en', u, pid, ms, fin: fin || undefined }));
    return () => { eng.stop(); if (current?.pid === pid) current = null; };
  }, [pathname]);

  return null;
}
