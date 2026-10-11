/**
 * Device-side copy of everything a student would hate to lose. Written
 * synchronously on every keystroke (contract §1.4: "localStorage sinxron"),
 * so a crash, a closed lid or a dead Wi-Fi never costs an answer.
 * All access is wrapped: private mode / quota just means "network only".
 */
const P = 'eduvo_exam:';

function read<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(P + key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown): void {
  try {
    window.localStorage.setItem(P + key, JSON.stringify(value));
  } catch {
    /* quota / private mode */
  }
}

export interface LocalAnswer { v: unknown; seq: number; synced: boolean }
export type LocalAnswers = Record<string, LocalAnswer>;

export const store = {
  answers: (id: string) => read<LocalAnswers>(`${id}:answers`, {}),
  saveAnswers: (id: string, a: LocalAnswers) => write(`${id}:answers`, a),

  /** One counter per attempt — monotonic for every question, survives reloads. */
  nextSeq(id: string, floor = 0): number {
    const n = Math.max(read<number>(`${id}:seq`, 0), floor) + 1;
    write(`${id}:seq`, n);
    return n;
  },

  flags: (id: string) => read<Record<string, boolean>>(`${id}:flags`, {}),
  saveFlags: (id: string, f: Record<string, boolean>) => write(`${id}:flags`, f),

  highlights: <T>(id: string, stage: string) => read<T[]>(`${id}:hl:${stage}`, []),
  saveHighlights: (id: string, stage: string, h: unknown[]) => write(`${id}:hl:${stage}`, h),
  clearHighlights: (id: string, stage: string) => {
    try {
      window.localStorage.removeItem(`${P}${id}:hl:${stage}`);
    } catch {
      /* ignore */
    }
  },

  ui: <T>(id: string, fallback: T) => read<T>(`${id}:ui`, fallback),
  saveUi: (id: string, ui: unknown) => write(`${id}:ui`, ui),

  integrity: <T>(id: string) => read<T[]>(`${id}:integrity`, []),
  saveIntegrity: (id: string, q: unknown[]) => write(`${id}:integrity`, q),

  /** Stage this device has open — lets resume say "time ended while you were away" (G8). */
  activeStage: (id: string) => read<string | null>(`${id}:active`, null),
  setActiveStage: (id: string, stageKey: string | null) => write(`${id}:active`, stageKey),

  locale: () => read<'en' | 'uz' | null>('locale', null),
  saveLocale: (l: 'en' | 'uz') => write('locale', l),
};
