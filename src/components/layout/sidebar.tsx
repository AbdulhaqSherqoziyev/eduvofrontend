'use client';

import { usePathname } from 'next/navigation';
import { NAV_ITEMS, sectionForPath, type NavSection } from '@/lib/nav/items';
import { NavItemLink } from './nav-item';
import { UserCard } from './user-card';

const SECTION_LABEL: Record<NavSection, string> = {
  asosiy: 'ASOSIY — KUNDALIK ISH',
  boshqaruv: 'BOSHQARUV — SOZLAMALAR',
};

/** Floating neomorphic sidebar; shows the nav for the active top-bar section. */
export function Sidebar() {
  const pathname = usePathname();
  const section = sectionForPath(pathname);
  const items = NAV_ITEMS.filter((i) => i.section === section);

  return (
    <aside className="flex h-full w-[236px] flex-shrink-0 flex-col overflow-y-auto rounded-[28px] bg-background p-[22px_16px] shadow-nm">
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
          />
        ))}
      </nav>
      <div className="flex-1" />
      <UserCard />
    </aside>
  );
}
