/**
 * Microphone level verdict (spec §1.1-b). Defaults — tuned later from live statistics:
 * mean speech level < −42 dBFS → quiet, > 2 % clipped samples → loud (distorted),
 * no signal at all → quiet (blameless wording, never "microphone not found").
 */
export const LEVEL = { quietDb: -42, silenceDb: -60, clipShare: 0.02 };
export type Verdict = 'ok' | 'quiet' | 'loud';

export function judge(dbs: number[], clipShares: number[]): Verdict {
  const speech = dbs.filter((d) => d > LEVEL.silenceDb);
  if (!speech.length) return 'quiet';
  const clip = clipShares.reduce((a, b) => a + b, 0) / Math.max(1, clipShares.length);
  if (clip > LEVEL.clipShare) return 'loud';
  const mean = speech.reduce((a, b) => a + b, 0) / speech.length;
  return mean < LEVEL.quietDb ? 'quiet' : 'ok';
}
