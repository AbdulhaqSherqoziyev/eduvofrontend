/** Pure derivations for the hub screens (no React, no fetching). */
import type { DetailAttempt, HubAssignment, ProgressAttempt } from './hub-types';
import { mmss } from './hub-format';
import type { AttemptState, ReviewRow } from './types';

export type AssignmentPhase = 'upcoming' | 'open' | 'started' | 'submitted' | 'closed';

/** §3.4 table: the attempt decides first, then the window (server time). */
export function assignmentPhase(a: HubAssignment, now: number): AssignmentPhase {
  if (a.attemptStatus === 'COMPLETED' || a.attemptStatus === 'EXPIRED') return 'submitted';
  if (a.attemptStatus === 'ACTIVE') return 'started';
  if (now < Date.parse(a.windowStart)) return 'upcoming';
  if (now <= Date.parse(a.windowEnd)) return 'open';
  return 'closed';
}

/** Hub strips: what still matters (submitted/closed ones older than the window stay on detail only). */
export const liveAssignments = (list: HubAssignment[], now: number) =>
  list.filter((a) => ['upcoming', 'open', 'started'].includes(assignmentPhase(a, now)));

/** Each section's own best across completed attempts (no overall in v1). */
export function bestBySection(attempts: Pick<ProgressAttempt, 'sections'>[]): Record<string, number | null> {
  const out: Record<string, number | null> = {};
  for (const a of attempts) {
    for (const [k, v] of Object.entries(a.sections)) {
      if (v == null) continue;
      out[k] = out[k] == null ? v : Math.max(out[k]!, v);
    }
  }
  return out;
}

/** Detail attempts table status (§3.5). `O'qituvchi tekshirmoqda` needs per-section status the summary does not carry. */
export type AttemptRowState = 'ready' | 'grading' | 'unfinished';
export function attemptRowState(a: DetailAttempt): AttemptRowState {
  if (a.status === 'ACTIVE') return 'unfinished';
  const vals = Object.entries(a.resultSummary?.sections ?? {}).filter(([k]) => k !== 'speaking');
  return vals.some(([, v]) => v == null) ? 'grading' : 'ready';
}

const TYPE_LABELS: Record<string, string> = {
  gap_fill: 'Gap fill',
  short_answer: 'Short answer',
  mcq_single: 'Multiple choice',
  spr_numeric: 'Student-produced response',
  mcq_multi: 'Multiple choice (two answers)',
  tfng: 'True / False / Not given',
  ynng: 'Yes / No / Not given',
  matching_headings: 'Matching headings',
  matching_information: 'Matching information',
  matching_features: 'Matching features',
  map_labelling: 'Map labelling',
};

/** Question-type names stay English (exam terminology, T43). */
export const typeLabel = (t: string) =>
  TYPE_LABELS[t] ?? t.replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase());

export interface TypeStat { type: string; correct: number; total: number }

/** Weakest question types first; only types with enough questions to mean something. */
export function weakTypes(rows: ReviewRow[], minTotal: number, limit: number): TypeStat[] {
  const by = new Map<string, TypeStat>();
  for (const r of rows) {
    const s = by.get(r.type) ?? { type: r.type, correct: 0, total: 0 };
    s.total += 1;
    if (r.isCorrect) s.correct += 1;
    by.set(r.type, s);
  }
  return [...by.values()]
    .filter((s) => s.total >= minTotal && s.correct < s.total)
    .sort((a, b) => a.correct / a.total - b.correct / b.total)
    .slice(0, limit);
}

/** CEFR distance (Sevara): below the certificate floor the target is always B1 — A1/A2 never appear. */
export function cefrTarget(scaled: number, next: { level: string; min: number } | null, cert: { level: string; min: number } | null) {
  if (cert && scaled < cert.min) return cert;
  if (next && !/^A[12]$/i.test(next.level)) return next;
  return null;
}

/** "Reading" + "41:12" for "Sizda tugallanmagan urinish bor: Reading, 41:12 qoldi." */
export function activeSummary(st: AttemptState, now: number): { section: string; left: string } {
  const open = st.stages.find((s) => s.status === 'IN_PROGRESS') ?? st.stages.find((s) => s.status === 'PENDING');
  const sec = st.config.sections.find((s) => s.key === open?.sectionKey);
  const title = sec?.title ?? open?.sectionKey ?? '';
  if (open?.deadlineAt) return { section: title, left: mmss(Date.parse(open.deadlineAt) - now) };
  const d = sec?.brief?.durationSec;
  return { section: title, left: d ? mmss(d * 1000) : '—' };
}
