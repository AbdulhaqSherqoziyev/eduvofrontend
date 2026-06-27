import type { Session } from './types';
import { getSessionUser, getToken, setSession } from './session';

const O_TOKEN = 'edu_erp_imp_origin_token';
const O_USER = 'edu_erp_imp_origin_user';

/** Stash the current (OWNER) session, switch to the impersonated tenant session. */
export function startImpersonation(session: Session): void {
  if (typeof window === 'undefined') return;
  const token = getToken();
  const user = getSessionUser();
  if (token && user) {
    window.localStorage.setItem(O_TOKEN, token);
    window.localStorage.setItem(O_USER, JSON.stringify(user));
  }
  setSession(session);
  window.location.href = '/dashboard';
}

export function isImpersonating(): boolean {
  return typeof window !== 'undefined' && !!window.localStorage.getItem(O_TOKEN);
}

/** Drop any stashed OWNER origin without restoring it (used on a fresh login). */
export function clearImpersonationOrigin(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(O_TOKEN);
  window.localStorage.removeItem(O_USER);
}

/** Restore the stashed OWNER session and return to the owner panel. */
export function stopImpersonation(): void {
  if (typeof window === 'undefined') return;
  const token = window.localStorage.getItem(O_TOKEN);
  const raw = window.localStorage.getItem(O_USER);
  window.localStorage.removeItem(O_TOKEN);
  window.localStorage.removeItem(O_USER);
  if (token && raw) setSession({ accessToken: token, user: JSON.parse(raw) });
  window.location.href = '/owner';
}
