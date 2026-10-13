'use client';
/**
 * Paddle.js v2 overlay checkout (contract §9.2). The script loads on demand (only when a learner
 * pays by card/wallet), is initialised once per client token, and routes Paddle's single global
 * event callback to whichever checkout is open. Card data is entered in Paddle's iframe only.
 * Environment: a client token starting with `test_` is a sandbox token.
 */

const SRC = 'https://cdn.paddle.com/paddle/v2/paddle.js';

export type PaddleEventName = 'checkout.loaded' | 'checkout.completed' | 'checkout.closed' | 'checkout.payment.failed' | 'checkout.error' | string;
export interface PaddleEvent { name?: PaddleEventName; type?: string; data?: unknown; error?: unknown }

interface PaddleGlobal {
  Environment: { set: (env: 'sandbox' | 'production') => void };
  Initialize: (o: { token: string; eventCallback?: (e: PaddleEvent) => void }) => void;
  Checkout: { open: (o: Record<string, unknown>) => void; close: () => void };
}
declare global { interface Window { Paddle?: PaddleGlobal } }

let loading: Promise<PaddleGlobal> | null = null;
let initToken: string | null = null;
let listener: ((e: PaddleEvent) => void) | null = null;

function load(): Promise<PaddleGlobal> {
  if (window.Paddle) return Promise.resolve(window.Paddle);
  if (loading) return loading;
  loading = new Promise<PaddleGlobal>((resolve, reject) => {
    const s = document.createElement('script');
    s.src = SRC;
    s.async = true;
    s.onload = () => (window.Paddle ? resolve(window.Paddle) : reject(new Error('PADDLE_MISSING')));
    s.onerror = () => { loading = null; s.remove(); reject(new Error('PADDLE_LOAD_FAILED')); };
    document.head.appendChild(s);
  });
  return loading;
}

/** Paddle checkout locales we can hand over; anything else falls back to English. */
const PADDLE_LOCALES = new Set(['en', 'ru', 'de', 'fr', 'es', 'it', 'pt', 'nl', 'pl', 'tr', 'ja', 'ko', 'zh-Hans', 'sv', 'da', 'no', 'cs', 'hu', 'sk', 'uk', 'id', 'vi', 'th']);

export interface OpenOpts {
  clientToken: string;
  transactionId: string;
  email?: string | null;
  locale: string;
  onEvent: (e: PaddleEvent) => void;
}

/** Opens the overlay. Rejects when the script cannot load (offline, blocked by an extension). */
export async function openPaddleCheckout(o: OpenOpts): Promise<void> {
  const P = await load();
  // Paddle.js is initialised once per page; one Paddle account (one client token) per environment
  if (initToken === null) {
    P.Environment.set(o.clientToken.startsWith('test_') ? 'sandbox' : 'production');
    P.Initialize({ token: o.clientToken, eventCallback: (e) => listener?.(e) });
    initToken = o.clientToken;
  }
  listener = o.onEvent;
  const theme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  const lang = o.locale === 'zh-hans' ? 'zh-Hans' : o.locale;
  P.Checkout.open({
    transactionId: o.transactionId,
    ...(o.email ? { customer: { email: o.email } } : {}),
    settings: { displayMode: 'overlay', theme, locale: PADDLE_LOCALES.has(lang) ? lang : 'en', allowLogout: false },
  });
}

export function closePaddleCheckout() {
  try { window.Paddle?.Checkout.close(); } catch { /* already closed */ }
}

/** Stop routing events (component unmounted). */
export function detachPaddle(fn: (e: PaddleEvent) => void) {
  if (listener === fn) listener = null;
}
