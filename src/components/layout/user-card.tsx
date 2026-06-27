'use client';

import Link from 'next/link';
import { LogOut } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { useAuth } from '@/providers/auth-provider';

/** Sidebar footer: current user (links to own profile) + logout. */
export function UserCard() {
  const { user, logout } = useAuth();
  return (
    <div className="flex items-center gap-[11px] rounded-[18px] bg-background p-3 shadow-nm-inset-sm">
      <Link href="/profile" className="flex min-w-0 flex-1 items-center gap-[11px]" title="Mening profilim">
        <Avatar name={user?.fullName ?? 'Foydalanuvchi'} size={40} />
        <div className="min-w-0 flex-1">
          <div className="truncate text-[13px] font-bold text-foreground">{user?.fullName ?? '—'}</div>
          <div className="text-[11px] font-semibold capitalize text-muted">{user?.defaultRole ?? 'Foydalanuvchi'}</div>
        </div>
      </Link>
      <button
        type="button"
        onClick={logout}
        title="Chiqish"
        aria-label="Chiqish"
        className="flex size-8 flex-shrink-0 items-center justify-center rounded-[10px] bg-background text-muted shadow-nm-sm hover:text-danger"
      >
        <LogOut className="size-4" strokeWidth={2} />
      </button>
    </div>
  );
}
