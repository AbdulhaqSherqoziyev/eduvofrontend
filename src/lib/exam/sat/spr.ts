/**
 * Student-produced response (SPR) entry rules — sat.md §3.1 "Kiritish (client)".
 * Grading is server-side (`numeric_rational`); this only keeps the field to
 * what Bluebook lets you type and draws the live Answer Preview.
 */

/** Same grammar the server checks (sat.md §3.1): integer, decimal, or a/b, optional leading minus. */
export const SPR_COMPLETE = /^-?(\d+(\.\d*)?|\.\d+|\d+\/\d+)$/;

/** Why a typed/pasted character was not accepted (drives the soft inline note under the field). */
export type SprReject = 'space' | 'comma' | 'symbol' | 'other';

function rejectKind(ch: string): SprReject {
  if (/\s/.test(ch)) return 'space';
  if (ch === ',') return 'comma';
  if (ch === '%' || ch === '$') return 'symbol';
  return 'other';
}

/**
 * Filter a typed/pasted value: digits, one `.` OR one `/` (never both),
 * `-` only first, max 5 characters (6 when it starts with `-`), and report
 * the first character that was dropped (`rejected`, null when nothing was).
 * Spaces, `%`, `,`, `$` and letters never get in — a mixed number "3 1/2" cannot be typed.
 */
export function sanitizeSprDetailed(raw: string): { value: string; rejected: SprReject | null } {
  let out = '';
  let rejected: SprReject | null = null;
  for (const ch of raw) {
    const neg = out.startsWith('-') || (out === '' && ch === '-');
    if (out.length >= (neg ? 6 : 5)) { rejected ??= rejectKind(ch); continue; }
    if (/[0-9]/.test(ch)) out += ch;
    else if (ch === '-' && out === '') out += ch;
    else if (ch === '.' && !out.includes('.') && !out.includes('/')) out += ch;
    else if (ch === '/' && !out.includes('/') && !out.includes('.') && /[0-9]$/.test(out)) out += ch;
    else rejected ??= rejectKind(ch);
  }
  return { value: out, rejected };
}

/** Filtered value only (see `sanitizeSprDetailed`). */
export function sanitizeSpr(raw: string): string {
  return sanitizeSprDetailed(raw).value;
}

/**
 * One input event (typing or paste): if any character would be dropped, the
 * whole change is refused and the field keeps `prev` — "3 1/2" never turns
 * into 31/2 and "0,5" never into 05. The value is never rewritten for the student.
 */
export function applySprInput(prev: string, raw: string): { value: string; rejected: SprReject | null } {
  const r = sanitizeSprDetailed(raw);
  return r.rejected ? { value: prev, rejected: r.rejected } : r;
}

/** LaTeX for the Answer Preview: `7/2` → \frac{7}{2}; `-1/3` → -\frac{1}{3}; `.5` → .5. */
export function sprLatex(v: string): string | null {
  if (!v) return null;
  const m = /^(-?)(\d*)\/(\d*)$/.exec(v);
  if (m) return `${m[1]}\\dfrac{${m[2] || '\\square'}}{${m[3] || '\\square'}}`;
  return v;
}
