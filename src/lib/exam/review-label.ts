import type { ReviewRow } from './types';

/**
 * "Correct answer" chip text for a review row: every accepted key, not just the
 * first one (SAT SPR accepts "1/2" and "0.5" → "1/2 / 0.5"), and the option text
 * when the row carries it (contract §1b `correctText`, optional) → "B — 4x + 1".
 */
/** Row number as shown in the review: "M1·4" for a SAT module stage (`rw_m1` → M1), plain `no` elsewhere. */
export function rowNo(r: Pick<ReviewRow, 'no' | 'stageKey'>): string {
  const m = /_m(\d+)$/.exec(r.stageKey ?? '');
  return m ? `M${m[1]}·${r.no}` : String(r.no);
}

export function correctLabel(r: Pick<ReviewRow, 'correct' | 'correctText'>): string {
  const keys = r.correct ?? [];
  const texts = r.correctText ?? [];
  return keys.map((k, i) => (texts[i] ? `${k} — ${texts[i]}` : k)).join(' / ');
}
