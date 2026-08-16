/**
 * Sum in words — the cash desk's cheapest guard against the one costly typo.
 *
 * "350 000" and "3 500 000" look almost the same for half a second; written
 * out they cannot be confused. Shown under every amount field and repeated on
 * the confirmation step (spec §B.2).
 */

const UNITS = ['', 'bir', 'ikki', 'uch', "to'rt", 'besh', 'olti', 'yetti', 'sakkiz', "to'qqiz"];
const TENS = ['', "o'n", 'yigirma', "o'ttiz", 'qirq', 'ellik', 'oltmish', 'yetmish', 'sakson', "to'qson"];
/** Group names from the largest down; '' is the bare units group. */
const GROUPS = ['milliard', 'million', 'ming', ''];

const MAX = 999_999_999_999;

/** 0–999 in words ("besh yuz o'ttiz"). Empty for 0. */
function tri(n: number): string {
  const out: string[] = [];
  const h = Math.floor(n / 100);
  // "yuz", not "bir yuz" — nobody says the second one out loud.
  if (h === 1) out.push('yuz');
  else if (h > 1) out.push(`${UNITS[h]} yuz`);
  const t = Math.floor((n % 100) / 10);
  if (t > 0) out.push(TENS[t]);
  const u = n % 10;
  if (u > 0) out.push(UNITS[u]);
  return out.join(' ');
}

/**
 * 3_500_000 -> "uch million besh yuz ming". Returns '' for 0, for anything
 * unreadable (negative, not finite) and above a trillion — there the digits
 * alone are clearer than a sentence nobody would read.
 */
export function somToWords(value: number): string {
  const n = Math.floor(Math.abs(value));
  if (!Number.isFinite(n) || n === 0 || n > MAX) return '';

  const digits = String(n).padStart(GROUPS.length * 3, '0');
  const out: string[] = [];
  GROUPS.forEach((group, i) => {
    const part = Number(digits.slice(i * 3, i * 3 + 3));
    if (part === 0) return;
    // "ming", but "bir million" — the thousands group drops its leading one.
    const words = part === 1 && group === 'ming' ? '' : tri(part);
    out.push([words, group].filter(Boolean).join(' '));
  });
  return out.join(' ');
}
