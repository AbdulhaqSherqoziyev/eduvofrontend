'use client';
/** §3.4 status pills — every colour repeated by an icon and words. */
import { CalendarClock, CalendarX, Check, CircleDot, Clock, PauseCircle } from 'lucide-react';
import { StatusPill } from '@/components/shared/status-pill';
import { activeSummary, type AssignmentPhase } from '@/lib/exam/hub-derive';
import { hm, untilLabel } from '@/lib/exam/hub-format';
import type { HubAssignment } from '@/lib/exam/hub-types';
import { ht } from '@/lib/exam/i18n/hub';
import { useAttemptState } from '@/lib/exam/use-hub';

const I = 'size-3.5';

/** Section the unfinished attempt stopped at ("Tugallanmagan · Reading"). */
export function useStartedSection(a: HubAssignment, phase: AssignmentPhase, now: number): string | null {
  const st = useAttemptState(phase === 'started' ? a.attemptId : null);
  return st.data ? activeSummary(st.data, now).section : null;
}

export function PhasePill({ a, phase, now, section }: { a: HubAssignment; phase: AssignmentPhase; now: number; section?: string | null }) {
  switch (phase) {
    case 'upcoming':
      return <StatusPill tone="muted" icon={<Clock className={I} aria-hidden />} label={ht('hubx.starts_in', { t: untilLabel(Date.parse(a.windowStart) - now) })} />;
    case 'open':
      return <StatusPill tone="success" icon={<CircleDot className={I} aria-hidden />} label={ht('hubx.open_now', { end: hm(a.windowEnd) })} />;
    case 'started':
      return (
        <StatusPill
          tone="warning"
          icon={<PauseCircle className={I} aria-hidden />}
          label={section ? ht('hubx.unfinished_section', { s: section }) : ht('hubx.unfinished')}
        />
      );
    case 'submitted':
      return <StatusPill tone="success" icon={<Check className={I} aria-hidden />} label={ht('hubx.submitted')} />;
    default:
      return <StatusPill tone="muted" icon={<CalendarX className={I} aria-hidden />} label={ht('hubx.window_over')} />;
  }
}

/** Hub strip / ExamCard: "Tayinlangan" or "Tayinlangan: 12.10, 10:00". */
export function AssignedPill({ label }: { label: string }) {
  return <StatusPill tone="primary" icon={<CalendarClock className={I} aria-hidden />} label={label} />;
}
