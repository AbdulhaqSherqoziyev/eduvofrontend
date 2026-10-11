/** "Natijalarim" numbers (§5): own history only — no averages, no ranks, no percentages. */
import { dayShort, scoreText } from './hub-format';
import type { ExamFamily, HubSection, ProgressAttempt } from './hub-types';

export interface SkillRow { key: string; title: string; last: string; best: string; delta: number | null }

const sectionKeys = (sections: HubSection[], list: ProgressAttempt[]) => {
  const keys = sections.filter((s) => s.available).map((s) => s.key);
  for (const a of list) for (const k of Object.keys(a.sections)) if (!keys.includes(k) && a.sections[k] != null) keys.push(k);
  return keys.filter((k) => list.some((a) => a.sections[k] != null));
};

export const titleOf = (sections: HubSection[], key: string) =>
  sections.find((s) => s.key === key)?.title ?? key[0]!.toUpperCase() + key.slice(1);

export function progressFacts(list: ProgressAttempt[], sections: HubSection[], family: ExamFamily) {
  const keys = sectionKeys(sections, list);
  const skills: SkillRow[] = keys.map((k) => {
    const vals = list.map((a) => a.sections[k]).filter((v): v is number => v != null);
    const last = vals[vals.length - 1]!;
    const prev = vals.length > 1 ? vals[vals.length - 2]! : null;
    return { key: k, title: titleOf(sections, k), last: scoreText(family, last)!, best: scoreText(family, Math.max(...vals))!, delta: prev == null ? null : last - prev };
  });

  let best: { title: string; v: number } | null = null;
  for (const k of keys) {
    const v = Math.max(...list.map((a) => a.sections[k] ?? -Infinity));
    if (!best || v > best.v) best = { title: titleOf(sections, k), v };
  }
  const lastAt = list.length ? list[list.length - 1]!.at : null;
  const up = skills.filter((s) => s.delta != null && s.delta > 0).sort((a, b) => (b.delta ?? 0) - (a.delta ?? 0))[0];
  return {
    keys,
    skills,
    count: list.length,
    best: best ? `${best.title} ${scoreText(family, best.v)}` : '—',
    last: lastAt ? `${dayShort(lastAt)} · Mock #${list.length}` : '—',
    lastUp: up ? { section: up.title, delta: `+${scoreText(family, up.delta!)}` } : null,
  };
}

/** Series for one section: Mock #n is the attempt's place in the whole history. */
export function series(list: ProgressAttempt[], key: string) {
  return list
    .map((a, i) => ({ n: i + 1, at: a.at, v: a.sections[key] }))
    .filter((p): p is { n: number; at: string; v: number } => p.v != null);
}
