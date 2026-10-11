/**
 * Student-produced response (SPR) entry rules — sat.md §3.1 "Kiritish (client)".
 * Grading is server-side (`numeric_rational`); this only keeps the field to
 * what Bluebook lets you type and draws the live Answer Preview.
 */

/** Same grammar the server checks (sat.md §3.1): integer, decimal, or a/b, optional leading minus. */
export const SPR_COMPLETE = /^-?(\d+(\.\d*)?|\.\d+|\d+\/\d+)$/;

/**
 * Filter a typed/pasted value: digits, one `.` OR one `/` (never both),
 * `-` only first, max 5 characters (6 when it starts with `-`). Spaces,
 * `%`, `,`, `$` and letters are dropped — a mixed number "3 1/2" cannot be typed.
 */
export function sanitizeSpr(raw: string): string {
  let out = '';
  for (const ch of raw) {
    const neg = out.startsWith('-') || (out === '' && ch === '-');
    if (out.length >= (neg ? 6 : 5)) break;
    if (/[0-9]/.test(ch)) out += ch;
    else if (ch === '-' && out === '') out += ch;
    else if (ch === '.' && !out.includes('.') && !out.includes('/')) out += ch;
    else if (ch === '/' && !out.includes('/') && !out.includes('.') && /[0-9]$/.test(out)) out += ch;
  }
  return out;
}

/** LaTeX for the Answer Preview: `7/2` → \frac{7}{2}; `-1/3` → -\frac{1}{3}; `.5` → .5. */
export function sprLatex(v: string): string | null {
  if (!v) return null;
  const m = /^(-?)(\d*)\/(\d*)$/.exec(v);
  if (m) return `${m[1]}\\dfrac{${m[2] || '\\square'}}{${m[3] || '\\square'}}`;
  return v;
}
