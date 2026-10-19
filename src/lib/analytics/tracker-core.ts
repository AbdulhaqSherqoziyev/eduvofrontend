/**
 * Cookie-less analytics tracker core (API contract §4, spec analytics §2.8/§7). Shared by the mock-site
 * and ERP trackers; the eduvo.uz landing has its own copy in landing/app.js (static site, no bundler).
 *
 * - No cookies, no persistent id. localStorage holds ONLY the opt-out flag `eduvo_an_off`.
 * - `?_an=off|on` writes/clears the flag, is removed from the URL (history.replaceState) and shows a
 *   plain 3-second line at the bottom — only whoever arrives with the parameter sees it.
 * - Engagement: while the page is visible, an `en` chunk every 15 s; on hide/pagehide the rest with fin.
 */

export const OPT_OUT_KEY = 'eduvo_an_off';

export function isOptedOut(): boolean {
  try { return localStorage.getItem(OPT_OUT_KEY) === '1'; } catch { return false; }
}

/** Handle `?_an=off|on` once per page load. */
export function handleOptOutParam(): void {
  if (typeof window === 'undefined') return;
  let url: URL;
  try { url = new URL(window.location.href); } catch { return; }
  const v = url.searchParams.get('_an');
  if (v !== 'off' && v !== 'on') return;
  try {
    if (v === 'off') localStorage.setItem(OPT_OUT_KEY, '1'); else localStorage.removeItem(OPT_OUT_KEY);
  } catch { /* storage blocked: nothing to remember */ }
  url.searchParams.delete('_an');
  try { window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`); } catch { /* ignore */ }
  showNotice(v === 'off' ? 'Bu brauzer analitikada hisobga olinmaydi' : 'Bu brauzer yana hisobga olinadi');
}

function showNotice(text: string) {
  const el = document.createElement('div');
  el.textContent = text;
  el.setAttribute('role', 'status');
  el.style.cssText = 'position:fixed;left:50%;bottom:16px;transform:translateX(-50%);z-index:2147483647;max-width:calc(100% - 32px);'
    + 'padding:8px 14px;border-radius:10px;background:rgba(30,42,58,.88);color:#fff;font:600 13px/1.4 system-ui,sans-serif;text-align:center;pointer-events:none';
  const add = () => document.body.appendChild(el);
  if (document.body) add(); else document.addEventListener('DOMContentLoaded', add, { once: true });
  setTimeout(() => el.remove(), 3000);
}

/** 16-char base64url page-load id (new for every pageview, never stored). */
export function newPid(): string {
  const b = new Uint8Array(12);
  crypto.getRandomValues(b);
  let s = '';
  b.forEach((x) => { s += String.fromCharCode(x); });
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

const TICK_MS = 15_000;
const MAX_CHUNK = 60_000;

/**
 * Visible-time accounting for one page id. `send(ms, fin)` is called every 15 s while visible and once
 * with fin=true when the page hides / unloads / is replaced by an SPA navigation.
 */
export class Engagement {
  private since: number | null = null;
  private acc = 0;
  private finSent = false;
  private timer: ReturnType<typeof setInterval> | null = null;
  private readonly onVis = () => (document.visibilityState === 'visible' ? this.resume() : this.flush(true));
  private readonly onHide = () => this.flush(true);

  constructor(private readonly send: (ms: number, fin: boolean) => void) {
    document.addEventListener('visibilitychange', this.onVis);
    window.addEventListener('pagehide', this.onHide);
    if (document.visibilityState === 'visible') this.resume();
  }

  private resume() {
    this.finSent = false;
    if (this.since === null) this.since = Date.now();
    if (!this.timer) this.timer = setInterval(() => this.flush(false), TICK_MS);
  }

  private take(): number {
    if (this.since !== null) { this.acc += Date.now() - this.since; this.since = document.visibilityState === 'visible' ? Date.now() : null; }
    const ms = Math.min(MAX_CHUNK, Math.max(0, Math.round(this.acc)));
    this.acc = 0;
    return ms;
  }

  flush(fin: boolean) {
    const ms = this.take();
    if (fin) {
      this.since = null;
      if (this.timer) { clearInterval(this.timer); this.timer = null; }
    }
    // hide → pagehide would otherwise send two empty final chunks
    if (ms > 0 || (fin && !this.finSent)) this.send(ms, fin);
    if (fin) this.finSent = true;
  }

  /** SPA navigation / unmount: last chunk for this pid, then stop listening. */
  stop() {
    this.flush(true);
    document.removeEventListener('visibilitychange', this.onVis);
    window.removeEventListener('pagehide', this.onHide);
  }
}

/** In-app browser hint for the backend's browser classifier. */
export function inAppBrowser(): 'telegram' | 'instagram' | undefined {
  const ua = navigator.userAgent || '';
  if (/Telegram/i.test(ua) || typeof (window as unknown as { TelegramWebviewProxy?: unknown }).TelegramWebviewProxy !== 'undefined') return 'telegram';
  if (/Instagram/i.test(ua)) return 'instagram';
  return undefined;
}

export const clip = (s: string | null | undefined, n: number) => (s ? String(s).slice(0, n) : undefined);
