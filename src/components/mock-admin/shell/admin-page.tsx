'use client';
/**
 * One admin screen: sidebar (or bottom nav on phones) + topbar + main column, as every
 * design/mock-admin screen composes them. The screen body renders only for an admin whose
 * permissions open it; otherwise the design's "Ruxsat yo'q" block.
 */
import { AdminMobileNav, AdminSidebar } from './sidebar';
import { AdminTopbar } from './topbar';
import { navItem, PERM_ROLES, ROLE_SCOPE, ROOT_CRUMB, type AdminNavKey, type Crumb } from './nav';
import { useAdminShell } from './context';
import { ForbiddenState } from '../ui/state';
import { Skeleton } from '../ui/table';

export function AdminPage({ active, title, crumbs = [ROOT_CRUMB], gap = 20, maxWidth = 1440, children }: {
  active: AdminNavKey;
  title: string;
  /** parents only (the design prints "Admin / To'lovlar /" above the title) */
  crumbs?: Crumb[];
  /** main column gap: 20 (default) or 24 (Dashboard) */
  gap?: 20 | 24;
  /** 1440 (default) or 1100 (Settings) */
  maxWidth?: 1100 | 1440;
  children: React.ReactNode;
}) {
  const { me, can } = useAdminShell();
  const item = navItem(active);
  let body: React.ReactNode;
  if (!me) body = <><Skeleton height={120} /><Skeleton height={320} /></>;
  else if (!can(item.perm)) {
    body = (
      <ForbiddenState
        text={`${item.label} faqat ${PERM_ROLES[item.perm]} uchun. Sizning rolingiz — ${me.roleLabel} (${ROLE_SCOPE[me.mockRole] ?? ''}). Kerak bo'lsa, Owner'dan so'rang.`}
      />
    );
  } else body = children;
  return (
    <div className="ma-app">
      <AdminSidebar active={active} />
      <div className="ma-col">
        <AdminTopbar title={title} crumbs={crumbs} />
        <main className={`ma-main${gap === 24 ? ' gap-24' : ''}${maxWidth === 1100 ? ' w-1100' : ''}`}>{body}</main>
      </div>
      <AdminMobileNav active={active} />
    </div>
  );
}
