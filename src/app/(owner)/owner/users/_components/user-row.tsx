'use client';

import { Eye } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { NmIconButton } from '@/components/ui/nm-icon-button';
import { cn } from '@/lib/utils/cn';
import { ownerApi } from '@/lib/api/owner';
import { startImpersonation } from '@/lib/auth/impersonation';
import type { OwnerUser } from '@/lib/types/owner-users';
import { UserDialog } from './user-dialog';

export const USER_COLS = 'grid grid-cols-[2fr_1.4fr_1.5fr_100px] items-center gap-4';

/** One cross-tenant user row — identity, center/role, role chips, login-as + edit. */
export function UserRow({ user }: { user: OwnerUser }) {
  const onImpersonate = async () => startImpersonation(await ownerApi.impersonateUser(user.id));

  return (
    <div className={cn(USER_COLS, 'rounded-[16px] px-4 py-[13px] transition-shadow hover:shadow-nm-inset-sm')}>
      <div className="flex min-w-0 items-center gap-[13px]">
        <Avatar name={user.fullName} size={42} />
        <div className="min-w-0">
          <div className="truncate text-[14px] font-bold text-foreground">{user.fullName}</div>
          <div className="text-[12px] font-semibold text-[#9aa6b8]">{user.phone}</div>
        </div>
      </div>
      <div className="min-w-0">
        <div className="truncate text-[13px] font-bold text-foreground">{user.centerName}</div>
        <div className="truncate text-[12px] font-semibold text-muted">{user.defaultRole || '—'}</div>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {user.roles.length ? user.roles.map((r) => (
          <span key={r.id} className="rounded-full bg-background px-2.5 py-1 text-[11px] font-bold text-[#5b6b82] shadow-nm-inset-sm">{r.name}</span>
        )) : <span className="text-[12.5px] text-[#9aa6b8]">—</span>}
      </div>
      <div className="flex justify-end gap-2">
        {user.archived ? null : (
          <NmIconButton aria-label="Kirish (login as)" onClick={onImpersonate}>
            <Eye className="size-[15px]" strokeWidth={2} />
          </NmIconButton>
        )}
        <UserDialog user={user} />
      </div>
    </div>
  );
}
