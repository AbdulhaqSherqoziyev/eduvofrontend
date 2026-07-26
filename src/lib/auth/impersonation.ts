import type { Session, SessionUser } from './types';
import { getSessionUser, getToken, setSession } from './session';

/**
 * "Eye mode" sessions, kept as a STACK.
 *
 * Impersonation nests in real use: the OWNER opens a center, and from inside
 * that center opens a teacher. A single origin slot cannot express that — the
 * second hop overwrote the first, so returning landed on the center and the
 * OWNER session was gone for good. The only way back was logging out.
 *
 * Each hop pushes the session it is leaving. Returning pops one level, and
 * "back to my own account" unwinds to the bottom of the stack — the identity
 * the person actually logged in as.
 */
const STACK = 'edu_erp_imp_stack';
/** Pre-stack keys. Read once so an open tab does not lose its way home. */
const LEGACY_TOKEN = 'edu_erp_imp_origin_token';
const LEGACY_USER = 'edu_erp_imp_origin_user';

interface Origin {
  token: string;
  user: SessionUser;
}

function readStack(): Origin[] {
  if (typeof window === 'undefined') return [];
  const raw = window.localStorage.getItem(STACK);
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? (parsed as Origin[]) : [];
    } catch {
      return [];
    }
  }
  // Migrate a session that started before the stack existed.
  const token = window.localStorage.getItem(LEGACY_TOKEN);
  const user = window.localStorage.getItem(LEGACY_USER);
  if (!token || !user) return [];
  try {
    return [{ token, user: JSON.parse(user) as SessionUser }];
  } catch {
    return [];
  }
}

function writeStack(stack: Origin[]): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(LEGACY_TOKEN);
  window.localStorage.removeItem(LEGACY_USER);
  if (stack.length) window.localStorage.setItem(STACK, JSON.stringify(stack));
  else window.localStorage.removeItem(STACK);
}

/** Where a restored session belongs. */
function homeOf(user: SessionUser | null | undefined): string {
  return user?.isPlatform ? '/owner' : '/dashboard';
}

/** Stash the current session and switch to the impersonated one. */
export function startImpersonation(session: Session): void {
  if (typeof window === 'undefined') return;
  const token = getToken();
  const user = getSessionUser();
  if (token && user) writeStack([...readStack(), { token, user }]);
  setSession(session);
  window.location.href = '/dashboard';
}

export function isImpersonating(): boolean {
  return readStack().length > 0;
}

/** How many sessions deep — 2 means OWNER -> center -> teacher. */
export function impersonationDepth(): number {
  return readStack().length;
}

/** The identity this person actually logged in as, if any hop is active. */
export function impersonationOrigin(): SessionUser | null {
  return readStack()[0]?.user ?? null;
}

/** Drop the whole stack without restoring it (used on a fresh login). */
export function clearImpersonationOrigin(): void {
  writeStack([]);
}

function restore(origin: Origin, rest: Origin[]): void {
  writeStack(rest);
  setSession({ accessToken: origin.token, user: origin.user });
  window.location.href = homeOf(origin.user);
}

/** Go back one hop: teacher -> center, or center -> OWNER. */
export function stepBackImpersonation(): void {
  if (typeof window === 'undefined') return;
  const stack = readStack();
  const previous = stack.pop();
  if (!previous) {
    window.location.href = '/dashboard';
    return;
  }
  restore(previous, stack);
}

/**
 * Back to the account this person logged in with, however deep they went.
 * This is what "return to my own account" has always promised.
 */
export function stopImpersonation(): void {
  if (typeof window === 'undefined') return;
  const stack = readStack();
  const root = stack[0];
  if (!root) {
    window.location.href = '/dashboard';
    return;
  }
  restore(root, []);
}

/** "View as student" — open the read-only portal in a new tab with a student token. */
export function enterAsStudent(token: string): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem('eduvo_portal_token', token);
  window.open('/portal', '_blank');
}
