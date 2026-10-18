'use client';
/**
 * Shell state of every signed-in screen: the admin (A4 /auth/me), permissions, sidebar badges (N1,
 * every 60 s), notifications (N3), sidebar collapse (kept across navigations — the provider lives
 * in the (panel) layout).
 */
import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/admin-mock/api';
import { clearAdminToken } from '@/lib/admin-mock/session';
import type { AdminMe, Badges, NotificationsRes, Perm } from '@/lib/admin-mock/types';
import type { AdminNavBadges } from './nav';

export type AdminEnv = 'PROD' | 'DEV';

/** `auto` = open ≥ 1200px, collapsed below; a click on the toggle fixes it. */
type SideMode = 'auto' | 'open' | 'closed';

interface Ctx {
  env: AdminEnv;
  me: AdminMe | null;
  can: (p: Perm) => boolean;
  badges: AdminNavBadges;
  unread: number;
  notifications: NotificationsRes | undefined;
  notificationsError: boolean;
  loadNotifications: () => void;
  markSeen: () => void;
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

export const ME_KEY = ['am', 'me'] as const;

export function AdminShellProvider({ env, me, children }: { env: AdminEnv; me: AdminMe | null; children: React.ReactNode }) {
  const qc = useQueryClient();
  const [side, setSide] = useState<SideMode>('auto');
  const [wantNotes, setWantNotes] = useState(false);
  const perms = useMemo(() => new Set(me?.permissions ?? []), [me]);
  const can = useCallback((p: Perm) => perms.has(p), [perms]);
  const manage = perms.has('mock.manage');

  const badgesQ = useQuery<Badges>({
    queryKey: ['am', 'badges'],
    queryFn: adminApi.badges,
    enabled: manage,
    refetchInterval: 60_000,
    refetchIntervalInBackground: false,
    staleTime: 30_000,
  });
  const notesQ = useQuery<NotificationsRes>({
    queryKey: ['am', 'notifications'],
    queryFn: adminApi.notifications,
    enabled: manage && wantNotes,
    staleTime: 15_000,
  });

  const toggleSide = useCallback(() => {
    setSide((s) => {
      const openNow = s === 'auto' ? window.matchMedia('(min-width: 1200px)').matches : s === 'open';
      return openNow ? 'closed' : 'open';
    });
  }, []);

  const loadNotifications = useCallback(() => {
    setWantNotes(true);
    if (wantNotes) void notesQ.refetch();
  }, [wantNotes, notesQ]);

  const markSeen = useCallback(() => {
    const top = notesQ.data?.items[0];
    if (!top || !(notesQ.data?.unreadCount || badgesQ.data?.unreadNotifications)) return;
    adminApi.notificationsSeen(top.at).then(
      ({ unreadCount }) => {
        qc.setQueryData<Badges>(['am', 'badges'], (b) => (b ? { ...b, unreadNotifications: unreadCount } : b));
        qc.setQueryData<NotificationsRes>(['am', 'notifications'], (n) => (n ? { ...n, unreadCount } : n));
      },
      () => undefined, // the dot simply stays; next poll corrects it
    );
  }, [notesQ.data, badgesQ.data, qc]);

  const logout = useCallback(async () => {
    try {
      await adminApi.logout();
    } catch {
      /* the token is dropped anyway (12 h TTL, contract A5) */
    }
    clearAdminToken();
    qc.clear();
    window.location.replace('/login');
  }, [qc]);

  const b = badgesQ.data;
  const value: Ctx = {
    env: me?.env ?? env,
    me,
    can,
    badges: b ? { orders: b.pendingManualOrders, tickets: b.openTickets } : {},
    unread: b?.unreadNotifications ?? notesQ.data?.unreadCount ?? 0,
    notifications: notesQ.data,
    notificationsError: notesQ.isError,
    loadNotifications,
    markSeen,
    side,
    toggleSide,
    logout,
  };
  return <ShellCtx.Provider value={value}>{children}</ShellCtx.Provider>;
}
