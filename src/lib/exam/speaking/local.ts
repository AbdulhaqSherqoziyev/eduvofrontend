/**
 * Speaking device state (localStorage, same `eduvo_exam:` prefix as storage.ts):
 * "take Speaking later" choice, the item cursor, Repeat use, Part 2 notes (spec §1.4 "uiState"
 * — never sent to the server), and items restarted on this device.
 */
const P = 'eduvo_exam:';
function read<T>(key: string, fallback: T): T {
  try { const raw = window.localStorage.getItem(P + key); return raw ? (JSON.parse(raw) as T) : fallback; } catch { return fallback; }
}
function write(key: string, v: unknown) {
  try { if (v === null) window.localStorage.removeItem(P + key); else window.localStorage.setItem(P + key, JSON.stringify(v)); } catch { /* private mode */ }
}

export interface SpeakingLocal {
  /** itemKey being answered (resume lands here). */
  cur: string | null;
  /** items whose one Repeat was used. */
  repeated: string[];
  /** items restarted (mic loss / reload) — mirrors server `itemRestarts`. */
  restarted: string[];
  /** items whose recording is final (saved on device or uploaded). */
  done: string[];
  notes: string;
}
const EMPTY: SpeakingLocal = { cur: null, repeated: [], restarted: [], done: [], notes: '' };

export const speakingLater = (id: string) => read<boolean>(`${id}:speaking_later`, false);
export const setSpeakingLater = (id: string, on: boolean) => write(`${id}:speaking_later`, on ? true : null);

export const speakingLocal = (id: string): SpeakingLocal => ({ ...EMPTY, ...read<Partial<SpeakingLocal>>(`${id}:speaking`, {}) });
export function patchSpeakingLocal(id: string, patch: Partial<SpeakingLocal>): SpeakingLocal {
  const next = { ...speakingLocal(id), ...patch };
  write(`${id}:speaking`, next);
  return next;
}
export const clearSpeakingLocal = (id: string) => write(`${id}:speaking`, null);
