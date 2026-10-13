'use client';

import { useCallback, useEffect, useState } from 'react';
import { BookOpen, CalendarCheck, Home, User, Wallet } from 'lucide-react';
import { NmDialog } from '@/components/ui/nm-dialog';
import { NmButton } from '@/components/ui/nm-button';
import { HomeSkeleton } from '@/components/ui/nm-skeleton';
import { CHILD_KEY, apiFetch, clearCaches, readCache, writeCache, type FailKind } from '../_lib/api';
import type { Overview } from '../_lib/types';
import { OfflineBar, PortalErrorCard } from './offline-bar';
import { PortalTabBar, type TabDef } from './portal-tabbar';
import { AssignmentsTab, AttendanceTab, StudentHome } from './portal-student';
import { ParentHome } from './portal-parent';
import { ProfileTab } from './portal-profile';
import { PaymentDetail } from './portal-payment';
import { firstName } from '../_lib/api';

type Tab = 'home' | 'tasks' | 'money' | 'attendance' | 'profile';

const STUDENT_TABS: TabDef<Tab>[] = [
  { key: 'home', label: 'Bosh sahifa', icon: Home },
  { key: 'tasks', label: 'Vazifalar', icon: BookOpen },
  { key: 'attendance', label: 'Davomat', icon: CalendarCheck },
  { key: 'profile', label: 'Profil', icon: User },
];

const PARENT_TABS: TabDef<Tab>[] = [
  { key: 'home', label: 'Bosh sahifa', icon: Home },
  { key: 'money', label: "To'lov", icon: Wallet },
  { key: 'attendance', label: 'Davomat', icon: CalendarCheck },
  { key: 'profile', label: 'Profil', icon: User },
];

const readChild = (): string | null => {
  try {
    return window.localStorage.getItem(CHILD_KEY);
  } catch {
    return null;
  }
};

/**
 * The installed app for a student or a parent.
 *
 * Two rules shape everything below:
 *  - a lost connection never costs a session. Only a real 401 on the data call
 *    signs anyone out; a timeout or a 500 keeps the token and offers a retry.
 *  - the last good answer is kept in localStorage, not Cache Storage, so it is
 *    wiped together with the token. One phone is often shared in a family.
 */
export function PortalOverview({
  token,
  onLogout,
  onToken,
}: {
  token: string;
  onLogout: (reason?: 'auth') => void;
  onToken?: (t: string) => void;
}) {
  const [data, setData] = useState<Overview | null>(null);
  const [cachedAt, setCachedAt] = useState<string | null>(null);
  const [fromCache, setFromCache] = useState(false);
  const [fail, setFail] = useState<Exclude<FailKind, 'auth'> | null>(null);
  const [tab, setTab] = useState<Tab>('home');
  const [child, setChild] = useState<string | null>(() => (typeof window === 'undefined' ? null : readChild()));
  const [reload, setReload] = useState(0);
  const [confirmOut, setConfirmOut] = useState(false);
  const [openAssignment, setOpenAssignment] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    const key = `portal:${child ?? 'self'}`;

    // Cache first: the screen appears immediately and refreshes underneath.
    // A skeleton is only for people who have nothing stored yet.
    const cached = readCache<Overview>(key);
    if (cached) {
      setData(cached.data);
      setCachedAt(cached.at);
      setFromCache(true);
    }
    setFail(null);

    apiFetch<Overview>(`/portal/overview${child ? `?studentId=${encodeURIComponent(child)}` : ''}`, { token }).then(
      (res) => {
        if (!alive) return;
        if (res.ok) {
          setData(res.data);
          setFromCache(false);
          setFail(null);
          writeCache(key, res.data);
          return;
        }
        if (res.kind === 'auth') {
          clearCaches();
          onLogout('auth');
          return;
        }
        setFail(res.kind);
      },
    );

    return () => {
      alive = false;
    };
  }, [token, child, reload, onLogout]);

  // Connection back → refresh quietly. No toast, no "you are online again!".
  useEffect(() => {
    const on = () => setReload((x) => x + 1);
    window.addEventListener('online', on);
    return () => window.removeEventListener('online', on);
  }, []);

  // Remember which child is on screen. It used to reset to the first one on
  // every open, so a parent of two re-picked the same name every single time.
  useEffect(() => {
    const kids = data?.children ?? [];
    if (!kids.length) return;
    if (child && kids.some((k) => k.studentId === child)) return;
    const first = kids[0].studentId;
    try {
      window.localStorage.setItem(CHILD_KEY, first);
    } catch {
      /* ignore */
    }
    setChild(first);
  }, [data, child]);

  const pickChild = useCallback((id: string) => {
    try {
      window.localStorage.setItem(CHILD_KEY, id);
    } catch {
      /* ignore */
    }
    setChild(id);
    setTab('home');
  }, []);

  const retry = useCallback(() => {
    setFail(null);
    setReload((x) => x + 1);
  }, []);

  const markRead = useCallback(async () => {
    await apiFetch(`/portal/notifications/read${child ? `?studentId=${encodeURIComponent(child)}` : ''}`, {
      token,
      method: 'PATCH',
    });
    setReload((x) => x + 1);
  }, [token, child]);

  const shell = (body: React.ReactNode, withTabs: boolean) => (
    <>
      <main className="min-h-screen bg-background p-4 pb-[76px] sm:p-8 sm:pb-[76px]">
        <div className="mx-auto flex max-w-3xl flex-col gap-3 sm:gap-5">{body}</div>
      </main>
      {withTabs && data ? (
        <PortalTabBar tabs={data.role === 'parent' ? PARENT_TABS : STUDENT_TABS} active={tab} onChange={setTab} />
      ) : null}
    </>
  );

  if (!data && fail) return shell(<PortalErrorCard kind={fail} onRetry={retry} />, false);
  if (!data) return shell(<HomeSkeleton />, false);

  const parent = data.role === 'parent';
  const name = firstName(data.student.fullName);

  const content = () => {
    if (tab === 'profile')
      return <ProfileTab d={data} token={token} onLogout={() => setConfirmOut(true)} onToken={onToken} />;
    if (tab === 'attendance') return <AttendanceTab d={data} name={parent ? name : undefined} />;
    if (tab === 'money') return <PaymentDetail d={data} title={`${name} — to'lov`} />;
    if (tab === 'tasks')
      return (
        <AssignmentsTab
          d={data}
          token={token}
          openId={openAssignment}
          onDone={() => {
            setOpenAssignment(null);
            setReload((x) => x + 1);
          }}
        />
      );
    return parent ? (
      <ParentHome
        d={data}
        child={child ?? ''}
        onChild={pickChild}
        onPayments={() => setTab('money')}
        onMarkRead={markRead}
      />
    ) : (
      <StudentHome
        d={data}
        onSubmitAssignment={(id) => {
          setOpenAssignment(id);
          setTab('tasks');
        }}
      />
    );
  };

  return shell(
    <>
      {/* Only while the screen really is drawn from the stored copy. Not shown
          during a slow refresh — we do not yet know the connection is gone. */}
      {fromCache && fail && cachedAt ? <OfflineBar at={cachedAt} kind={fail} /> : null}
      {content()}

      <NmDialog open={confirmOut} onOpenChange={setConfirmOut} title="Chiqasizmi?">
        <p className="text-[13.5px] font-semibold leading-[1.55] text-foreground">
          Qayta kirish uchun login va parol kerak bo&apos;ladi.
        </p>
        <div className="mt-4 flex gap-3 max-[380px]:flex-col-reverse">
          <NmButton variant="soft" className="min-h-[44px] flex-[1.4]" autoFocus onClick={() => setConfirmOut(false)}>
            Bekor qilish
          </NmButton>
          <NmButton variant="danger" className="min-h-[44px] flex-1" onClick={() => onLogout()}>
            Chiqish
          </NmButton>
        </div>
      </NmDialog>
    </>,
    true,
  );
}
