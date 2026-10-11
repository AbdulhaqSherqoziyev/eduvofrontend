import type { Assignment, LiveRow } from '@/lib/api/center-exams';

/** Session phase and its design pill (JONLI / REJADA / YAKUNLANDI). */
export type Phase = 'live' | 'upcoming' | 'past';

export function phaseOf(a: Pick<Assignment, 'windowStart' | 'windowEnd'>, now = Date.now()): Phase {
  if (new Date(a.windowStart).getTime() > now) return 'upcoming';
  if (new Date(a.windowEnd).getTime() < now) return 'past';
  return 'live';
}

export const PHASE_CHIP: Record<Phase, { label: string; fg: string; bg: string }> = {
  live: { label: 'JONLI', fg: '#1F9D6B', bg: 'rgba(31,157,107,0.12)' },
  upcoming: { label: 'REJADA', fg: '#2E6BE6', bg: 'rgba(46,107,230,0.1)' },
  past: { label: 'YAKUNLANDI', fg: '#7A8699', bg: 'rgba(122,134,153,0.12)' },
};

export function countLabel(a: Assignment, phase: Phase): string {
  if (phase === 'live') return `${a.startedCount}/${a.studentCount} boshladi`;
  if (phase === 'past') return `${a.completedCount}/${a.studentCount} tugatdi`;
  return `${a.studentCount} o'quvchi`;
}

/** Live-monitor "BO'LIM" cell for a student who is not mid-section. */
export function liveStatusText(r: LiveRow): string | null {
  switch (r.status) {
    case 'NOT_STARTED': return 'Boshlamagan';
    case 'COMPLETED': return 'Tugatdi';
    case 'EXPIRED': return "Vaqti o'tdi";
    case 'CANCELLED': return 'Bekor qilingan';
    default: return null;
  }
}

/** Last heartbeat older than this while ACTIVE → "aloqa yo'q" hint. */
export const STALE_MS = 90_000;

/** Tooltip on the OGOHLANTIRISH count (live monitor + results). */
export const integrityTitle = (n: number) => `Boshqa oynaga o'tish yoki to'liq ekrandan chiqish: ${n} marta`;
