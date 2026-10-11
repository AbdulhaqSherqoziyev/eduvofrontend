/**
 * "Tez kunda" families (prod launch 2026-10: only IELTS and SAT run). The centre
 * catalogue carries `families[].comingSoon` from the backend; when the flag is
 * absent (older API, student hub) this list is the fallback.
 */
export const COMING_SOON = ['TOEFL', 'HSK', 'CEFR'] as const;

export const COMING_SOON_LABEL = 'Tez kunda';

export function isComingSoon(family: string | null | undefined, flag?: boolean | null): boolean {
  if (typeof flag === 'boolean') return flag;
  return !!family && (COMING_SOON as readonly string[]).includes(family.toUpperCase());
}
