'use client';

import { usePathname } from 'next/navigation';
import { Search, Menu } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { Brand } from './brand';
import { SectionSwitch } from './section-switch';
import { BalanceBadge } from './balance-badge';
import { NotificationsBell } from './notifications-bell';
import { ThemeToggle } from './theme-toggle';
import { useMobileNav } from './mobile-nav';
import { useAuth } from '@/providers/auth-provider';
import { sectionForPath } from '@/lib/nav/items';
import { ExamCreditsPill } from '@/components/exams-center/nav-extras';

/** Sticky top bar: hamburger (mobile), brand, section switch, search, balance / exam credits, avatar. */
export function Topbar() {
  const { user } = useAuth();
  const { setOpen } = useMobileNav();
  // Design v3: inside Imtihonlar the header shows the mock-exam credit pill.
  const exams = sectionForPath(usePathname()) === 'imtihonlar';
  return (
    <header className="flex flex-shrink-0 items-center gap-3 rounded-[24px] bg-background px-3.5 py-[11px] shadow-nm md:gap-[18px] md:px-5 md:py-[13px]">
      <button
        type="button"
        aria-label="Menyu"
        onClick={() => setOpen(true)}
        className="flex size-10 flex-shrink-0 items-center justify-center rounded-[12px] bg-background text-foreground shadow-nm-sm nm-pressable md:hidden"
      >
        <Menu className="size-5" strokeWidth={2} />
      </button>
      <div className="flex-shrink-0">
        <Brand compact />
      </div>
      <div className="hidden h-9 w-[1.5px] flex-shrink-0 bg-[rgba(163,177,198,0.28)] md:block" />
      <div className="hidden md:block">
        <SectionSwitch />
      </div>
      <div className="flex-1" />
      <div className="hidden h-11 w-[230px] flex-shrink-0 items-center rounded-[13px] bg-background px-[15px] text-[#9aa6b8] shadow-nm-inset lg:flex">
        <Search className="size-[18px] flex-shrink-0" strokeWidth={2} />
        <input
          placeholder="Qidirish..."
          className="ml-[11px] w-full border-0 bg-transparent text-[14px] font-medium text-foreground outline-none"
        />
      </div>
      {exams ? <ExamCreditsPill /> : <BalanceBadge />}
      <ThemeToggle />
      <NotificationsBell />
      <Avatar name={user?.fullName ?? 'U'} size={44} className="flex-shrink-0 rounded-[13px]" />
    </header>
  );
}
