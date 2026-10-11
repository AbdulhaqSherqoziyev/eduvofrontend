/**
 * Listening audio timeline (pure). Position = serverNow − audioStartedAt, so a
 * reload resumes at the right second and missed audio is never replayed
 * (ielts.md §4.2, cefr.md §4 "audio avtomatik zanjiri").
 *   IELTS: [lead-in 5 s][Part 1][Part 2]…[review → deadline]
 *   CEFR:  per part [prep 20 s][play 1/2][gap 3 s][play 2/2][gap 5 s] … [done]
 */
import type { StageAudioCfg } from '../types';

export type SegKind = 'leadin' | 'prep' | 'play' | 'gap' | 'review' | 'done';
export interface Seg { kind: SegKind; part: number; play: number; start: number; end: number }

export function buildTimeline(durationsMs: number[], cfg: StageAudioCfg | undefined, audioDriven: boolean): Seg[] {
  const plays = Math.max(1, cfg?.play_count ?? 1);
  const prep = (cfg?.pre_prep_sec ?? 0) * 1000;
  const repGap = (cfg?.repeat_gap_sec ?? (plays > 1 ? 3 : 0)) * 1000;
  const partGap = (cfg?.inter_part_gap_sec ?? (plays > 1 ? 5 : 0)) * 1000;
  const leadIn = (cfg?.lead_in_sec ?? (audioDriven ? 5 : 0)) * 1000;
  const segs: Seg[] = [];
  let t = 0;
  const push = (kind: SegKind, part: number, play: number, len: number) => {
    if (len <= 0) return;
    segs.push({ kind, part, play, start: t, end: t + len });
    t += len;
  };
  push('leadin', 0, 0, leadIn);
  durationsMs.forEach((d, i) => {
    push('prep', i, 0, prep);
    for (let p = 1; p <= plays; p++) {
      push('play', i, p, d);
      if (p < plays) push('gap', i, p, repGap);
    }
    if (i < durationsMs.length - 1) push('gap', i, plays, partGap);
  });
  segs.push({ kind: audioDriven ? 'review' : 'done', part: Math.max(0, durationsMs.length - 1), play: 0, start: t, end: Number.POSITIVE_INFINITY });
  return segs;
}

export function segAt(tl: Seg[], elapsedMs: number): { seg: Seg; offset: number } {
  const e = Math.max(0, elapsedMs);
  const seg = tl.find((s) => e >= s.start && e < s.end) ?? tl[tl.length - 1];
  return { seg, offset: e - seg.start };
}

/** End of the last audio segment — after it, "Finish section" opens (review / after chain). */
export function chainEnd(tl: Seg[]): number {
  return tl[tl.length - 1].start;
}
