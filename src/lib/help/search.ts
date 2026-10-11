/**
 * Qo'llanma search — SPEC §4. Pure functions over the already-filtered
 * content, so results can only ever contain what this user may see.
 */
import { HELP_SYNONYMS } from './content';
import { MAX_RESULTS } from './constants';
import type { HelpErrorItem, HelpGlossaryItem, HelpQuestion } from './types';
import type { VisibleHelp, VisibleSection } from './visibility';

// ‘ ’ ʻ ʼ ` ´ ' — o'quvchi = oʻquvchi = o`quvchi = oquvchi
const APOS = /[‘’ʻʼ`´']/g;

export function norm(s: string): string {
  return s
    .toLowerCase()
    .replace(APOS, '')
    .replace(/[«»"“”.,!?:;()\-–—/]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** One query unit: a word, or a synonym group it belongs to (phrases allowed). */
export interface QueryUnit {
  alts: string[];
  /** What the user actually typed; a synonym-only hit scores less (SYNONYM_FACTOR). */
  literal: string;
}

const SYNONYM_FACTOR = 0.4;

const GROUPS: string[][] = HELP_SYNONYMS.map((g) => g.map(norm));

/** Does a query word belong to this synonym term? ("qarzdorlarni" -> "qarzdorlar"). */
function termHit(word: string, term: string): boolean {
  return word === term || (term.length >= 4 && word.startsWith(term));
}

export function parseQuery(q: string): QueryUnit[] {
  const words = norm(q).split(' ').filter(Boolean);
  const units: QueryUnit[] = [];
  let i = 0;
  while (i < words.length) {
    let taken = 0;
    let group: string[] | null = null;
    // longest synonym phrase starting here (up to 3 words)
    for (let len = Math.min(3, words.length - i); len >= 1 && !group; len -= 1) {
      const phrase = words.slice(i, i + len).join(' ');
      for (const g of GROUPS) {
        if (g.some((t) => (len === 1 ? termHit(phrase, t) : phrase === t))) {
          group = g;
          taken = len;
          break;
        }
      }
    }
    if (group) {
      const literal = words.slice(i, i + taken).join(' ');
      units.push({ alts: Array.from(new Set([literal, ...group])), literal });
      i += taken;
    } else {
      units.push({ alts: [words[i]], literal: words[i] });
      i += 1;
    }
  }
  return units;
}

/** Word-level match: prefix for ≥3 letters, whole word for 2, light suffix stripping. */
function wordHit(docWord: string, alt: string): boolean {
  if (alt.length < 3) return docWord === alt;
  if (docWord.startsWith(alt)) return true;
  // "tolovni" finds "tolov": Uzbek suffixes on the query side
  return docWord.length >= 4 && alt.startsWith(docWord);
}

function altHit(textNorm: string, words: string[], alt: string): boolean {
  if (alt.includes(' ')) return ` ${textNorm}`.includes(` ${alt}`);
  return words.some((w) => wordHit(w, alt));
}

interface Field {
  norm: string;
  words: string[];
  weight: number;
}

function field(text: string, weight: number): Field {
  const n = norm(text);
  return { norm: n, words: n.split(' ').filter(Boolean), weight };
}

interface IndexedQuestion {
  question: HelpQuestion;
  section: VisibleSection;
  fields: Field[];
  order: number;
}

export interface HelpIndex {
  questions: IndexedQuestion[];
  errors: { item: HelpErrorItem; field: Field }[];
  glossary: { item: HelpGlossaryItem; field: Field }[];
}

export function buildIndex(help: VisibleHelp): HelpIndex {
  const questions: IndexedQuestion[] = [];
  let order = 0;
  for (const slug of help.order) {
    const section = help.sections.get(slug);
    if (!section) continue;
    for (const q of section.questions) {
      questions.push({
        question: q,
        section,
        order: order++,
        fields: [
          field(q.title, 5),
          field(q.keywords.join(' , '), 4),
          field(q.answer, 2),
          field([...(q.steps ?? []), q.example ?? '', ...(q.note ?? [])].join(' '), 1),
          field(section.title, 1),
        ],
      });
    }
  }
  return {
    questions,
    errors: help.errors.map((item) => ({ item, field: field(`${item.message} ${item.text}`, 4) })),
    glossary: help.glossary.map((item) => ({ item, field: field(`${item.term} ${item.text}`, 3) })),
  };
}

function unitScore(fields: Field[], unit: QueryUnit): number {
  let score = 0;
  for (const f of fields) {
    if (altHit(f.norm, f.words, unit.literal)) score += f.weight;
    else if (unit.alts.some((a) => altHit(f.norm, f.words, a))) score += f.weight * SYNONYM_FACTOR;
  }
  return score;
}

export interface SearchResult {
  questions: { question: HelpQuestion; section: VisibleSection }[];
  errors: HelpErrorItem[];
  glossary: HelpGlossaryItem[];
  units: QueryUnit[];
}

/**
 * Score = Σ field weights per matched unit, +10 when every unit matched.
 * If anything matches every unit, partial matches are dropped — otherwise a
 * filler word like "qanday" would bury the real answer.
 */
export function search(index: HelpIndex, query: string): SearchResult {
  const units = parseQuery(query);
  if (!units.length) return { questions: [], errors: [], glossary: [], units };

  const rank = <T>(rows: { row: T; fields: Field[]; order: number }[]) => {
    const scored = rows
      .map(({ row, fields, order }) => {
        let score = 0;
        let hits = 0;
        for (const u of units) {
          const s = unitScore(fields, u);
          if (s > 0) hits += 1;
          score += s;
        }
        if (hits === units.length) score += 10;
        return { row, score, hits, order };
      })
      .filter((r) => r.score > 0);
    const full = scored.filter((r) => r.hits === units.length);
    return (full.length ? full : scored).sort((a, b) => b.score - a.score || a.order - b.order);
  };

  return {
    units,
    questions: rank(index.questions.map((q) => ({ row: q, fields: q.fields, order: q.order })))
      .slice(0, MAX_RESULTS)
      .map((r) => ({ question: r.row.question, section: r.row.section })),
    errors: rank(index.errors.map((e, i) => ({ row: e.item, fields: [e.field], order: i }))).map((r) => r.row),
    glossary: rank(index.glossary.map((g, i) => ({ row: g.item, fields: [g.field], order: i }))).map((r) => r.row),
  };
}

/** Split `text` into [plain, matched, plain, …] word spans for <mark>. */
export function highlightParts(text: string, units: QueryUnit[]): { text: string; hit: boolean }[] {
  if (!units.length) return [{ text, hit: false }];
  const alts = units.flatMap((u) => u.alts.flatMap((a) => a.split(' '))).filter(Boolean);
  const parts: { text: string; hit: boolean }[] = [];
  const re = /[\p{L}\p{N}‘’ʻʼ`´']+/gu;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    const w = norm(m[0]);
    if (w && alts.some((a) => wordHit(w, a))) {
      if (m.index > last) parts.push({ text: text.slice(last, m.index), hit: false });
      parts.push({ text: m[0], hit: true });
      last = m.index + m[0].length;
    }
  }
  if (last < text.length) parts.push({ text: text.slice(last), hit: false });
  return parts;
}
