'use client';

import { getSessionUser } from '@/lib/auth/session';

/**
 * Render children only for the tenant owner ("Egasi") — even super admins
 * are excluded (mirrors the backend guard on import / bulk credentials).
 */
export function OwnerOnly({ children, fallback = null }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  const user = getSessionUser();
  return <>{user?.defaultRole === 'Egasi' ? children : fallback}</>;
}
