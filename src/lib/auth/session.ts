import { clearModuleGate } from './module-gate';
import type { Session, SessionUser } from './types';

const TOKEN_KEY = 'edu_erp_token';
const USER_KEY = 'edu_erp_user';
// Kept in sync with lib/auth/impersonation.ts (avoids a circular import).
const IMP_ORIGIN_KEYS = ['edu_erp_imp_origin_token', 'edu_erp_imp_origin_user'];

const isBrowser = () => typeof window !== 'undefined';

export function getToken(): string | null {
  if (!isBrowser()) return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function getSessionUser(): SessionUser | null {
  if (!isBrowser()) return null;
  const raw = window.localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SessionUser;
  } catch {
    return null;
  }
}

export function getPermissions(): string[] {
  return getSessionUser()?.permissions ?? [];
}

export function isSuperAdmin(): boolean {
  return getSessionUser()?.isSuperAdmin ?? false;
}

export function setSession(session: Session): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(TOKEN_KEY, session.accessToken);
  window.localStorage.setItem(USER_KEY, JSON.stringify(session.user));
  // A new session can be another user or (entering a branch) another tenant —
  // the cached module list belongs to neither. Dropping it makes the nav
  // optimistic until the first GET /modules lands.
  clearModuleGate();
}

export function clearSession(): void {
  if (!isBrowser()) return;
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
  clearModuleGate();
  // Tear down any stashed impersonation origin so a later login can't inherit it.
  IMP_ORIGIN_KEYS.forEach((k) => window.localStorage.removeItem(k));
}
