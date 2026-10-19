/**
 * Analytics number/time formats (spec §1.6). Everything is Asia/Tashkent (UTC+5, no DST) regardless of
 * the browser zone; numbers group with U+00A0 so "12 480" never wraps. Never "~", "≈", "±", "12.5K".
 */
import type { IsoDate, NullReason } from '@/lib/api/owner-analytics.types';

export const NBSP = ' ';
export const MINUS = '−';
const TZ_MS = 5 * 3_600_000;
const DAY_MS = 86_400_000;

export const MONTHS = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr'];
/** getUTCDay() order (0 = Sunday). */
export const WEEKDAYS = ['yakshanba', 'dushanba', 'seshanba', 'chorshanba', 'payshanba', 'juma', 'shanba'];

const pad = (n: number) => String(n).padStart(2, '0');
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** 12480 → "12 480" (U+00A0). */
export function fmtInt(n: number): string {
  const s = String(Math.round(Math.abs(n))).replace(/\B(?=(\d{3})+(?!\d))/g, NBSP);
  return n < 0 ? `${MINUS}${s}` : s;
}

/** Rate 0..1 → "34%", "4,2%", "0%". */
export function fmtPct(rate: number): string {
  const p = rate * 100;
  if (p === 0) return '0%';
  if (Math.abs(p) >= 10) return `${Math.round(p)}%`;
  const one = Math.round(p * 10) / 10;
  if (Math.abs(one) >= 10) return `${Math.round(one)}%`;
  return `${one.toFixed(1).replace('.', ',')}%`;
}

/** Seconds → "8 s", "1 daq 40 s", "12 daq", "1 soat 5 daq". */
export function fmtDuration(sec: number): string {
  const s = Math.max(0, Math.round(sec));
  if (s < 60) return `${s}${NBSP}s`;
  if (s < 3600) {
    const m = Math.floor(s / 60), r = s % 60;
    return m < 10 && r ? `${m}${NBSP}daq ${r}${NBSP}s` : `${m}${NBSP}daq`;
  }
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60);
  return m ? `${h}${NBSP}soat ${m}${NBSP}daq` : `${h}${NBSP}soat`;
}

/** Wall-clock parts of an instant in Tashkent. */
function tash(ms: number) {
  const d = new Date(ms + TZ_MS);
  return { y: d.getUTCFullYear(), mo: d.getUTCMonth(), d: d.getUTCDate(), h: d.getUTCHours(), mi: d.getUTCMinutes(), s: d.getUTCSeconds(), wd: d.getUTCDay() };
}
const isoOf = (p: { y: number; mo: number; d: number }) => `${p.y}-${pad(p.mo + 1)}-${pad(p.d)}`;

/** Today's Tashkent calendar day. */
export const tashToday = (now = Date.now()): IsoDate => isoOf(tash(now));
/** Tashkent day of an instant. */
export const tashDayOf = (iso: string): IsoDate => isoOf(tash(Date.parse(iso)));

/** IsoDate arithmetic (calendar days, zone-free). */
export function addDays(day: IsoDate, n: number): IsoDate {
  const t = Date.parse(`${day}T00:00:00Z`) + n * DAY_MS;
  return new Date(t).toISOString().slice(0, 10);
}
export const daysBetween = (a: IsoDate, b: IsoDate) => Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / DAY_MS);

const dayParts = (day: IsoDate) => {
  const d = new Date(`${day}T00:00:00Z`);
  return { y: d.getUTCFullYear(), mo: d.getUTCMonth(), d: d.getUTCDate(), wd: d.getUTCDay() };
};

/** "20-oktabr" (headings). */
export const fmtDayUz = (day: IsoDate) => { const p = dayParts(day); return `${p.d}-${MONTHS[p.mo]}`; };
/** "Seshanba, 15-oktabr" (chart tooltip). */
export const fmtWeekdayDay = (day: IsoDate) => `${cap(WEEKDAYS[dayParts(day).wd])}, ${fmtDayUz(day)}`;
/** "15.10" (axis, period pill). */
export const fmtDM = (day: IsoDate) => { const p = dayParts(day); return `${pad(p.d)}.${pad(p.mo + 1)}`; };
/** "20.10.2026" (tables). */
export const fmtDateTash = (day: IsoDate) => { const p = dayParts(day); return `${pad(p.d)}.${pad(p.mo + 1)}.${p.y}`; };

/** Instant → "14:32" / "14:32:10" in Tashkent. */
export const fmtHM = (iso: string) => { const p = tash(Date.parse(iso)); return `${pad(p.h)}:${pad(p.mi)}`; };
export const fmtHMS = (iso: string) => { const p = tash(Date.parse(iso)); return `${pad(p.h)}:${pad(p.mi)}:${pad(p.s)}`; };
/** Hour bucket start → "14:00". */
export const fmtHour = (iso: string) => `${pad(tash(Date.parse(iso)).h)}:00`;

/** "hozirgina", "3 daqiqa oldin", "2 soat oldin", "kecha 14:20", "17.10 14:20". */
export function fmtAgo(iso: string, now = Date.now()): string {
  const t = Date.parse(iso);
  const diff = Math.max(0, now - t);
  if (diff < 60_000) return 'hozirgina';
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)} daqiqa oldin`;
  const today = tashToday(now), day = tashDayOf(iso);
  if (day === today) return `${Math.floor(diff / 3_600_000)} soat oldin`;
  if (day === addDays(today, -1)) return `kecha ${fmtHM(iso)}`;
  return `${fmtDM(day)} ${fmtHM(iso)}`;
}

/** Day precision only (Markazlar, Q11): "bugun", "kecha", "3 kun oldin", "17.10". */
export function fmtDayAgo(day: IsoDate, today: IsoDate): string {
  const n = daysBetween(day, today);
  if (n <= 0) return 'bugun';
  if (n === 1) return 'kecha';
  if (n < 7) return `${n} kun oldin`;
  return fmtDM(day);
}

/** Title (hover) for a "—" value. */
export function nullTitle(reason?: NullReason | null): string | undefined {
  if (reason === 'retention') return '90 kundan eski davr uchun saqlanmaydi';
  if (reason === 'db_error') return undefined;
  return "Ma'lumot yo'q";
}

/** Big value of a metric: number or "—". */
export const fmtMetric = (v: number | null | undefined) => (v === null || v === undefined ? '—' : fmtInt(v));
