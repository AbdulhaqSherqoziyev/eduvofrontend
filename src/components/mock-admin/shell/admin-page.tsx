'use client';
/**
 * One admin screen: sidebar (or bottom nav on phones) + topbar + main column, as every
 * design/mock-admin screen composes them (`<dc-import AdminSidebar active=…>` + `<dc-import AdminTopbar title crumbs>`).
 */
import { AdminMobileNav, AdminSidebar } from './sidebar';
import { AdminTopbar } from './topbar';
import { ROOT_CRUMB, type AdminNavKey, type Crumb } from './nav';

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
  return (
    <div className="ma-app">
      <AdminSidebar active={active} />
      <div className="ma-col">
        <AdminTopbar title={title} crumbs={crumbs} />
        <main className={`ma-main${gap === 24 ? ' gap-24' : ''}${maxWidth === 1100 ? ' w-1100' : ''}`}>{children}</main>
      </div>
      <AdminMobileNav active={active} />
    </div>
  );
}
