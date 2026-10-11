/**
 * Dark-card facts (§4, T37): Mock #N, personal best, "Oldingisiga nisbatan +x".
 * Only the student's own history; a drop is never put into words (since_last rule).
 */
import { scoreText } from './hub-format';
import type { DetailResp, ExamFamily } from './hub-types';
import type { ResultResp } from './types';

export interface HeroFacts {
  mockN: number | null;
  personalBest: string | null;
  sinceLast: { section: string; delta: string } | null;
  sameAsLast: boolean;
}

export function resultFacts(r: ResultResp, d: DetailResp | undefined, family: ExamFamily): HeroFacts {
  const none: HeroFacts = { mockN: null, personalBest: null, sinceLast: null, sameAsLast: false };
  if (!d) return none;
  const done = d.attempts
    .filter((a) => a.status === 'COMPLETED' || a.id === r.attemptId)
    .sort((a, b) => Date.parse(a.finishedAt ?? a.startedAt) - Date.parse(b.finishedAt ?? b.startedAt));
  const idx = done.findIndex((a) => a.id === r.attemptId);
  if (idx < 0) return none;
  const mine: Record<string, number | null> = Object.fromEntries(r.sections.map((s) => [s.key, s.scaled]));
  const others = done.filter((a) => a.id !== r.attemptId);
  const title = (k: string) => r.sections.find((s) => s.key === k)?.title ?? k;

  let personalBest: string | null = null;
  for (const s of r.sections) {
    const v = mine[s.key];
    const prev = others.map((a) => a.resultSummary?.sections[s.key]).filter((x): x is number => x != null);
    if (v != null && prev.length && v > Math.max(...prev)) {
      personalBest = s.title;
      break;
    }
  }

  const before = done[idx - 1]?.resultSummary?.sections;
  let sinceLast: HeroFacts['sinceLast'] = null;
  let sameAsLast = false;
  if (before) {
    const deltas = Object.keys(mine)
      .filter((k) => mine[k] != null && before[k] != null)
      .map((k) => ({ k, d: (mine[k] as number) - (before[k] as number) }));
    const top = deltas.reduce<{ k: string; d: number } | null>((m, x) => (!m || x.d > m.d ? x : m), null);
    if (top && top.d > 0) sinceLast = { section: title(top.k), delta: `+${scoreText(family, top.d)}` };
    else if (deltas.length && deltas.every((x) => x.d === 0)) sameAsLast = true;
  }
  return { mockN: idx + 1, personalBest, sinceLast, sameAsLast };
}
