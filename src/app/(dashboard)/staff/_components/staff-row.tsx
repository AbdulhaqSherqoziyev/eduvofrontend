'use client';

import { Trash2 } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { Can } from '@/components/shared/can';
import { NmIconButton } from '@/components/ui/nm-icon-button';
import { cn } from '@/lib/utils/cn';
import { useDeleteUser } from '@/lib/hooks/use-users';
import type { Staff } from '@/lib/types/user';
import { EditStaffDialog } from './edit-staff-dialog';

export const STAFF_COLS = 'grid grid-cols-[2.2fr_1.3fr_1.7fr_92px] items-center gap-4';

/** One staff row — avatar, position, role chips, edit + delete. */
export function StaffRow({ staff }: { staff: Staff }) {
  const remove = useDeleteUser();
  const onDelete = () => {
    if (window.confirm(`${staff.fullName} — o'chirilsinmi?`)) remove.mutate(staff.id);
  };

  return (
    <div className={cn(STAFF_COLS, 'rounded-[16px] px-4 py-[13px] transition-shadow hover:shadow-nm-inset-sm')}>
      <div className="flex min-w-0 items-center gap-[13px]">
        <Avatar name={staff.fullName} size={42} />
        <div className="min-w-0">
          <div className="truncate text-[14px] font-bold text-foreground">{staff.fullName}</div>
          <div className="text-[12px] font-semibold text-[#9aa6b8]">{staff.phone}</div>
        </div>
      </div>
      <div className="truncate text-[12.5px] font-semibold text-muted">{staff.defaultRole || '—'}</div>
      <div className="flex flex-wrap gap-1.5">
        {staff.roles.length ? (
          staff.roles.map((r) => (
            <span key={r.id} className="rounded-full bg-background px-2.5 py-1 text-[11px] font-bold text-[#5b6b82] shadow-nm-inset-sm">
              {r.name}
            </span>
          ))
        ) : (
          <span className="text-[12.5px] text-[#9aa6b8]">—</span>
        )}
      </div>
      <div className="flex justify-end gap-2">
        <Can permission="user.update"><EditStaffDialog staff={staff} /></Can>
        <Can permission="user.delete">
          <NmIconButton tone="danger" aria-label="O'chirish" onClick={onDelete}
            disabled={remove.isPending || staff.isSuperAdmin}>
            <Trash2 className="size-[15px]" strokeWidth={2} />
          </NmIconButton>
        </Can>
      </div>
    </div>
  );
}
