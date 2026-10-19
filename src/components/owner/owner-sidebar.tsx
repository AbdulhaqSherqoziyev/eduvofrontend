'use client';

import { usePathname } from 'next/navigation';
import { BarChart3, Building2, BadgeDollarSign, Boxes, ArrowLeftRight, Users, FileText, LogOut, ClipboardList, GraduationCap } from 'lucide-react';
import { Brand } from '@/components/layout/brand';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import { NavItemLink } from '@/components/layout/nav-item';
import { useMobileNav } from '@/components/layout/mobile-nav';
import { useAuth } from '@/providers/auth-provider';
import { cn } from '@/lib/utils/cn';
import { canManageMock } from '@/lib/auth/can-mock';
import type { SessionUser } from '@/lib/auth/types';

const canReadAnalytics = (u: SessionUser | null) => !!u?.isPlatform && (!!u.isOwner || (u.permissions ?? []).includes('analytics.read'));

const ITEMS = [
  { href: '/owner', label: 'Markazlar', icon: Building2 },
  // traffic of eduvo.uz / mock.eduvo.uz / ERP — platform permission `analytics.read`
  { href: '/owner/analytics', label: 'Analitika', icon: BarChart3, analytics: true },
  { href: '/owner/transactions', label: 'Tranzaksiyalar', icon: ArrowLeftRight },
  { href: '/owner/users', label: 'Foydalanuvchilar', icon: Users },
  { href: '/owner/plans', label: 'Tariflar', icon: BadgeDollarSign },
  { href: '/owner/modules', label: 'Modullar', icon: Boxes },
  { href: '/owner/exams', label: 'Imtihonlar', icon: ClipboardList },
  // mock.eduvo.uz orders / learners / promo — platform permission `mock.manage`
  { href: '/owner/mock', label: 'Mock', icon: GraduationCap, mock: true },
  { href: '/owner/offerta', label: 'Oferta', icon: FileText },
];

/** Owner-panel sidebar: brand, platform nav, logout. Off-canvas drawer on mobile. */
export function OwnerSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { open, setOpen } = useMobileNav();

  return (
    <>
      {open ? (
        <div
          className="fixed inset-0 z-40 bg-black/35 backdrop-blur-[1px] md:hidden"
          onClick={() => setOpen(false)}
          aria-hidden
        />
      ) : null}
      <aside
        className={cn(
          'flex w-[260px] flex-col overflow-y-auto rounded-[28px] bg-background p-[22px_16px] shadow-nm',
          'fixed inset-y-3 left-3 z-50 max-w-[82vw] transition-transform duration-300',
          open ? 'translate-x-0' : '-translate-x-[115%]',
          'md:static md:inset-auto md:left-auto md:h-full md:w-[236px] md:max-w-none md:flex-shrink-0 md:translate-x-0',
        )}
      >
        <div className="mb-6 px-1"><Brand /></div>
        <div className="mb-3.5 px-2.5 text-[10px] font-bold tracking-[1px] text-[#9aa6b8]">PLATFORMA — OWNER</div>
        <nav className="flex flex-col">
          {ITEMS.filter((i) => (!('mock' in i) || canManageMock(user)) && (!('analytics' in i) || canReadAnalytics(user))).map((i) => (
            <NavItemLink key={i.href} href={i.href} label={i.label} icon={i.icon}
              active={pathname === i.href || (i.href !== '/owner' && pathname.startsWith(i.href))}
              onClick={() => setOpen(false)} />
          ))}
        </nav>
        <div className="flex-1" />
        <div className="mb-3 flex justify-end"><ThemeToggle /></div>
        <div className="flex items-center gap-[11px] rounded-[18px] bg-background p-3 shadow-nm-inset-sm">
          <div className="min-w-0 flex-1">
            <div className="truncate text-[13px] font-bold text-foreground">{user?.fullName ?? 'Owner'}</div>
            <div className="text-[11px] font-semibold text-muted">ICAN — Egasi</div>
          </div>
          <button type="button" onClick={logout} aria-label="Chiqish" title="Chiqish"
            className="flex size-8 flex-shrink-0 items-center justify-center rounded-[10px] bg-background text-muted shadow-nm-sm hover:text-danger">
            <LogOut className="size-4" strokeWidth={2} />
          </button>
        </div>
      </aside>
    </>
  );
}
