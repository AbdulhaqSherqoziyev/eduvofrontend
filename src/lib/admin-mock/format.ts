/**
 * Formatting for the admin panel, in the design's style: "395 000 so'm", "$6.99", "€5.99",
 * "18 okt, 14:02", "6 daq oldin", "2 s 41 daq". Calendar = Asia/Tashkent (contract §0.5).
 */
import type { Money } from './types';

const TZ = 'Asia/Tashkent';
export const MONTHS = ['yan', 'fev', 'mar', 'apr', 'may', 'iyn', 'iyl', 'avg', 'sen', 'okt', 'noy', 'dek'];
const EXP: Record<string, number> = { UZS: 0, USD: 2, EUR: 2 };

/** thousands with a thin space-like normal space (design: "14 870 000") */
export function groupNum(n: number, decimals = 0) {
  const neg = n < 0;
  const [i, f] = Math.abs(n).toFixed(decimals).split('.');
  const g = i.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return `${neg ? '−' : ''}${g}${f ? `.${f}` : ''}`;
}

export function money(m: Money | null | undefined): string {
  if (!m) return '—';
  const exp = EXP[m.currency] ?? 2;
  const v = m.amountMinor / 10 ** exp;
  if (m.currency === 'UZS') return `${groupNum(v)} so'm`;
  const sym = m.currency === 'USD' ? '$' : m.currency === 'EUR' ? '€' : `${m.currency} `;
  return `${v < 0 ? '−' : ''}${sym}${groupNum(Math.abs(v), 2)}`;
}

/** amountMinor in a currency → money string */
export const amount = (currency: string, amountMinor: number | null | undefined) =>
  amountMinor === null || amountMinor === undefined ? '—' : money({ currency, amountMinor });

/** Major-unit value for inputs: UZS 395000, USD 6.99 */
export const toMajor = (currency: string, minor: number) => minor / 10 ** (EXP[currency] ?? 2);
/** "395 000" / "6.99" / "6,99" → minor units; null when not a number */
export function toMinor(currency: string, input: string): number | null {
  const s = input.replace(/[\s ]/g, '').replace(',', '.');
  if (!/^\d+(\.\d{0,2})?$/.test(s)) return null;
  const exp = EXP[currency] ?? 2;
  if (exp === 0 && s.includes('.')) return null;
  return Math.round(parseFloat(s) * 10 ** exp);
}

/** "14 870 000 so'm + $186.40" — several currencies joined */
export const moneyList = (ms: Money[] | null | undefined, sep = ' + ') => (ms && ms.length ? ms.map(money).join(sep) : '—');

function parts(iso: string | Date) {
  const d = typeof iso === 'string' ? new Date(iso) : iso;
  const p = new Intl.DateTimeFormat('en-GB', { timeZone: TZ, year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
    .formatToParts(d)
    .reduce<Record<string, string>>((a, x) => ((a[x.type] = x.value), a), {});
  return { y: +p.year, m: +p.month, d: +p.day, hh: p.hour, mm: p.minute };
}

/** "18 okt" (+ year when not the current one) */
export function dayMonth(iso: string | null | undefined, withYear?: boolean) {
  if (!iso) return '—';
  const p = parts(iso);
  const yearNow = parts(new Date()).y;
  return `${p.d} ${MONTHS[p.m - 1]}${withYear || p.y !== yearNow ? ` ${p.y}` : ''}`;
}
/** "18 okt, 14:02" */
export function dateTime(iso: string | null | undefined) {
  if (!iso) return '—';
  const p = parts(iso);
  return `${dayMonth(iso)}, ${p.hh}:${p.mm}`;
}
/** "14:02" */
export function timeOnly(iso: string | null | undefined) {
  if (!iso) return '—';
  const p = parts(iso);
  return `${p.hh}:${p.mm}`;
}
/** "18.10.2027" */
export function dotDate(iso: string | null | undefined) {
  if (!iso) return '—';
  const p = parts(iso);
  return `${String(p.d).padStart(2, '0')}.${String(p.m).padStart(2, '0')}.${p.y}`;
}
/** Tashkent calendar day "YYYY-MM-DD" */
export function tashkentDay(d: Date = new Date()) {
  const p = parts(d);
  return `${p.y}-${String(p.m).padStart(2, '0')}-${String(p.d).padStart(2, '0')}`;
}
export function addDays(day: string, n: number) {
  const d = new Date(`${day}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}
/** "YYYY-MM-DD" → "18 okt" */
export function dayLabel(day: string) {
  const [, m, d] = day.split('-').map(Number);
  return `${d} ${MONTHS[m - 1]}`;
}

/** "6 daq oldin", "1 soat oldin", "kecha", "3 kun oldin", then "18 okt" */
export function ago(iso: string | null | undefined, now: number = Date.now()) {
  if (!iso) return '—';
  const s = Math.max(0, (now - Date.parse(iso)) / 1000);
  if (s < 60) return 'hozir';
  if (s < 3600) return `${Math.floor(s / 60)} daq oldin`;
  if (s < 86400) return `${Math.floor(s / 3600)} soat oldin`;
  if (s < 2 * 86400) return 'kecha';
  if (s < 7 * 86400) return `${Math.floor(s / 86400)} kun oldin`;
  return dayMonth(iso);
}

/** "2 s 41 daq" / "34 daq" / "41 s" (seconds) */
export function duration(sec: number | null | undefined) {
  if (sec === null || sec === undefined) return '—';
  const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60);
  if (h) return `${h} s ${m} daq`;
  if (m) return `${m} daq`;
  return `${Math.round(sec)} s`;
}

export const EXAM_LABEL: Record<string, string> = { ielts: 'IELTS', sat: 'SAT', cefr: 'CEFR', toefl: 'TOEFL', hsk: 'HSK' };
export const examLabel = (e: string | null | undefined) => (e ? EXAM_LABEL[e] ?? e.toUpperCase() : '—');

/** "IELTS · 5 ta full mock" / "SAT · 3 ta bo'lim" / "IELTS · Cheksiz 30 kun" */
export function productName(p: { exam: string; kind: string; qty: number; grants?: { unlimitedDays: number } | null }) {
  const e = examLabel(p.exam);
  if (p.kind === 'unlimited') return `${e} · Cheksiz ${p.grants?.unlimitedDays || 30 * (p.qty || 1)} kun`;
  if (p.kind === 'section') return `${e} · ${p.qty} ta bo'lim`;
  return `${e} · ${p.qty} ta full mock`;
}

/** country ISO-2 → flag emoji */
export function flag(country: string | null | undefined) {
  if (!country || !/^[A-Za-z]{2}$/.test(country)) return '';
  return String.fromCodePoint(...[...country.toUpperCase()].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65));
}

/** "AT-3F9A1C2B" */
export const attemptNo = (shortId: string) => `AT-${shortId}`;
export const ticketNo = (no: number) => `#T-${no}`;

/** percent with one decimal: 0.0703 → "7.0%" */
export const pct = (r: number, digits = 1) => `${(r * 100).toFixed(digits)}%`;
/** delta of two numbers as "+8%" / "−3%" / "0%" */
export function deltaPct(cur: number, prev: number): { text: string; trend: 'up' | 'down' | 'flat' } {
  if (!prev) return { text: cur ? '+100%' : '0%', trend: cur ? 'up' : 'flat' };
  const d = Math.round(((cur - prev) / prev) * 100);
  return { text: `${d > 0 ? '+' : d < 0 ? '−' : ''}${Math.abs(d)}%`, trend: d > 0 ? 'up' : d < 0 ? 'down' : 'flat' };
}
/** rate delta in percentage points: "+0.4 pp" */
export function deltaPp(cur: number, prev: number): { text: string; trend: 'up' | 'down' | 'flat' } {
  const d = Math.round((cur - prev) * 1000) / 10;
  return { text: `${d > 0 ? '+' : d < 0 ? '−' : ''}${Math.abs(d).toFixed(1)} pp`, trend: d > 0 ? 'up' : d < 0 ? 'down' : 'flat' };
}
