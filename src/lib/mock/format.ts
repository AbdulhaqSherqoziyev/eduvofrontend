/**
 * Number, money and date formatting for the mock site.
 * - Digits are always Latin (`-u-nu-latn`, addendum §1.4).
 * - Money follows README "Price table": `79 000 UZS` (space thousands, same in every language), `$6.99`, `€6.49`.
 * - Callers wrap the result in <bdi dir="ltr"> on RTL pages.
 */
import { numLocale } from '@/i18n/locales';
import type { Currency, Money, PriceSet } from './api/types';

const EXP: Record<Currency, number> = { UZS: 0, USD: 2, EUR: 2 };

function groupSpace(n: number): string {
  return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

/** amountMinor → display string. */
export function fmtMoney(m: Money): string {
  const major = m.amountMinor / 10 ** EXP[m.currency];
  if (m.currency === 'UZS') return `${groupSpace(major)} UZS`;
  const v = major.toFixed(2);
  return m.currency === 'USD' ? `$${v}` : `€${v}`;
}
export const fmtPrice = (p: PriceSet, currency: Currency) => fmtMoney({ currency, amountMinor: p[currency] });
/** `79 000` + small `UZS` split (landing pricing teaser draws the code smaller). */
export function moneyParts(m: Money): { amount: string; unit: string | null } {
  if (m.currency !== 'UZS') return { amount: fmtMoney(m), unit: null };
  return { amount: groupSpace(m.amountMinor), unit: 'UZS' };
}

/** IELTS bands keep one decimal (6.0, 6.5); SAT and counts are integers. */
export function fmtScore(v: number | null | undefined, exam: 'ielts' | 'sat' | string): string {
  if (v === null || v === undefined || Number.isNaN(v)) return '—';
  return exam === 'ielts' ? v.toFixed(1) : String(Math.round(v));
}

export function fmtInt(lang: string, n: number) {
  return new Intl.NumberFormat(numLocale(lang)).format(n);
}

/*
 * Uzbek (Latin) is formatted by hand: ICU data differs between Node and browsers ("15 oktabr" vs
 * "15-oktabr" vs "oktabr 15"), which also broke hydration (React #425) on /uz pages.
 * Literary norm: "15-oktabr, 2026", "15-oktabr", "17-oktabr 01:32".
 */
const UZ_MONTHS = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr'];
const UZ_SHORT = ['yan', 'fev', 'mar', 'apr', 'may', 'iyn', 'iyl', 'avg', 'sen', 'okt', 'noy', 'dek'];
/** day / month / year / hh:mm of an ISO value — calendar days in UTC, timestamps in the viewer's zone */
function parts(iso: string) {
  const d = new Date(dayIso(iso));
  const utc = isDay(iso);
  return {
    day: utc ? d.getUTCDate() : d.getDate(), month: utc ? d.getUTCMonth() : d.getMonth(), year: utc ? d.getUTCFullYear() : d.getFullYear(),
    hm: `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`,
  };
}
const isUz = (lang: string) => lang === 'uz';

/** "12 October 2026" · uz "12-oktabr, 2026" */
export function fmtDateLong(lang: string, iso: string) {
  if (isUz(lang)) { const p = parts(iso); return `${p.day}-${UZ_MONTHS[p.month]}, ${p.year}`; }
  return new Intl.DateTimeFormat(numLocale(lang), { day: 'numeric', month: 'long', year: 'numeric', ...tz(iso) }).format(new Date(dayIso(iso)));
}
/** "12 Oct 2026" · uz "12-okt, 2026" */
export function fmtDate(lang: string, iso: string) {
  if (isUz(lang)) { const p = parts(iso); return `${p.day}-${UZ_SHORT[p.month]}, ${p.year}`; }
  return new Intl.DateTimeFormat(numLocale(lang), { day: 'numeric', month: 'short', year: 'numeric', ...tz(iso) }).format(new Date(dayIso(iso)));
}
/** "12 Oct" · uz "12-okt" */
export function fmtDayMonth(lang: string, iso: string) {
  if (isUz(lang)) { const p = parts(iso); return `${p.day}-${UZ_SHORT[p.month]}`; }
  return new Intl.DateTimeFormat(numLocale(lang), { day: 'numeric', month: 'short', ...tz(iso) }).format(new Date(dayIso(iso)));
}
/** "12 October" · uz "12-oktabr" */
export function fmtDayMonthLong(lang: string, iso: string) {
  if (isUz(lang)) { const p = parts(iso); return `${p.day}-${UZ_MONTHS[p.month]}`; }
  return new Intl.DateTimeFormat(numLocale(lang), { day: 'numeric', month: 'long', ...tz(iso) }).format(new Date(dayIso(iso)));
}
/** "Oct" (chart axis) · uz "okt" */
export function fmtMonthShort(lang: string, iso: string) {
  if (isUz(lang)) return UZ_SHORT[parts(iso).month];
  return new Intl.DateTimeFormat(numLocale(lang), { month: 'short', ...tz(iso) }).format(new Date(dayIso(iso)));
}
/** "15 Oct 2026, 14:30" in the viewer's time zone · uz "15-oktabr 14:30" */
export function fmtDateTime(lang: string, iso: string) {
  if (isUz(lang)) { const p = parts(iso); return `${p.day}-${UZ_MONTHS[p.month]} ${p.hm}`; }
  return new Intl.DateTimeFormat(numLocale(lang), { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(iso));
}
/** "14:02" */
export function fmtTime(lang: string, d: Date) {
  if (isUz(lang)) return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  return new Intl.DateTimeFormat(numLocale(lang), { hour: '2-digit', minute: '2-digit' }).format(d);
}
/** `YYYY-MM-DD` (calendar day) stays that day in UTC formatting; full ISO timestamps pass through. */
const isDay = (iso: string) => /^\d{4}-\d{2}-\d{2}$/.test(iso);
/** calendar days are formatted in UTC (no shift); timestamps in the viewer's zone */
const tz = (iso: string): { timeZone?: string } => (isDay(iso) ? { timeZone: 'UTC' } : {});
function dayIso(iso: string) {
  return isDay(iso) ? `${iso}T12:00:00Z` : iso;
}
