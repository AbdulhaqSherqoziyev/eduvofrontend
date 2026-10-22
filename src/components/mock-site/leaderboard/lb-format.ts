/**
 * Leaderboard formatting helpers (leaderboard-design.md §13.7: date ranges instead of week numbers).
 * Uzbek is formatted by hand like lib/mock/format.ts (ICU data differs between Node and browsers).
 */
import { numLocale } from '@/i18n/locales';
import type { BadgeAward, LbAverage } from '@/lib/mock/api/types';
import { fmtScore } from '@/lib/mock/format';

const UZ_MONTHS = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr'];

/** "13–19 oktabr" · "Oct 13 – 19" · "13–19 октября" — calendar days in UTC (periods reset at 00:00 UTC) */
export function fmtDayRange(lang: string, startIso: string, endIso: string): string {
  const a = new Date(startIso);
  const b = new Date(endIso);
  if (lang === 'uz') {
    const sm = a.getUTCMonth();
    const em = b.getUTCMonth();
    return sm === em
      ? `${a.getUTCDate()}–${b.getUTCDate()} ${UZ_MONTHS[em]}`
      : `${a.getUTCDate()}-${UZ_MONTHS[sm]} – ${b.getUTCDate()}-${UZ_MONTHS[em]}`;
  }
  const f = new Intl.DateTimeFormat(numLocale(lang), { day: 'numeric', month: lang === 'en' ? 'short' : 'long', timeZone: 'UTC' });
  try { return f.formatRange(a, b); } catch { return `${f.format(a)} – ${f.format(b)}`; }
}

/** "Oktabr 2026" · "October 2026" · "октябрь 2026" */
export function fmtMonthYear(lang: string, year: number, month1: number): string {
  if (lang === 'uz') { const m = UZ_MONTHS[month1 - 1] ?? ''; return `${m.charAt(0).toUpperCase()}${m.slice(1)} ${year}`; }
  return new Intl.DateTimeFormat(numLocale(lang), { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(Date.UTC(year, month1 - 1, 15));
}

/** week champion label "13–19 oktabr" (award dates are YYYY-MM-DD, both inclusive) */
export const awardWeekRange = (lang: string, a: BadgeAward) => fmtDayRange(lang, a.periodStart, a.periodEnd);
/** month champion label "Oktabr 2026" */
export function awardMonth(lang: string, a: BadgeAward) {
  const d = new Date(a.periodStart);
  return fmtMonthYear(lang, d.getUTCFullYear(), d.getUTCMonth() + 1);
}

/** IELTS 7.0 · SAT 1350 (SAT rounded to 10, §1.5) — exact numbers, no hedging */
export const fmtAvg = (a: LbAverage) => (a.value == null ? '' : a.exam === 'sat' ? String(Math.round(a.value / 10) * 10) : fmtScore(a.value, 'ielts'));

export const EXAM_LABEL = { ielts: 'IELTS', sat: 'SAT' } as const;

/** time left until `endsAt`, using the server clock offset taken when the data arrived */
export function remaining(endsAt: string, serverNow: string, receivedAt: number, now = Date.now()) {
  const ms = Math.max(0, Date.parse(endsAt) - (Date.parse(serverNow) + (now - receivedAt)));
  const totalMin = Math.floor(ms / 60_000);
  return { ms, d: Math.floor(totalMin / 1440), h: Math.floor((totalMin % 1440) / 60), m: totalMin % 60 };
}
