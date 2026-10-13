'use client';

import Link from 'next/link';
import { Calendar } from 'lucide-react';
import type { Group } from '@/lib/types/group';
import { GROUP_LEVEL_META } from '@/lib/types/group';
import { NmCard } from '@/components/ui/nm-card';
import { Avatar } from '@/components/ui/avatar';
import { CircularProgress } from '@/components/ui/circular-progress';
import { StatusPill } from '@/components/shared/status-pill';
import { formatSom } from '@/lib/utils/format';

export function GroupCard({ group: g }: { group: Group }) {
  const meta = GROUP_LEVEL_META[g.level];

  return (
    <Link href={`/groups/${g.id}`}>
      <NmCard className="p-[22px] block transition-transform hover:-translate-y-[3px]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-[17px] font-extrabold tracking-[-0.3px]">{g.name}</div>
            <div className="text-[13px] text-muted">{g.subjectName}</div>
          </div>
          <StatusPill label={meta.label} tone={meta.tone} />
        </div>

        <NmCard inset className="mt-4 flex items-center gap-3 p-3 rounded-[16px]">
          <Avatar name={g.teacherName} size={36} />
          <div>
            <div className="text-[14px] font-bold">{g.teacherName}</div>
            <div className="text-[12px] text-muted">O'qituvchi</div>
          </div>
        </NmCard>

        <div className="mt-4 flex items-end justify-between gap-3">
          <div className="min-w-0">
            <span className="inline-flex items-center gap-1.5 shadow-nm-sm rounded-[11px] px-3 py-1.5 text-primary text-[12px] font-bold">
              <Calendar size={14} />
              {g.schedule}
            </span>
            <div className="mt-2 text-[14px] font-bold">
              {g.startTime} · {formatSom(g.price)}
            </div>
            <div className="text-[12px] text-muted">{g.studentCount} o'quvchi</div>
          </div>
          <CircularProgress value={g.attendanceRate} size={62} />
        </div>
      </NmCard>
    </Link>
  );
}
