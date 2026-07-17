'use client';

import Link from 'next/link';
import { Eye, Trash2 } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { StatusPill } from '@/components/shared/status-pill';
import { Can } from '@/components/shared/can';
import { NmIconButton } from '@/components/ui/nm-icon-button';
import { formatSom } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';
import { RowIndex } from '@/components/shared/row-index';
import { GROUP_LEVEL_META, type Group } from '@/lib/types/group';
import { useDeleteGroup } from '@/lib/hooks/use-groups';
import { EditGroupDialog } from './edit-group-dialog';

const COLS = 'grid min-w-[700px] grid-cols-[40px_2fr_1.4fr_1.3fr_1fr_1.1fr_124px] items-center gap-4';

/** One group table row: name, teacher, schedule, students, price, actions. */
export function ManageGroupRow({ group, n }: { group: Group; n: number }) {
  const remove = useDeleteGroup();
  const meta = GROUP_LEVEL_META[group.level];

  const onDelete = () => {
    if (window.confirm(`${group.name} — o'chirilsinmi?`)) {
      remove.mutate(group.id);
    }
  };

  return (
    <div className={cn(COLS, 'rounded-[16px] px-4 py-[13px] transition-shadow hover:shadow-nm-inset-sm')}>
      <RowIndex n={n} />
      <div className="min-w-0">
        <div className="truncate text-[14px] font-bold text-foreground">{group.name}</div>
        <div className="mt-1">
          <StatusPill label={meta.label} tone={meta.tone} />
        </div>
      </div>
      <div className="flex min-w-0 items-center gap-2.5">
        <Avatar name={group.teacherName} size={30} />
        <span className="truncate text-[13px] font-semibold text-[#5b6b82]">{group.teacherName}</span>
      </div>
      <div className="text-[13px] font-semibold text-[#5b6b82]">
        {group.schedule}
        <span className="text-[#9aa6b8]"> · {group.startTime}</span>
      </div>
      <div className="text-[13px] font-bold text-foreground">{group.studentCount} o&apos;quvchi</div>
      <div className="text-[14px] font-bold text-foreground">{formatSom(group.price)}</div>
      <div className="flex justify-end gap-2">
        <NmIconButton tone="primary" aria-label="Ko'rish" asChild>
          <Link href={`/groups/${group.id}`}>
            <Eye className="size-[15px]" strokeWidth={2} />
          </Link>
        </NmIconButton>
        <Can permission="group.update">
          <EditGroupDialog group={group} />
        </Can>
        <Can permission="group.delete">
          <NmIconButton tone="danger" aria-label="O'chirish" onClick={onDelete} disabled={remove.isPending}>
            <Trash2 className="size-[15px]" strokeWidth={2} />
          </NmIconButton>
        </Can>
      </div>
    </div>
  );
}
