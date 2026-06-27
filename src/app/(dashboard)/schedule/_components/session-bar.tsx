'use client';

import type { ScheduleSession } from '@/lib/types/schedule';

interface SessionBarProps {
  session: ScheduleSession;
}

/** One scheduled lesson: time, group, teacher and room. */
export function SessionBar({ session }: SessionBarProps) {
  const accent = session.color || 'var(--primary)';

  return (
    <div
      className="bg-background shadow-nm-sm rounded-[12px] p-[10px_12px]"
      style={{ borderLeft: `3px solid ${accent}` }}
    >
      <div className="text-[13px] font-extrabold" style={{ color: accent }}>
        {session.time}
      </div>
      <div className="text-[13px] font-bold text-foreground">{session.groupName}</div>
      <div className="text-[12px] text-muted">
        {session.teacherName + ' · ' + session.room + '-xona'}
      </div>
    </div>
  );
}
