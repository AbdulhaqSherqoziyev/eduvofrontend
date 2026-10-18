'use client';
/**
 * Client side of the (panel) layout. Until the admin API contract lands
 * (.claude/specs/mock-admin/_api-contract.md) there is no session, no badge counts and no
 * notifications: the sidebar shows the user skeleton and no badges. Wire them here, not in the pages.
 */
import { AdminShellProvider, type AdminEnv } from './context';

export function AdminPanel({ env, children }: { env: AdminEnv; children: React.ReactNode }) {
  return (
    <AdminShellProvider env={env} user={null} badges={{}} notifications={[]}>
      {children}
    </AdminShellProvider>
  );
}
