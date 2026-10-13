'use client';

import { NmCard } from '@/components/ui/nm-card';
import type { ScheduleSession } from '@/lib/types/schedule';
import { SessionBar } from './session-bar';

interface DayColumnProps {
  label: string;
  sessions: ScheduleSession[];
}

/** A single weekday column listing its sorted session bars. */
export function DayColumn({ label, sessions }: DayColumnProps) {
  return (
    <NmCard className="p-[16px_13px]">
      <div className="pb-2.5 mb-2.5 text-center text-[14px] font-extrabold tracking-[-0.3px] border-b border-black/5">
        {label}
      </div>
      <div className="flex flex-col gap-2.5">
        {sessions.length === 0 ? (
          <p className="py-3 text-center text-[12px] font-semibold text-[#c2cad6]">Dars yo‘q</p>
        ) : (
          sessions.map((session) => <SessionBar key={session.id} session={session} />)
        )}
      </div>
    </NmCard>
  );
}
