/**
 * Defensive readers for the staff-only parts of `GET /exams/attempts/:id/result`
 * (contract §2, 2026-10-12, Bekzod): essay text, integrity events, timing.
 * The shapes are tolerated loosely so a renamed / missing field never breaks the page.
 */
import type { ResultResp } from '@/lib/exam/types';

type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj => !!v && typeof v === 'object' && !Array.isArray(v);
const str = (v: unknown) => (typeof v === 'string' && v.trim() ? v : null);
const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : null);

export interface Essay { taskKey: string; text: string | null; words: number | null; minWords: number | null; prompt: string | null }

/** §2c: the essay is `ai[].essay` (writing) / `ai[].transcript` (speaking); an `essays[]` list is tolerated too. */
export function essaysOf(r: ResultResp & { essays?: unknown }): Essay[] {
  const read = (o: Obj, fallbackKey: string): Essay => {
    const text = str(o.essay) ?? str(o.transcript) ?? str(o.text) ?? str(o.response) ?? str(o.answer);
    const words = num(o.words) ?? num(o.wordCount) ?? (text ? text.trim().split(/\s+/).length : null);
    return { taskKey: str(o.taskKey) ?? fallbackKey, text, words, minWords: num(o.minWords), prompt: str(o.prompt) ?? str(o.promptText) };
  };
  if (Array.isArray(r.essays)) return r.essays.filter(isObj).map((o, i) => read(o, `t${i + 1}`));
  if (isObj(r.essays)) return Object.entries(r.essays).map(([k, v]) => (typeof v === 'string' ? { taskKey: k, text: v, words: v.trim().split(/\s+/).length, minWords: null, prompt: null } : read(isObj(v) ? v : {}, k)));
  return r.ai.map((a) => read(a as unknown as Obj, a.taskKey)).filter((e) => e.text);
}

/** Essays of one section (`ai[].sectionKey`, v1.8); rows without it count as Writing. */
export function essaysFor(r: ResultResp, sectionKey: string): Essay[] {
  return r.ai.flatMap((a) => {
    const sk = (a as { sectionKey?: string | null }).sectionKey ?? 'writing';
    if (sk !== sectionKey) return [];
    return essaysOf({ ...r, ai: [a] }).slice(0, 1);
  });
}

export interface IntegrityEvent { type: string; at: string | null; stage: string | null; detail: string | null }

const EVENT_LABEL: Record<string, string> = {
  tab_switch: "Boshqa oynaga o'tdi",
  window_blur: "Imtihon oynasidan chiqdi",
  fullscreen_exit: "To'liq ekrandan chiqdi",
  paste: 'Matn joyladi (paste)',
  copy: 'Nusxa oldi (copy)',
  resize: "Oyna o'lchamini o'zgartirdi",
  tech_skip: "Texnik nosozlik — qism o'tkazib yuborildi",
};
export const eventLabel = (t: string) => EVENT_LABEL[t] ?? t.replace(/_/g, ' ');

export function integrityOf(r: { integrity?: unknown }): IntegrityEvent[] {
  const src = Array.isArray(r.integrity) ? r.integrity : isObj(r.integrity) && Array.isArray(r.integrity.events) ? r.integrity.events : [];
  return src.filter(isObj).map((o) => {
    const meta = isObj(o.meta) ? o.meta : null;
    const detail = str(o.detail) ?? (meta ? Object.entries(meta).map(([k, v]) => `${k}: ${String(v)}`).join(', ') || null : null);
    return { type: str(o.type) ?? 'event', at: str(o.at) ?? str(o.createdAt), stage: str(o.stageKey) ?? str(o.sectionKey), detail };
  }).sort((a, b) => (a.at ?? '').localeCompare(b.at ?? ''));
}

export interface StageTime { key: string; sectionKey: string | null; title: string | null; usedSec: number | null; limitSec: number | null; startedAt: string | null; finishedAt: string | null }

/** §2c `timing.sections[]` (minutes, 0.1 precision); older array / record shapes tolerated. */
export function timingOf(r: { timing?: unknown }): StageTime[] {
  // v1.8: `{ sections: [{sectionKey, startedAt, finishedAt, minutes, stages[]}], totalMinutes }`
  const src = isObj(r.timing) && Array.isArray(r.timing.sections) ? r.timing.sections : r.timing;
  const rows: [string, Obj][] = Array.isArray(src)
    ? src.filter(isObj).map((o, i) => [str(o.stageKey) ?? str(o.sectionKey) ?? str(o.key) ?? `s${i}`, o])
    : isObj(src) ? Object.entries(src).filter((e): e is [string, Obj] => isObj(e[1])) : [];
  return rows.map(([key, o]) => {
    const startedAt = str(o.startedAt); const finishedAt = str(o.finishedAt) ?? str(o.submittedAt);
    const span = startedAt && finishedAt ? Math.max(0, Math.round((Date.parse(finishedAt) - Date.parse(startedAt)) / 1000)) : null;
    const limitMin = num(o.limitMin) ?? num(o.durationMin);
    return {
      key, sectionKey: str(o.sectionKey), title: str(o.title),
      usedSec: num(o.usedSec) ?? num(o.durationSec) ?? num(o.spentSec) ?? (num(o.minutes) != null ? Math.round(num(o.minutes)! * 60) : span),
      limitSec: num(o.limitSec) ?? (limitMin != null ? limitMin * 60 : null),
      startedAt, finishedAt,
    };
  });
}

export function durationText(sec: number | null): string {
  if (sec == null) return '—';
  const m = Math.floor(sec / 60); const s = sec % 60;
  if (!m) return `${s} soniya`;
  return s ? `${m} daqiqa ${s} soniya` : `${m} daqiqa`;
}
