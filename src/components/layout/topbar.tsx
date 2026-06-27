'use client';

import { Bell, Search } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { Brand } from './brand';
import { SectionSwitch } from './section-switch';
import { useAuth } from '@/providers/auth-provider';

/** Sticky top bar: brand, section switch, search, notifications, avatar. */
export function Topbar() {
  const { user } = useAuth();
  return (
    <header className="flex flex-shrink-0 items-center gap-[18px] rounded-[24px] bg-background px-5 py-[13px] shadow-nm">
      <div className="flex-shrink-0">
        <Brand compact />
      </div>
      <div className="h-9 w-[1.5px] flex-shrink-0 bg-[rgba(163,177,198,0.28)]" />
      <SectionSwitch />
      <div className="flex-1" />
      <div className="flex h-11 w-[230px] flex-shrink-0 items-center rounded-[13px] bg-background px-[15px] text-[#9aa6b8] shadow-nm-inset">
        <Search className="size-[18px] flex-shrink-0" strokeWidth={2} />
        <input
          placeholder="Qidirish..."
          className="ml-[11px] w-full border-0 bg-transparent text-[14px] font-medium text-foreground outline-none"
        />
      </div>
      <button
        type="button"
        aria-label="Bildirishnomalar"
        className="relative flex size-11 flex-shrink-0 items-center justify-center rounded-[13px] bg-background text-[#5b6b82] shadow-nm-sm nm-pressable"
      >
        <Bell className="size-5" strokeWidth={2} />
        <span className="absolute right-[11px] top-2.5 size-2 rounded-full border-2 border-background bg-danger" />
      </button>
      <Avatar name={user?.fullName ?? 'U'} size={44} className="rounded-[13px]" />
    </header>
  );
}
