/** Pure derivations from stage content + answers (no React). */
import { isAnswered } from '../format';
import type { Group, Part, StageContent, WritingTask } from '../types';
import type { AnswerEntry } from './state';

export interface FlatQ { id: string; no: number; partIdx: number; group: Group; /** all row ids of a multiGroup (else [id]) */ rowIds: string[] }

export function partsOf(c: StageContent | null): Part[] {
  return c && 'parts' in c ? c.parts : [];
}
export function tasksOf(c: StageContent | null): WritingTask[] {
  return c && c.kind === 'writing' ? c.tasks : [];
}

export function flatQuestions(c: StageContent | null): FlatQ[] {
  const out: FlatQ[] = [];
  partsOf(c).forEach((p, partIdx) =>
    p.groups.forEach((g) => {
      const rowIds = g.questions.map((q) => q.id);
      g.questions.forEach((q) => out.push({ id: q.id, no: q.no, partIdx, group: g, rowIds: g.multiGroup ? rowIds : [q.id] }));
    }),
  );
  return out;
}

export function firstQuestionId(c: StageContent | null): string | null {
  const t = tasksOf(c);
  if (t.length) return t[0].questionId;
  return flatQuestions(c)[0]?.id ?? null;
}

export const answered = (answers: Record<string, AnswerEntry>, id: string) => isAnswered(answers[id]?.v);

export function unansweredNos(c: StageContent | null, answers: Record<string, AnswerEntry>): { no: number; id: string; partIdx: number }[] {
  return flatQuestions(c).filter((q) => !answered(answers, q.id)).map((q) => ({ no: q.no, id: q.id, partIdx: q.partIdx }));
}

export function partNos(p: Part): number[] {
  return p.groups.flatMap((g) => g.questions.map((q) => q.no));
}

/** Passage HTML (`<p data-pid="A">…</p>`) → plain paragraphs. Text only: nothing from
 *  the HTML is ever injected, so highlight offsets stay stable and XSS is impossible. */
export interface Para { pid: string; text: string }
export function parsePassage(html: string | null): Para[] {
  if (!html || typeof DOMParser === 'undefined') return [];
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const ps = Array.from(doc.querySelectorAll('p'));
  if (!ps.length) return [{ pid: 'p1', text: doc.body.textContent?.trim() ?? '' }];
  return ps.map((p, i) => ({ pid: p.getAttribute('data-pid') || `p${i + 1}`, text: (p.textContent ?? '').replace(/\s+/g, ' ').trim() }));
}

/** Paragraph label shown in bold before the text ("A"), like the design; hidden for p1/P1 keys. */
export function paraLabel(pid: string): string {
  return /^[A-Z]{1,2}$/.test(pid) ? pid : '';
}

export function stageSectionTitle(cfgSections: { key: string; title: string }[] | undefined, sectionKey: string | undefined): string {
  return cfgSections?.find((s) => s.key === sectionKey)?.title ?? sectionKey ?? '';
}
