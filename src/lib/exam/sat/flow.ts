/**
 * Digital SAT flow rules on top of the generic stage engine (sat.md §2.1, §4):
 * R&W m1 → m2 → break → Math m1 → m2. Module 2, the break and Math Module 1
 * start by themselves (no intro, 1.5 s handoff — design D-13): in Bluebook the
 * Math module begins the moment the 10-minute break ends, so the student never
 * waits on a timer-less "Start Math" screen (Malika's review, 2026-10-11).
 */
import type { ExamConfig, StageBrief, StageCfg } from '../types';

export const isSat = (c: ExamConfig | null | undefined) => c?.family === 'SAT';

const mainStages = (stages: StageBrief[]) => stages.filter((x) => !x.separateSitting);

/** 1-based module number of a question stage inside its section (break stages don't count). */
export function moduleNo(stages: StageBrief[], stageKey: string | null | undefined): number {
  const st = stages.find((x) => x.stageKey === stageKey);
  if (!st) return 1;
  const mods = mainStages(stages).filter((x) => x.sectionKey === st.sectionKey && x.kind !== 'break');
  return Math.max(1, mods.findIndex((x) => x.stageKey === stageKey) + 1);
}

/** 1-based section number (sections, not stages — the break would shift stage counts). */
export function sectionNo(cfg: ExamConfig | null, sectionKey: string | undefined): { n: number; m: number } {
  const list = (cfg?.sections ?? []).filter((x) => !x.separate_sitting).sort((a, b) => a.order - b.order);
  return { n: Math.max(1, list.findIndex((x) => x.key === sectionKey) + 1), m: list.length };
}

/** The last stage that was locked before `stageKey` (the one just submitted). */
export function prevLocked(stages: StageBrief[], stageKey: string | null | undefined): StageBrief | null {
  const main = mainStages(stages);
  const i = main.findIndex((x) => x.stageKey === stageKey);
  const before = (i < 0 ? main : main.slice(0, i)).filter((x) => x.status === 'LOCKED');
  return before[before.length - 1] ?? null;
}

/** Does the next stage start without its intro screen? (break → yes; Module 2 → yes; after the break → yes) */
export function autoStarts(stages: StageBrief[], stageKey: string | null | undefined): boolean {
  const nx = stages.find((x) => x.stageKey === stageKey);
  if (!nx) return false;
  if (nx.kind === 'break') return true;
  const prev = prevLocked(stages, stageKey);
  if (!prev) return false;
  if (prev.kind === 'break') return true;
  return prev.sectionKey === nx.sectionKey;
}

export const hasCalculator = (cfg: StageCfg | null | undefined) => !!cfg?.tools_extra?.includes('graphing_calculator');
export const hasReference = (cfg: StageCfg | null | undefined) => !!cfg?.tools_extra?.includes('reference_sheet');

/** "Estimated" band around a scaled SAT score (contract §1b: ±range_delta, 30 by default),
 *  section 200–800; the total is the sum of the section bands. */
export function satRange(scaled: number, delta = 30, lo = 200, hi = 800): [number, number] {
  return [Math.max(lo, scaled - delta), Math.min(hi, scaled + delta)];
}
