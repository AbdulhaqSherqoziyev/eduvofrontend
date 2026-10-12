/**
 * Result page "Xulosa" + overall card data (§1.10, 2026-10-12). Shared by the player
 * results (`exam/results/*`) and the hub result (`exams-hub/*`).
 * Every new field is optional: when the backend has not sent `summary` the per-type
 * lines are rebuilt from `review`; without `estimatedOverall` the old `overall` is used.
 */
import { typeLabel } from './hub-derive';
import type { ResultResp, ReviewRow, SummaryTypeLine } from './types';

export interface TypeLine { type: string; label: string; correct: number; total: number }
export interface SectionSummary { key: string; title: string; correct: number; total: number; byType: TypeLine[]; weakest: TypeLine[]; strongest: TypeLine[] }
export interface ResultSummaryData { sections: SectionSummary[]; nextSteps: string[] }

const isAi = (key: string) => key === 'writing' || key === 'speaking';
const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : 0);

function toLine(x: SummaryTypeLine): TypeLine {
  return { type: x.type, label: (typeof x.label === 'string' && x.label.trim()) || typeLabel(x.type), correct: num(x.correct), total: num(x.total) };
}

/** `weakest` / `strongest` may come as type keys or as full lines. */
function pick(list: unknown[] | undefined, by: TypeLine[]): TypeLine[] {
  if (!Array.isArray(list)) return [];
  return list.flatMap((x) => {
    const key = typeof x === 'string' ? x : x && typeof x === 'object' && typeof (x as { type?: unknown }).type === 'string' ? (x as { type: string }).type : null;
    if (!key) return [];
    const hit = by.find((b) => b.type === key);
    if (hit) return [hit];
    return typeof x === 'object' ? [toLine(x as SummaryTypeLine)] : [];
  });
}

/** Only with 2+ types that differ: the lowest-share types (not fully correct) and the top one (at least one correct). */
function derivePicks(by: TypeLine[]): { weakest: TypeLine[]; strongest: TypeLine[] } {
  if (by.length < 2) return { weakest: [], strongest: [] };
  const share = (l: TypeLine) => (l.total ? l.correct / l.total : 0);
  const hi = Math.max(...by.map(share));
  const lo = Math.min(...by.map(share));
  if (hi === lo) return { weakest: [], strongest: [] }; // all types alike → nothing to single out
  const weakest = by.filter((l) => share(l) === lo && l.correct < l.total).slice(0, 2);
  const strongest = by.filter((l) => share(l) === hi && l.correct > 0).slice(0, 1);
  return { weakest, strongest };
}

function fromReview(rows: ReviewRow[]): TypeLine[] {
  const by = new Map<string, TypeLine>();
  for (const r of rows) {
    const l = by.get(r.type) ?? { type: r.type, label: typeLabel(r.type), correct: 0, total: 0 };
    l.total += 1;
    if (r.isCorrect) l.correct += 1;
    by.set(r.type, l);
  }
  return [...by.values()];
}

export function buildSummary(r: ResultResp): ResultSummaryData {
  const ready = r.sections.filter((s) => s.status === 'READY' && !isAi(s.key));
  const title = (key: string) => r.sections.find((s) => s.key === key)?.title ?? key;
  const api = r.summary?.sections;
  let sections: SectionSummary[];
  if (Array.isArray(api) && api.length) {
    sections = api.filter((s) => s && typeof s.section === 'string' && !isAi(s.section)).map((s) => {
      const byType = (Array.isArray(s.byType) ? s.byType : []).filter((x) => x && typeof x.type === 'string').map(toLine);
      const d = derivePicks(byType);
      const weakest = Array.isArray(s.weakest) ? pick(s.weakest, byType) : d.weakest;
      const strongest = Array.isArray(s.strongest) ? pick(s.strongest, byType) : d.strongest;
      return { key: s.section, title: (typeof s.title === 'string' && s.title) || title(s.section), correct: num(s.correct), total: num(s.total), byType, weakest, strongest };
    });
  } else {
    sections = ready.flatMap((s) => {
      const rows = r.review.filter((x) => x.sectionKey === s.key);
      if (!rows.length) return [];
      const byType = fromReview(rows);
      return [{ key: s.key, title: s.title, correct: rows.filter((x) => x.isCorrect).length, total: rows.length, byType, ...derivePicks(byType) }];
    });
  }
  const nextSteps = (Array.isArray(r.summary?.nextSteps) ? r.summary!.nextSteps : []).filter((x): x is string => typeof x === 'string' && x.trim().length > 0);
  return { sections: sections.filter((s) => s.total > 0), nextSteps };
}

export interface OverallView { kind: 'band' | 'total'; label: string | null; level: string | null; basis: string[]; pending: string[] }

/** Overall card: `overallBand` (v1.8) first, then the old `overall`; null → the "no overall yet" note. */
export function overallView(r: ResultResp): OverallView | null {
  const kind = r.examCode.startsWith('SAT') ? 'total' : 'band';
  const title = (k: string) => r.sections.find((s) => s.key === k || s.title === k)?.title ?? k;
  const taken = r.sections.filter((s) => s.status !== 'NOT_TAKEN');
  const e = r.overallBand ?? r.estimatedOverall;
  if (e) {
    const basis = (Array.isArray(e.basis) && e.basis.length ? e.basis : taken.map((s) => s.key)).map(title);
    const pending = e.pending ? taken.filter((s) => s.status === 'GRADING' || s.status === 'PENDING' || s.status === 'NEEDS_HUMAN').map((s) => s.title) : [];
    const label = e.label ?? (e.value != null ? String(e.value) : null);
    if (!e.pending && !label) return null;
    return { kind, label: e.pending ? null : label, level: e.pending ? null : e.level ?? null, basis, pending: e.pending && !pending.length ? taken.filter((s) => isAi(s.key)).map((s) => s.title) : pending };
  }
  if (r.overall) return { kind, label: r.overall.label, level: r.overall.level, basis: taken.map((s) => s.title), pending: [] };
  return null;
}

/** `evidence` is a string; an object with `text`/`quote` is tolerated. */
export function evidenceText(e: unknown): string | null {
  if (typeof e === 'string') return e.trim() || null;
  if (e && typeof e === 'object') {
    const o = e as { text?: unknown; quote?: unknown };
    const s = typeof o.text === 'string' ? o.text : typeof o.quote === 'string' ? o.quote : null;
    return s?.trim() || null;
  }
  return null;
}

/** AI task score — always one number (Abdulhaq 10-12: no ranges). */
export const aiScore = (a: { score: number | null; scoreMin: number | null; scoreMax: number | null }) => a.score ?? a.scoreMin ?? a.scoreMax;
