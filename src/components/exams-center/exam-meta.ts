import type { SectionBrief } from '@/lib/api/center-exams';
import type { CatalogFamily, Family } from '@/lib/api/center-exams-v3';
import { isComingSoon } from '@/lib/exam/coming-soon';

/** Display helpers for the centre console (design v3 copy and formats). */

export type { Family };
export const FAMILIES: Family[] = ['IELTS', 'CEFR', 'SAT', 'TOEFL', 'HSK'];

/** "Tez kunda" family: backend `comingSoon` flag, else the `COMING_SOON` fallback. */
export const familySoon = (f: Pick<CatalogFamily, 'family' | 'comingSoon'> | undefined) => !!f && isComingSoon(f.family, f.comingSoon);

/** Family card that owns an exam code (IELTS Academic + General share one card). */
export function familyOfCode(families: CatalogFamily[] | undefined, code: string): CatalogFamily | undefined {
  return families?.find((f) => f.examCodes.includes(code));
}

export function sectionTitle(exam: { sections: SectionBrief[] } | undefined, key: string | null): string {
  if (!key) return '';
  return exam?.sections.find((s) => s.key === key)?.title ?? capitalize(key);
}

/** Config names carry "(mock)" / "— English"; the design shows the bare variant ("IELTS Academic"). */
export function examShortName(exam: { name: string } | undefined, code: string): string {
  if (!exam) return code;
  return exam.name.replace(/\s*\(mock\)/i, '').replace(/\s+—\s+.*$/, '').trim() || exam.name;
}

export const capitalize = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

export function formatScore(v: number | null | undefined): string {
  if (v == null) return '—';
  // Bands (0–9) read "7.0" in the design; larger scales (CEFR 75, SAT 1600) stay integers.
  if (Number.isInteger(v)) return v <= 9 ? v.toFixed(1) : String(v);
  return String(Math.round(v * 10) / 10);
}

/** AI job band label ("6.0–6.5"): "…" while still grading. */
export const finalLabel = (v: string | null | undefined) => v ?? '…';

/** Credits as the design writes them: "4 kredit". */
export const kr = (n: number | null | undefined) => (n == null ? '—' : `${n} kredit`);

/** Seconds → "2 d 40 s" (design AI KPI: daqiqa / soniya). */
export function minSec(sec: number | null | undefined): string {
  if (sec == null) return '—';
  const m = Math.floor(sec / 60);
  const s = Math.round(sec % 60);
  return m ? `${m} d ${s} s` : `${s} s`;
}

/** Signed delta "+42" / "−5" for the catalogue KPI. */
export const signed = (n: number) => (n < 0 ? `−${Math.abs(n)}` : `+${n}`);

const MONTHS = ['yan', 'fev', 'mar', 'apr', 'may', 'iyun', 'iyul', 'avg', 'sen', 'okt', 'noy', 'dek'];
const pad = (n: number) => String(n).padStart(2, '0');
export const hhmm = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;

const MONTHS_FULL = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr'];

/** "14-okt" (session cards). */
export const dayMonth = (d: Date) => `${d.getDate()}-${MONTHS[d.getMonth()]}`;
/** "5-oktabr" (results title). */
export const dayMonthFull = (d: Date) => `${d.getDate()}-${MONTHS_FULL[d.getMonth()]}`;

/** "Bugun, 10:00–13:00" / "14-okt, 15:00–18:00" / "5-okt" (design session cards). */
export function windowLabel(startIso: string, endIso: string, past = false): string {
  const s = new Date(startIso);
  const e = new Date(endIso);
  const today = new Date();
  const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();
  const day = (d: Date) => (sameDay(d, today) ? 'Bugun' : dayMonth(d));
  if (past) return day(s);
  return sameDay(s, e) ? `${day(s)}, ${hhmm(s)}–${hhmm(e)}` : `${day(s)}, ${hhmm(s)} – ${day(e)}, ${hhmm(e)}`;
}

export function dateTimeLabel(iso: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}, ${hhmm(d)}`;
}
