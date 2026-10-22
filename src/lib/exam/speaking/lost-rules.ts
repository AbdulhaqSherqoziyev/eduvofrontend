/**
 * Where Speaking continues after an interruption (spec §1.6, contract §4a) — pure, unit-tested.
 * The one restart per item is spent ONLY when a recording was actually running: an interruption while the
 * question plays / during Part 2 prep (nothing recorded yet) returns to the same question for free.
 * 'same' = enter the same item again · 'next' = the item is over · 'restart' = ask the server to restart it.
 */
export type AfterLoss = 'same' | 'next' | 'restart';

/** Microphone lost during the stage. `recording` = a recorder was running (3-2-1 pre-roll or the answer). */
export function afterMicLoss(a: { initial: boolean; records: boolean; saved: boolean; recording: boolean; used: boolean }): AfterLoss {
  if (a.initial || !a.records) return 'same';
  if (a.saved) return 'next';
  if (!a.recording) return 'same';
  return a.used ? 'next' : 'restart';
}

/** Page reloaded while on an item. `partial` = a recording of it is on the device. */
export function afterReload(a: { used: boolean; partial: boolean }): AfterLoss {
  if (!a.partial) return 'same';
  return a.used ? 'next' : 'restart';
}
