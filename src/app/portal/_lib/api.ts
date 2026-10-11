/**
 * The one door every portal / teacher request goes through.
 *
 * It exists because the screens used to translate *any* failure into "session
 * expired" and offer a single button that deleted the token. A tunnel with no
 * signal therefore cost a family the login the centre issued and nobody can
 * reset. Here a dropped connection, a 500 and a real 401 are three different
 * things, and only the last one is allowed to touch the token.
 */

export const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export const TOKEN_KEY = 'eduvo_portal_token';
export const TEACHER_KEY = 'eduvo_tg_teacher';
export const CHILD_KEY = 'eduvo_portal_child';
export const LAST_LOGIN_KEY = 'eduvo_last_login';
export const LAST_PHONE_KEY = 'eduvo_last_phone';
export const PENDING_PREFIX = 'eduvo_att_pending:';
const CACHE_PREFIX = 'eduvo_cache_v1:';

const TIMEOUT_MS = 10_000;

export type FailKind = 'network' | 'auth' | 'server';
export type ApiResult<T> =
  | { ok: true; data: T }
  /** `message` is the backend's own text, and is only ever shown where that
   *  text is known to be written for the person reading it (see §400 handling
   *  in teacher-roster). Everywhere else the screen uses its own copy. */
  | { ok: false; kind: FailKind; status?: number; message?: string };

/** Pull a user-facing `message` out of an error body, if there is one. */
async function failMessage(r: Response): Promise<string | undefined> {
  try {
    const d = (await r.json()) as { message?: string | string[] };
    const m = Array.isArray(d?.message) ? d.message.join(', ') : d?.message;
    return typeof m === 'string' && m.trim() ? m : undefined;
  } catch {
    return undefined;
  }
}

interface FetchOpts {
  token?: string;
  method?: string;
  body?: unknown;
}

/**
 * Never throws. `network` and `server` keep the session; only `auth` (a real
 * 401/403) means the token is gone.
 */
export async function apiFetch<T>(path: string, { token, method = 'GET', body }: FetchOpts = {}): Promise<ApiResult<T>> {
  // Asking the radio for a request we know cannot leave the phone only costs
  // the person ten seconds of spinner.
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    return { ok: false, kind: 'network' };
  }
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const r = await fetch(`${API}${path}`, {
      method,
      signal: ctrl.signal,
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });
    if (r.status === 401 || r.status === 403) return { ok: false, kind: 'auth', status: r.status };
    if (!r.ok) return { ok: false, kind: 'server', status: r.status, message: await failMessage(r) };
    const text = await r.text();
    return { ok: true, data: (text ? JSON.parse(text) : null) as T };
  } catch {
    // fetch throws for a dead connection and for our own abort; both mean the
    // person is offline as far as this screen is concerned.
    return { ok: false, kind: 'network' };
  } finally {
    clearTimeout(timer);
  }
}

// ── Cache ────────────────────────────────────────────────────────────────────
// Deliberately localStorage and NOT Cache Storage: a phone is often shared in a
// family, and Cache Storage survives a logout. localStorage is wiped together
// with the token, so signing out really does remove the child's data.

export interface Cached<T> {
  at: string;
  data: T;
}

export function readCache<T>(key: string): Cached<T> | null {
  try {
    const raw = window.localStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return null;
    const v = JSON.parse(raw) as Cached<T>;
    return v && typeof v.at === 'string' && 'data' in v ? v : null;
  } catch {
    return null;
  }
}

export function writeCache<T>(key: string, data: T): void {
  try {
    window.localStorage.setItem(CACHE_PREFIX + key, JSON.stringify({ at: new Date().toISOString(), data }));
  } catch {
    /* quota / private mode — the screen still works straight from the network */
  }
}

/** Drop every cached payload (logout, and any `auth` failure). */
export function clearCaches(): void {
  try {
    for (const k of Object.keys(window.localStorage)) {
      if (k.startsWith(CACHE_PREFIX)) window.localStorage.removeItem(k);
    }
  } catch {
    /* ignore */
  }
}

/**
 * Sign out. `eduvo_last_login` stays on purpose (it is the login the centre
 * issued, not a secret) so the next sign-in is one field shorter. Unsaved
 * attendance marks stay too — losing a teacher's work is exactly what §8.3
 * protects against.
 */
export function clearSession(): void {
  try {
    window.localStorage.removeItem(TOKEN_KEY);
    window.localStorage.removeItem(TEACHER_KEY);
    window.localStorage.removeItem(CHILD_KEY);
  } catch {
    /* ignore */
  }
  clearCaches();
}

// ── Unsaved attendance ───────────────────────────────────────────────────────
// A teacher who marked twelve students and then walked into a corridor with no
// signal must not lose that work. The marks wait here until they land, and are
// resent quietly when the connection returns.

export interface PendingMarks {
  lessonId: string;
  groupId: string;
  groupName: string;
  at: string;
  marks: { studentId: string; status: string; lateMinutes: number; score?: number | null }[];
}

export function readPending(lessonId: string): PendingMarks | null {
  try {
    const raw = window.localStorage.getItem(PENDING_PREFIX + lessonId);
    return raw ? (JSON.parse(raw) as PendingMarks) : null;
  } catch {
    return null;
  }
}

export function writePending(p: PendingMarks): void {
  try {
    window.localStorage.setItem(PENDING_PREFIX + p.lessonId, JSON.stringify(p));
  } catch {
    /* ignore */
  }
}

export function clearPending(lessonId: string): void {
  try {
    window.localStorage.removeItem(PENDING_PREFIX + lessonId);
  } catch {
    /* ignore */
  }
}

export function listPending(): PendingMarks[] {
  const out: PendingMarks[] = [];
  try {
    for (const k of Object.keys(window.localStorage)) {
      if (!k.startsWith(PENDING_PREFIX)) continue;
      const raw = window.localStorage.getItem(k);
      if (!raw) continue;
      const v = JSON.parse(raw) as PendingMarks;
      if (v?.lessonId) out.push(v);
    }
  } catch {
    /* ignore */
  }
  return out;
}

// ── Dates ────────────────────────────────────────────────────────────────────

const MONTHS = [
  'yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun',
  'iyul', 'avgust', 'sentyabr', 'oktyabr', 'noyabr', 'dekabr',
];
const WEEKDAYS = ['yakshanba', 'dushanba', 'seshanba', 'chorshanba', 'payshanba', 'juma', 'shanba'];

const pad = (n: number) => String(n).padStart(2, '0');

/** Local YYYY-MM-DD (the API sends dates in this shape). */
export function todayIso(): string {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** "2026-07-29" -> "29-iyul" */
export function dayLabel(iso: string): string {
  const [y, m, d] = (iso || '').split('-').map(Number);
  if (!y || !m || !d) return iso ?? '';
  return `${d}-${MONTHS[m - 1] ?? ''}`;
}

/** "2026-07-25" -> "25.07" */
export function dotDate(iso: string): string {
  const [, m, d] = (iso || '').split('-');
  return m && d ? `${d}.${m}` : (iso ?? '');
}

/** "2026-07-27" -> "27-iyul, shanba" */
export function longDayLabel(iso: string): string {
  const [y, m, d] = (iso || '').split('-').map(Number);
  if (!y || !m || !d) return iso ?? '';
  return `${dayLabel(iso)}, ${WEEKDAYS[new Date(y, m - 1, d).getDay()]}`;
}

/** Invoice period "2026-07" -> "Iyul oyi" */
export function periodLabel(period: string): string {
  const [, m] = (period || '').split('-').map(Number);
  const name = MONTHS[(m ?? 0) - 1];
  if (!name) return period ?? '';
  return `${name[0].toUpperCase()}${name.slice(1)} oyi`;
}

/** Cache timestamp for the offline bar: "bugun 14:20" or "26-iyul 14:20". */
export function cachedAtLabel(at: string): string {
  const d = new Date(at);
  if (isNaN(d.getTime())) return '';
  const hm = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  const now = new Date();
  const sameDay =
    d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
  return sameDay ? `bugun ${hm}` : `${d.getDate()}-${MONTHS[d.getMonth()]} ${hm}`;
}

/** Monday 00:00 of the current week, as YYYY-MM-DD. */
export function weekStartIso(): string {
  const d = new Date();
  const shift = (d.getDay() + 6) % 7; // Monday = 0
  d.setDate(d.getDate() - shift);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** First word of a full name — "Salom, Aziz", not "Salom, Aziz Karimov". */
export function firstName(fullName: string): string {
  return (fullName || '').trim().split(/\s+/)[0] || '';
}
