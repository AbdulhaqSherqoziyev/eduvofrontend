import { getPermissions, isSuperAdmin } from './session';

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
