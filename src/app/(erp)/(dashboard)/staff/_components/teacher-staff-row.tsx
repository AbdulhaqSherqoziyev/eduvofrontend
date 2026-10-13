'use client';

import { Trash2 } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { Can } from '@/components/shared/can';
import { NmIconButton } from '@/components/ui/nm-icon-button';
import { RowIndex } from '@/components/shared/row-index';
import { cn } from '@/lib/utils/cn';
import { useDeleteTeacher } from '@/lib/hooks/use-teachers';
import type { Teacher } from '@/lib/types/teacher';
import { EditTeacherDialog } from '../../teachers/_components/edit-teacher-dialog';
import { STAFF_COLS } from './staff-row';

/** A teacher shown inside the Xodimlar table — position fixed to "O'qituvchi",
 *  no roles; edit/delete route to the teacher endpoints. */
export function TeacherStaffRow({ teacher, n }: { teacher: Teacher; n: number }) {
  const remove = useDeleteTeacher();
  const onDelete = () => {
    if (window.confirm(`${teacher.fullName} — o'chirilsinmi?`)) remove.mutate(teacher.id);
  };

  return (
    <div className={cn(STAFF_COLS, 'rounded-[16px] px-4 py-[13px] transition-shadow hover:shadow-nm-inset-sm')}>
      <RowIndex n={n} />
      <div className="flex min-w-0 items-center gap-[13px]">
        <Avatar name={teacher.fullName} size={42} />
        <div className="min-w-0">
          <div className="truncate text-[14px] font-bold text-foreground">{teacher.fullName}</div>
          <div className="text-[12px] font-semibold text-[#9aa6b8]">{teacher.phone}</div>
        </div>
      </div>
      <div className="truncate text-[12.5px] font-semibold text-muted">O&apos;qituvchi</div>
      <div><span className="text-[12.5px] text-[#9aa6b8]">—</span></div>
      <div className="flex justify-end gap-2">
        <Can permission="teacher.update"><EditTeacherDialog teacher={teacher} /></Can>
        <Can permission="teacher.delete">
          <NmIconButton tone="danger" aria-label="O'chirish" onClick={onDelete} disabled={remove.isPending}>
            <Trash2 className="size-[15px]" strokeWidth={2} />
          </NmIconButton>
        </Can>
      </div>
    </div>
  );
}
