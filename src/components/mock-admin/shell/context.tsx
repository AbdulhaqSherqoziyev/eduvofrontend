'use client';
/**
 * Shell state shared by every admin page: env pill, signed-in admin, sidebar badges, notifications,
 * sidebar collapse (kept across navigations — the provider lives in the (panel) layout).
 * Data comes in through props; the API wiring replaces the defaults once the contract lands.
 */
import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { AdminNavBadges } from './nav';

export type AdminEnv = 'PROD' | 'DEV';
export interface AdminUser { name: string; /** shown as is: Owner / Operator / Kontent */ role: string }
export interface AdminNotification { id: string; title: string; sub: string; tone: 'warn' | 'ok' | 'blue' | 'err'; href: string }

export interface AdminShellData {
  env: AdminEnv;
  /** null while the session is loading */
  user: AdminUser | null;
  badges: AdminNavBadges;
  /** undefined while loading */
  notifications?: AdminNotification[];
  onLogout?: () => void | Promise<void>;
  /** topbar search submit (Enter) */
  onSearch?: (q: string) => void;
}

/** `null` = automatic (open ≥ 1200px, collapsed below); a click on the toggle fixes it. */
type SideMode = 'auto' | 'open' | 'closed';

interface Ctx extends AdminShellData {
  side: SideMode;
  toggleSide: () => void;
  logout: () => void;
}

const ShellCtx = createContext<Ctx | null>(null);

export function useAdminShell() {
  const c = useContext(ShellCtx);
  if (!c) throw new Error('useAdminShell outside AdminShellProvider');
  return c;
}

export function AdminShellProvider({ children, ...data }: AdminShellData & { children: React.ReactNode }) {
  const router = useRouter();
  const [side, setSide] = useState<SideMode>('auto');
  const toggleSide = useCallback(() => {
    setSide((s) => {
      const openNow = s === 'auto' ? window.matchMedia('(min-width: 1200px)').matches : s === 'open';
      return openNow ? 'closed' : 'open';
    });
  }, []);
  const { onLogout } = data;
  const logout = useCallback(async () => {
    try {
      await onLogout?.();
    } finally {
      router.replace('/login');
    }
  }, [onLogout, router]);
  const value = useMemo(() => ({ ...data, side, toggleSide, logout }), [data, side, toggleSide, logout]);
  return <ShellCtx.Provider value={value}>{children}</ShellCtx.Provider>;
}
