import { getPermissions, getSessionUser, isSuperAdmin } from './session';

/** Roles the backend treats as "the center's management" (billing, reminders). */
const ADMIN_ROLES = ['Administrator', 'Egasi'];

/**
 * Center-admin check, mirroring the backend rule used by BillingController and
 * RemindersController. Not a permission code — those endpoints gate on the
 * role, so the UI has to ask the same question the API will.
 */
export function isCenterAdmin(): boolean {
  const user = getSessionUser();
  if (!user) return false;
  return !!user.isSuperAdmin || ADMIN_ROLES.includes(user.defaultRole ?? '');
}

/**
 * UI permission check (UX gating only — the backend still enforces).
 * SUPER_ADMIN bypasses all checks; otherwise the code must be in the
 * effective permission union.
 */
export function can(code: string): boolean {
  if (isSuperAdmin()) return true;
  return getPermissions().includes(code);
}

/** True if the user has at least one of the given codes. */
export function canAny(codes: string[]): boolean {
  if (isSuperAdmin()) return true;
  const perms = getPermissions();
  return codes.some((c) => perms.includes(c));
}
