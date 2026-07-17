'use client';

import Link from 'next/link';
import { QueryBoundary } from '@/components/shared/query-boundary';
import { EmptyState } from '@/components/shared/empty-state';
import { RowsSkeleton } from '@/components/shared/skeleton';
import { Avatar } from '@/components/ui/avatar';
import { RowIndex } from '@/components/shared/row-index';
import { StatusPill } from '@/components/shared/status-pill';
import { useGroupRoster } from '@/lib/hooks/use-groups';
import { STUDENT_STATUS_META } from '@/lib/types/student';
import { formatSom } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';
import { RosterDots } from './roster-dots';

const COLS = 'grid min-w-[700px] grid-cols-[40px_2.2fr_1.5fr_1fr_1.1fr] items-center gap-4';

/** Roster of a group with recent attendance, status and balance. */
export function RosterTable({ groupId }: { groupId: string }) {
  const query = useGroupRoster(groupId);

  return (
    <div>
      <div
        className={cn(COLS, 'px-4 pb-3.5 pt-1 text-[10.5px] font-bold uppercase tracking-[0.8px] text-[#9aa6b8]')}
      >
        <div>#</div>
        <div>O&apos;QUVCHI</div>
        <div>OXIRGI 6 DARS</div>
        <div>HOLAT</div>
        <div>BALANS</div>
      </div>
      <QueryBoundary
        query={query}
        loading={<RowsSkeleton rows={6} />}
        isEmpty={(d) => d.length === 0}
        empty={<EmptyState title="O'quvchi yo'q" hint="Bu guruhda hali o'quvchilar yo'q." />}
      >
        {(rows) => (
          <div>
            {rows.map((r, i) => {
              const meta = STUDENT_STATUS_META[r.status];
              return (
                <div key={r.id} className={cn(COLS, 'rounded-[16px] px-4 py-[13px] hover:shadow-nm-inset-sm')}>
                  <RowIndex n={i + 1} />
                  <Link href={`/students/${r.studentId}`} className="flex min-w-0 items-center gap-[13px]">
                    <Avatar name={r.fullName} size={40} />
                    <span className="truncate text-[14px] font-bold text-foreground hover:text-primary">{r.fullName}</span>
                  </Link>
                  <RosterDots dots={r.recentAttendance} />
                  <div>
                    <StatusPill label={meta.label} tone={meta.tone} />
                  </div>
                  <div
                    className={cn(
                      'text-[14px] font-bold',
                      r.balance === 0 ? 'text-muted' : r.balance < 0 ? 'text-danger' : 'text-success',
                    )}
                  >
                    {r.balance === 0 ? '—' : formatSom(r.balance, { sign: true })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </QueryBoundary>
    </div>
  );
}
