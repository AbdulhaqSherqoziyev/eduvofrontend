/**
 * Result polling interval (contract §4: 10 s while grading). A PARTIAL result that only waits for the learner
 * to take Speaking later (7-day / assignment window) polls slowly — every request re-signs the audio URLs.
 */
export function resultPollMs(r: { status?: string; sections?: { status: string }[]; speaking?: { status: string } | null } | null | undefined, fast = 10_000): number | false {
  if (!r || r.status !== 'PARTIAL') return false;
  const grading = (r.sections ?? []).some((s) => s.status === 'GRADING') || ['received', 'transcribing', 'scoring'].includes(r.speaking?.status ?? '');
  return grading ? fast : 60_000;
}
