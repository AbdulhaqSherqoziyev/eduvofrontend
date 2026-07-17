'use client';

import { usePathname } from 'next/navigation';
import { sectionForPath, visibleNavItems, type NavSection } from '@/lib/nav/items';
import { useTenantFlags } from '@/lib/hooks/use-tenant-settings';
import { NavItemLink } from './nav-item';
import { UserCard } from './user-card';
import { SectionSwitch } from './section-switch';
import { useMobileNav } from './mobile-nav';
import { cn } from '@/lib/utils/cn';

const SECTION_LABEL: Record<NavSection, string> = {
  asosiy: 'ASOSIY — KUNDALIK ISH',
  boshqaruv: 'BOSHQARUV — SOZLAMALAR',
};

/** Floating neomorphic sidebar; an off-canvas drawer on mobile. */
export function Sidebar() {
  const pathname = usePathname();
  const section = sectionForPath(pathname);
  const { teacherOnlyMode } = useTenantFlags();
  const items = visibleNavItems(section, teacherOnlyMode);
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
          // mobile: fixed off-canvas drawer
          'fixed inset-y-3 left-3 z-50 max-w-[82vw] transition-transform duration-300',
          open ? 'translate-x-0' : '-translate-x-[115%]',
          // desktop: static column
          'md:static md:inset-auto md:left-auto md:m-0 md:h-full md:w-[236px] md:max-w-none md:flex-shrink-0 md:translate-x-0',
        )}
      >
        <div className="mb-4 md:hidden">
          <SectionSwitch />
        </div>
        <div className="mb-3.5 px-2.5 text-[10px] font-bold leading-[1.5] tracking-[1px] text-[#9aa6b8]">
          {SECTION_LABEL[section]}
        </div>
        <nav className="flex flex-col">
          {items.map((item) => (
            <NavItemLink
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
              active={pathname === item.href || pathname.startsWith(`${item.href}/`)}
              onClick={() => setOpen(false)}
            />
          ))}
        </nav>
        <div className="flex-1" />
        <UserCard />
      </aside>
    </>
  );
}
