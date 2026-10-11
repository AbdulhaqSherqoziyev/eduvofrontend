/** mm:ss, never negative; minutes may exceed 59 ("60:00" for a 1-hour section). */
export function fmtClock(totalSec: number): string {
  const n = Math.max(0, Math.ceil(totalSec));
  const m = Math.floor(n / 60);
  const s = n % 60;
  return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
}

/** IELTS counting: whitespace-separated tokens; hyphenated words and numbers are one word. */
export function countWords(text: string): number {
  const m = text.trim().match(/\S+/g);
  return m ? m.length : 0;
}

export function isAnswered(v: unknown): boolean {
  if (v == null) return false;
  if (typeof v === 'string') return v.trim() !== '';
  if (Array.isArray(v)) return v.length > 0;
  return true;
}

export function parseIso(iso?: string | null): number | null {
  if (!iso) return null;
  const t = Date.parse(iso);
  return Number.isFinite(t) ? t : null;
}

/** "Questions 1–10" style range for a list of numbers. */
export function numRange(nos: number[]): string {
  if (!nos.length) return '';
  const a = Math.min(...nos);
  const b = Math.max(...nos);
  return a === b ? String(a) : `${a}–${b}`;
}

/** m:ss (strip / Sevara texts "Audio starts in 0:20"). */
export function fmtMSS(totalSec: number): string {
  const n = Math.max(0, Math.ceil(totalSec));
  return `${Math.floor(n / 60)}:${String(n % 60).padStart(2, '0')}`;
}
