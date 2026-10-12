'use client';
/**
 * Autosave (contract §1.6): device copy is written synchronously by the
 * controller; this hook batches dirty answers → PUT after 2 s of quiet,
 * heartbeats every 30 s, retries every 5 s while offline, flushes with
 * keepalive on pagehide and stops on 409 STAGE_LOCKED.
 */
import { useCallback, useEffect, useRef } from 'react';
import { examApi } from '../api';
import type { AnswerValue } from '../types';
import type { Action } from './reducer';

interface Opts { attemptId: string; stageKey: string | null; active: boolean; dispatch: (a: Action) => void; onLocked: () => void }

export function useAutosave({ attemptId, stageKey, active, dispatch, onLocked }: Opts) {
  const dirty = useRef(new Map<string, { value: AnswerValue; seq: number }>());
  const timer = useRef<number | null>(null);
  const inflight = useRef<Promise<boolean> | null>(null);
  const lastSent = useRef(0);
  const live = useRef({ attemptId, stageKey, active, onLocked });
  live.current = { attemptId, stageKey, active, onLocked };

  const flush = useCallback(async (): Promise<boolean> => {
    if (inflight.current) await inflight.current;
    const { attemptId: id, stageKey: sk, active: on } = live.current;
    if (!sk || !on) return true;
    if (timer.current) { window.clearTimeout(timer.current); timer.current = null; }
    const batch = Array.from(dirty.current.entries()).slice(0, 200);
    const run = (async () => {
      lastSent.current = Date.now();
      const r = await examApi.saveAnswers(id, { stageKey: sk, answers: batch.map(([questionId, a]) => ({ questionId, value: a.value, uiState: null, clientSeq: a.seq })) });
      if (r.ok) {
        const sent: Record<string, number> = {};
        for (const [qid, a] of batch) {
          sent[qid] = a.seq;
          if (dirty.current.get(qid)?.seq === a.seq) dirty.current.delete(qid);
        }
        dispatch({ t: 'SYNCED', sent, at: Date.now() });
        dispatch({ t: 'DEADLINE', stageKey: sk, deadlineAt: r.data.deadlineAt });
        if (dirty.current.size) schedule(400);
        return true;
      }
      if (r.kind === 'client' && r.code === 'STAGE_LOCKED') { dirty.current.clear(); live.current.onLocked(); return false; }
      dispatch({ t: 'SYNC_FAIL', at: Date.now() });
      schedule(5000);
      return false;
    })();
    inflight.current = run;
    const ok = await run;
    inflight.current = null;
    return ok;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  const schedule = useCallback((ms: number) => {
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => { timer.current = null; void flush(); }, ms);
  }, [flush]);

  const queue = useCallback((ids: string[], value: AnswerValue, seq: number) => {
    for (const id of ids) dirty.current.set(id, { value, seq });
    schedule(2000);
  }, [schedule]);

  useEffect(() => {
    if (!active || !stageKey) return;
    const hb = window.setInterval(() => { if (Date.now() - lastSent.current > 29_000) void flush(); }, 5000);
    const online = () => void flush();
    // a backgrounded / frozen tab (phone app switch) skips heartbeats — catch up the moment it is back
    const visible = () => { if (document.visibilityState === 'visible' && (dirty.current.size || Date.now() - lastSent.current > 29_000)) void flush(); };
    const exit = () => {
      if (!dirty.current.size) return;
      examApi.saveOnExit(attemptId, { stageKey, answers: Array.from(dirty.current.entries()).map(([questionId, a]) => ({ questionId, value: a.value, uiState: null, clientSeq: a.seq })) });
    };
    window.addEventListener('online', online);
    document.addEventListener('visibilitychange', visible);
    window.addEventListener('pagehide', exit);
    return () => {
      window.clearInterval(hb);
      window.removeEventListener('online', online);
      document.removeEventListener('visibilitychange', visible);
      window.removeEventListener('pagehide', exit);
    };
  }, [active, stageKey, attemptId, flush]);

  const pending = useCallback(() => dirty.current.size, []);
  return { queue, flush, pending };
}
