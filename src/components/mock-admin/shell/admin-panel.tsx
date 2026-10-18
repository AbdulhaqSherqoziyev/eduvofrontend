'use client';
/**
 * Client side of the (panel) layout: auth guard + session. No token → /login?next=…; the admin
 * comes from A4 /auth/me (a 401 there clears the token and redirects, see lib/admin-mock/http).
 */
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/admin-mock/api';
import { getAdminToken, loginUrl } from '@/lib/admin-mock/session';
import { AdminShellProvider, ME_KEY, type AdminEnv } from './context';

export function AdminPanel({ env, children }: { env: AdminEnv; children: React.ReactNode }) {
  const [hasToken, setHasToken] = useState<boolean | null>(null);
  useEffect(() => {
    const t = !!getAdminToken();
    setHasToken(t);
    if (!t) window.location.replace(loginUrl());
  }, []);
  const meQ = useQuery({ queryKey: ME_KEY, queryFn: adminApi.me, enabled: hasToken === true, staleTime: 5 * 60_000, retry: 1 });

  // no token yet / redirecting: the page background only (no flash of a shell with someone else's data)
  if (!hasToken) return <div className="ma-app" aria-busy="true" />;
  return (
    <AdminShellProvider env={env} me={meQ.data ?? null}>
      {meQ.isError ? <SessionError onRetry={() => meQ.refetch()} /> : children}
    </AdminShellProvider>
  );
}

function SessionError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="ma-center">
      <div className="ma-state k-error" role="alert">
        <div className="ma-state-ico-err" aria-hidden="true">!</div>
        <div className="ma-state-title">Ma&apos;lumotlarni yuklab bo&apos;lmadi</div>
        <div className="ma-state-text">Internet aloqasini tekshiring yoki qayta urinib ko&apos;ring.</div>
        <button type="button" className="ma-btn v-primary s-42" onClick={onRetry}>Qayta urinish</button>
      </div>
    </div>
  );
}
