'use client';
/**
 * Per-module SAT tool state (sat.md §6): option eliminator (kept per question on
 * this device, sat.md §6.4), calculator / reference / navigator / review page,
 * line reader and in-app zoom. Lives as long as one module is mounted — Mark
 * for Review and annotations never carry over to the next module (§4).
 */
import { createContext, useCallback, useContext, useEffect, useState } from 'react';

const KEY = (attemptId: string) => `eduvo_exam:${attemptId}:elim`;
type Elim = Record<string, string[]>;

function readElim(attemptId: string): Elim {
  try { return JSON.parse(window.localStorage.getItem(KEY(attemptId)) ?? '{}') as Elim; } catch { return {}; }
}

/** Drop the crossed-out options once the attempt is over (complete / results) — nothing to resume any more. */
export function clearSatElim(attemptId: string): void {
  try { window.localStorage.removeItem(KEY(attemptId)); } catch { /* ignore */ }
}

export const ZOOMS = [1, 1.25, 1.5, 1.75, 2];

export function useSatToolsState(attemptId: string) {
  const [elim, setElim] = useState<Elim>(() => readElim(attemptId));
  const [elimOn, setElimOn] = useState(false);
  const [calc, setCalc] = useState(false);
  const [ref, setRef] = useState(false);
  const [grid, setGrid] = useState(false);
  const [review, setReview] = useState(false);
  const [lineReader, setLineReader] = useState(false);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    try { window.localStorage.setItem(KEY(attemptId), JSON.stringify(elim)); } catch { /* quota / private mode */ }
  }, [attemptId, elim]);

  const toggleElim = useCallback((qid: string, key: string) => setElim((e) => {
    const cur = e[qid] ?? [];
    return { ...e, [qid]: cur.includes(key) ? cur.filter((k) => k !== key) : [...cur, key] };
  }), []);
  /** Choosing a crossed-out option un-crosses it (sat.md §6.4 estimated). */
  const unElim = useCallback((qid: string, key: string) => setElim((e) => (e[qid]?.includes(key) ? { ...e, [qid]: e[qid].filter((k) => k !== key) } : e)), []);

  return {
    elim, elimOn, setElimOn, toggleElim, unElim,
    calc, setCalc, ref, setRef, grid, setGrid, review, setReview,
    lineReader, setLineReader, zoom, setZoom,
  };
}

export type SatTools = ReturnType<typeof useSatToolsState>;
export const SatToolsContext = createContext<SatTools | null>(null);

export function useSatTools(): SatTools {
  const c = useContext(SatToolsContext);
  if (!c) throw new Error('useSatTools must be used inside <SatToolsContext.Provider>');
  return c;
}
