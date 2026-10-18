/** Attempt labels shared by Attempts, Learner profile, Tickets. */
import type { AttemptStatus } from '@/lib/admin-mock/types';
import type { Tone } from '../ui/chip';

export const ATTEMPT_STATUS: Record<AttemptStatus, { t: string; tone: Tone }> = {
  in_progress: { t: 'Davom etmoqda', tone: 'warn' },
  grading: { t: 'AI baholamoqda', tone: 'ai' },
  completed: { t: 'Yakunlandi', tone: 'ok' },
  expired: { t: "Muddati o'tdi", tone: 'neutral' },
  ai_failed: { t: 'AI xatosi', tone: 'err' },
  cancelled: { t: 'Bekor qilingan', tone: 'neutral' },
};
export const attemptStatus = (s: string) => ATTEMPT_STATUS[s as AttemptStatus] ?? { t: s, tone: 'neutral' as Tone };

export const SECTION_LABEL: Record<string, string> = {
  listening: 'Listening', reading: 'Reading', writing: 'Writing', speaking: 'Speaking', math: 'Math', rw: 'R&W', reading_writing: 'R&W',
};
export const sectionLabel = (k: string | null | undefined) => (k ? SECTION_LABEL[k] ?? k : '');
