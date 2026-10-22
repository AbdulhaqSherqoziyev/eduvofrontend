/**
 * Device copy of Speaking audio is temporary (privacy, spec §1.2 M15): it exists only until the server has it.
 * Wiped when the stage is submitted, when the result is read (stage no longer pending), and when the learner
 * deletes the recording; a boot sweep drops anything older than 7 days.
 */
import { deleteRecs, sweepRecs } from './idb';
import { clearSpeakingLocal } from './local';

export async function forgetSpeakingDevice(attemptId: string): Promise<void> {
  try { await deleteRecs(attemptId); } catch { /* IndexedDB unavailable — nothing stored */ }
  clearSpeakingLocal(attemptId);
}

let swept = false;
export function sweepSpeakingDevice(): void {
  if (swept || typeof indexedDB === 'undefined') return;
  swept = true;
  void sweepRecs().catch(() => undefined);
}
