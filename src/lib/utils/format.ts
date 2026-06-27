/** Money/number formatting for the UZ locale (space thousands separator). */

/** "450000" -> "450 000" (always rounded, absolute value). */
export function formatNumber(value: number): string {
  return String(Math.abs(Math.round(value))).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

/** Format a som amount, e.g. 450000 -> "450 000 so'm". */
export function formatSom(value: number, opts: { sign?: boolean } = {}): string {
  const base = `${formatNumber(value)} so'm`;
  if (!opts.sign || value === 0) return base;
  return `${value > 0 ? '+ ' : '− '}${base}`;
}

/** Large amounts as millions, e.g. 48700000 -> "48,7 mln so'm". */
export function formatMln(value: number): string {
  const mln = Math.round((value / 1_000_000) * 10) / 10;
  return `${String(mln).replace('.', ',')} mln so'm`;
}

/** Clamp and round a percentage to an integer string, e.g. 0.923 -> "92%". */
export function formatPercent(value: number, isRatio = false): string {
  const pct = isRatio ? value * 100 : value;
  return `${Math.round(pct)}%`;
}
