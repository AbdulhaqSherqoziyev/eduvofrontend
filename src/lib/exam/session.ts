/**
 * Who the student is on /exams/* and in the player:
 *  - a PIN session (`/exams/login`, contract §1.13, scope exam_code) — kept
 *    until its own `expiresAt` (windowEnd + 6 h), confined to one assignment;
 *  - otherwise the ordinary portal token.
 * A PIN session wins while it is alive: the person typed that code on purpose.
 */
import type { CodeLoginResp } from './hub-types';

const PORTAL_KEY = 'eduvo_portal_token';
const CODE_KEY = 'eduvo_exam_code_session';

export type CodeSession = Pick<CodeLoginResp, 'token' | 'expiresAt' | 'student' | 'assignment' | 'attemptId'>;

export function readCodeSession(): CodeSession | null {
  try {
    const raw = window.localStorage.getItem(CODE_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as CodeSession;
    if (!s?.token || new Date(s.expiresAt).getTime() <= Date.now()) {
      window.localStorage.removeItem(CODE_KEY);
      return null;
    }
    return s;
  } catch {
    return null;
  }
}

export function saveCodeSession(r: CodeLoginResp): void {
  const s: CodeSession = { token: r.token, expiresAt: r.expiresAt, student: r.student, assignment: r.assignment, attemptId: r.attemptId };
  try {
    window.localStorage.setItem(CODE_KEY, JSON.stringify(s));
  } catch {
    /* private mode — the session lives only in memory for this page */
  }
}

export function clearCodeSession(): void {
  try {
    window.localStorage.removeItem(CODE_KEY);
  } catch {
    /* ignore */
  }
}

export function readPortalToken(): string | null {
  try {
    return window.localStorage.getItem(PORTAL_KEY);
  } catch {
    return null;
  }
}

/** Token for the hub and the player (preview tokens are handled by the player page itself). */
export function examStudentToken(): string | null {
  if (typeof window === 'undefined') return null;
  return readCodeSession()?.token ?? readPortalToken();
}
