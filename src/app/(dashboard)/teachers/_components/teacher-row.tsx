'use client';

import { Trash2 } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { Can } from '@/components/shared/can';
import { StatusPill } from '@/components/shared/status-pill';
import { NmIconButton } from '@/components/ui/nm-icon-button';
import { formatSom } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';
import { useDeleteTeacher } from '@/lib/hooks/use-teachers';
import { TEACHER_STATUS_META, type Teacher } from '@/lib/types/teacher';
import { EditTeacherDialog } from './edit-teacher-dialog';

const COLS = 'grid grid-cols-[2.4fr_1.3fr_1fr_0.9fr_1.2fr_1fr_92px] items-center gap-4';

/** One teacher table row (avatar, directions, groups, rating, salary, status). */
export function TeacherRow({ teacher }: { teacher: Teacher }) {
  const meta = TEACHER_STATUS_META[teacher.status];
  const remove = useDeleteTeacher();

  const onDelete = () => {
    if (window.confirm(`${teacher.fullName} — o'chirilsinmi?`)) {
      remove.mutate(teacher.id);
    }
  };

  return (
    <div className={cn(COLS, 'rounded-[16px] px-4 py-[13px] transition-shadow hover:shadow-nm-inset-sm')}>
      <div className="flex min-w-0 items-center gap-[13px]">
        <Avatar name={teacher.fullName} size={42} />
        <div className="min-w-0">
          <div className="truncate text-[14px] font-bold text-foreground">{teacher.fullName}</div>
          <div className="text-[12px] font-semibold text-[#9aa6b8]">{teacher.phone}</div>
        </div>
      </div>
      <div className="truncate text-[12.5px] font-semibold text-muted">{teacher.directions}</div>
      <div className="text-[12.5px] font-semibold text-[#5b6b82]">
        {teacher.groupCount} guruh · {teacher.studentCount}
      </div>
      <div className="text-[14px] font-bold text-primary">{teacher.rating}%</div>
      <div className="text-[14px] font-bold text-foreground">{formatSom(teacher.salary)}</div>
      <div>
        <StatusPill label={meta.label} tone={meta.tone} />
      </div>
      <div className="flex justify-end gap-2">
        <Can permission="teacher.update">
          <EditTeacherDialog teacher={teacher} />
        </Can>
        <Can permission="teacher.delete">
          <NmIconButton tone="danger" aria-label="O'chirish" onClick={onDelete} disabled={remove.isPending}>
            <Trash2 className="size-[15px]" strokeWidth={2} />
          </NmIconButton>
        </Can>
      </div>
    </div>
  );
}
