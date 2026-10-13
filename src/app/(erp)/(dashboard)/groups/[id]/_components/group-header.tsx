'use client';

import { Clock } from 'lucide-react';
import { NmCard } from '@/components/ui/nm-card';
import { Avatar } from '@/components/ui/avatar';
import { StatusPill } from '@/components/shared/status-pill';
import { Skeleton } from '@/components/shared/skeleton';
import { CircularProgress } from '@/components/ui/circular-progress';
import { useGroup } from '@/lib/hooks/use-groups';
import { GROUP_LEVEL_META } from '@/lib/types/group';
import { formatSom, formatPercent } from '@/lib/utils/format';
import { formatDate } from '@/lib/utils/date';

/** Group summary card — name, level, teacher, schedule, price, attendance ring. */
export function GroupHeader({ id }: { id: string }) {
  const { data: group, isLoading } = useGroup(id);

  if (isLoading || !group) return <Skeleton className="h-[120px]" />;

  const level = GROUP_LEVEL_META[group.level];

  return (
    <NmCard className="flex flex-wrap items-center gap-[26px] p-[24px_26px]">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <span className="text-[23px] font-extrabold text-foreground">{group.name}</span>
          <StatusPill label={level.label} tone={level.tone} />
        </div>
        <div className="text-[13px] font-semibold text-muted">
          {group.subjectName} &middot; {group.studentCount} o&apos;quvchi
          {group.roomName ? <> &middot; {group.roomName}</> : null}
        </div>
        <div className="text-[12px] font-semibold text-[#9aa6b8]">
          Ochilgan: {formatDate(group.createdAt)}
        </div>
      </div>

      <div className="flex items-center gap-[11px] rounded-ctl bg-background px-[14px] py-2.5 shadow-nm-inset-sm">
        <Avatar name={group.teacherName} size={36} tone="primary" />
        <div>
          <div className="text-[13px] font-bold text-foreground">{group.teacherName}</div>
          <div className="text-[11px] font-semibold text-[#9aa6b8]">O&apos;qituvchi</div>
        </div>
      </div>

      <div className="ml-auto flex items-center gap-[22px]">
        <div className="flex items-center gap-2 rounded-ctl bg-background px-[14px] py-2.5 text-[12.5px] font-semibold text-[#5b6b82] shadow-nm-inset-sm">
          <Clock className="h-4 w-4" />
          {group.schedule} &middot; {group.startTime}{group.endTime ? `–${group.endTime}` : ''}
        </div>
        <div className="text-[18px] font-extrabold text-foreground">
          {formatSom(group.price)}
          <span className="text-[12px] font-semibold text-muted"> / oy</span>
        </div>
        <CircularProgress value={group.attendanceRate} size={70}>
          <span className="text-[15px] font-extrabold text-primary">
            {formatPercent(group.attendanceRate)}
          </span>
          <span className="text-[9px] font-bold uppercase tracking-[0.7px] text-muted">Davomat</span>
        </CircularProgress>
      </div>
    </NmCard>
  );
}
