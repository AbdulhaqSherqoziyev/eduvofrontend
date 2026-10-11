/** Uzbek date / duration / score formatting for the student hub (local time). */
import type { ExamFamily, HubExam, HubSection } from './hub-types';

const MONTHS = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentyabr', 'oktyabr', 'noyabr', 'dekabr'];
const pad = (n: number) => String(n).padStart(2, '0');

export const hm = (iso: string) => {
  const d = new Date(iso);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
};
/** "12-oktabr" */
export const dayLong = (iso: string) => {
  const d = new Date(iso);
  return `${d.getDate()}-${MONTHS[d.getMonth()]}`;
};
/** "10-okt, 14:20" */
export const dayShortTime = (iso: string) => {
  const d = new Date(iso);
  return `${d.getDate()}-${MONTHS[d.getMonth()].slice(0, 3)}, ${hm(iso)}`;
};
/** "10-okt" */
export const dayShort = (iso: string) => {
  const d = new Date(iso);
  return `${d.getDate()}-${MONTHS[d.getMonth()].slice(0, 3)}`;
};
/** "12.10, 10:00" */
export const dotDayTime = (iso: string) => {
  const d = new Date(iso);
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}, ${hm(iso)}`;
};
/** "12-oktabr, 10:00–13:00" (or both days when the window crosses midnight). */
export function windowLabel(start: string, end: string, sep = '–'): string {
  const same = new Date(start).toDateString() === new Date(end).toDateString();
  return same ? `${dayLong(start)}, ${hm(start)}${sep}${hm(end)}` : `${dayLong(start)}, ${hm(start)} ${sep} ${dayLong(end)}, ${hm(end)}`;
}

/** "2 soat 45 daq" / "60 daq". */
export function durationLabel(sec: number): string {
  const m = Math.round(sec / 60);
  const h = Math.floor(m / 60);
  return h ? `${h} soat${m % 60 ? ` ${m % 60} daq` : ''}` : `${m} daq`;
}

/** "Boshlanishiga 2 kun 4 soat" body ("38 daqiqa" under an hour). */
export function untilLabel(ms: number): string {
  const min = Math.max(1, Math.ceil(ms / 60_000));
  if (min < 60) return `${min} daqiqa`;
  const h = Math.floor(min / 60);
  const d = Math.floor(h / 24);
  return d ? `${d} kun${h % 24 ? ` ${h % 24} soat` : ''}` : `${h} soat${min % 60 ? ` ${min % 60} daqiqa` : ''}`;
}

/** "41:12" */
export function mmss(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(s / 3600);
  const body = `${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`;
  return h ? `${h}:${body}` : body;
}

/** Sections a student can take in v1 (Speaking is v1.5 → hidden from names, shown "Tez orada" in tables). */
export const takeable = (e: Pick<HubExam, 'sections'>) => e.sections.filter((s) => s.available && !s.separateSitting);

/** "IELTS Academic (mock)" → "IELTS Academic": "mock" is already said by the format chip. */
export const examTitle = (name: string) => name.replace(/\s*\(mock\)/i, '').trim();

/** "Listening, Reading, Writing" */
export const sectionList = (e: Pick<HubExam, 'sections'>) => takeable(e).map((s) => s.title).join(', ');

/** "IELTS-format mock" */
export const formatChip = (family: ExamFamily) => `${family}-format mock`;

/** Total length of the takeable sections; null when any of them has no fixed length in the hub payload. */
export function totalSec(e: Pick<HubExam, 'sections'>): number | null {
  const list = takeable(e);
  if (list.some((s) => s.durationSec == null)) return null;
  return list.reduce((n, s) => n + (s.durationSec ?? 0), 0);
}

export const sectionTime = (s: HubSection) => (s.durationSec != null ? `${Math.round(s.durationSec / 60)} daq` : null);

/** IELTS band 6.5 → "6.5", 7 → "7.0"; CEFR scores stay integers. */
export function scoreText(family: ExamFamily, v: number | null | undefined): string | null {
  if (v == null) return null;
  return family === 'IELTS' ? v.toFixed(1) : String(Math.round(v));
}

/** "L 6.5 · R 7.0 · W 6.0" — each section's own best, null-safe. */
export function bestLine(family: ExamFamily, sections: HubSection[], best: Record<string, number | null>): string | null {
  const parts = sections
    .filter((s) => best[s.key] != null)
    .map((s) => `${s.title[0]} ${scoreText(family, best[s.key])}`);
  return parts.length ? parts.join(' · ') : null;
}

/** Exam colour (spec §0): IELTS blue, CEFR green; others fall back to the accent. */
export const familyInk = (f: ExamFamily) =>
  f === 'IELTS' ? 'oklch(0.5 0.15 255)' : f === 'CEFR' ? 'oklch(0.5 0.11 160)' : '#2E6BE6';

/** Attempt result line from a `{listening: 6.5, …}` summary, in the exam's section order. */
export function resultLine(family: ExamFamily, sections: HubSection[], vals: Record<string, number | null>): string | null {
  const known = sections.length ? sections : Object.keys(vals).map((key) => ({ key, title: key[0]!.toUpperCase() + key.slice(1) }) as HubSection);
  return bestLine(family, known.filter((s) => s.key in vals), vals);
}
