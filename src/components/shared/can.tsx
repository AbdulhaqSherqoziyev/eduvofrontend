'use client';

import { can } from '@/lib/auth/permissions';

interface CanProps {
  /** Permission code, e.g. "payment.create". */
  permission: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/** Render children only if the current user holds the permission code. */
export function Can({ permission, children, fallback = null }: CanProps) {
  return <>{can(permission) ? children : fallback}</>;
}
