/**
 * Shapes the §1.10 `ai[]` payload into what AiTaskPanel draws (player + hub).
 * `criteria` arrives as `[{name, score, max, note}]` from the grading runner
 * (fake and real providers alike) or, in older rows, as a `{name: band}` map.
 * `feedback` is the runner's `feedbackText()`: summary, then optional
 * "Kuchli tomonlar:" / "Keyingi qadamlar:" blocks with "• " bullets.
 */
export interface CriterionBar { name: string; min: number; max: number; note: string | null }
export interface FeedbackBlocks { summary: string | null; strengths: string[]; nextSteps: string[] }

const num = (v: unknown): number | null => (typeof v === 'number' && Number.isFinite(v) ? v : null);

export function parseCriteria(c: unknown): CriterionBar[] {
  if (!c || typeof c !== 'object') return [];
  if (Array.isArray(c)) {
    return c.flatMap((x) => {
      const o = x as { name?: unknown; score?: unknown; min?: unknown; max?: unknown; note?: unknown } | null;
      if (!o || typeof o.name !== 'string') return [];
      const score = num(o.score);
      const min = num(o.min) ?? score;
      const max = num(o.max);
      // `max` on a criterion row is the scale ceiling (9 / 5), not a range end — a range only comes as {min,max} without `score`
      const hi = score != null ? score : max;
      if (min == null || hi == null) return [];
      return [{ name: o.name, min, max: hi, note: typeof o.note === 'string' && o.note.trim() ? o.note.trim() : null }];
    });
  }
  return Object.entries(c as Record<string, unknown>).flatMap(([name, v]) => {
    if (typeof v === 'number') return [{ name, min: v, max: v, note: null }];
    const o = v as { min?: unknown; max?: unknown; score?: unknown; band?: unknown; note?: unknown; explanation?: unknown } | null;
    if (!o || typeof o !== 'object') return [];
    const note = [o.note, o.explanation].find((s): s is string => typeof s === 'string' && s.trim().length > 0) ?? null;
    const min = num(o.min); const max = num(o.max);
    if (min != null && max != null) return [{ name, min, max, note }];
    const one = num(o.score) ?? num(o.band);
    return one != null ? [{ name, min: one, max: one, note }] : [];
  });
}

const STRENGTHS = /^kuchli tomonlar:?$/i;
const NEXT = /^keyingi qadamlar:?$/i;

export function parseFeedback(s: string | null | undefined): FeedbackBlocks {
  const out: FeedbackBlocks = { summary: null, strengths: [], nextSteps: [] };
  if (!s || !s.trim()) return out;
  let mode: 'summary' | 'strengths' | 'next' = 'summary';
  const summary: string[] = [];
  for (const raw of s.split('\n')) {
    const line = raw.trim();
    if (!line) continue;
    if (STRENGTHS.test(line)) { mode = 'strengths'; continue; }
    if (NEXT.test(line)) { mode = 'next'; continue; }
    const item = line.replace(/^[•\-*]\s*/, '');
    if (mode === 'summary') summary.push(line);
    else if (mode === 'strengths') out.strengths.push(item);
    else out.nextSteps.push(item);
  }
  out.summary = summary.length ? summary.join('\n') : null;
  return out;
}
