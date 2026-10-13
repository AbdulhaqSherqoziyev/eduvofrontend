"use client";

import type { ScheduleSession } from "@/lib/types/schedule";

/** One scheduled lesson: time range, group, teacher, room + extra badge. */
export function SessionBar({ session }: { session: ScheduleSession }) {
  const accent = session.color || "var(--primary)";
  return (
    <div className="bg-background shadow-nm-sm rounded-[12px] p-[10px_12px]" style={{ borderLeft: `3px solid ${accent}` }}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-[13px] font-extrabold" style={{ color: accent }}>
          {session.startTime}{session.endTime ? `–${session.endTime}` : ""}
        </span>
        {session.isExtra ? (
          <span className="rounded-[6px] bg-background px-1.5 py-0.5 text-[10px] font-bold text-warning shadow-nm-inset-sm">
            QO‘SHIMCHA
          </span>
        ) : null}
      </div>
      <div className="text-[13px] font-bold text-foreground">{session.groupName}</div>
      <div className="text-[12px] text-muted">
        {[session.teacherName, session.room].filter(Boolean).join(" · ")}
      </div>
      {session.isExtra && session.date ? (
        <div className="text-[11px] font-semibold text-[#9aa6b8]">{session.date}</div>
      ) : null}
    </div>
  );
}
