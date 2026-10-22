'use client';
/**
 * Microphone loss and resume (spec §1.6, contract §4a). First loss on an item: its partial recording
 * stays on the device as a backup, the stage clock is held, and after reconnecting the item starts
 * again (server extends the deadline). Second loss (or no restart left): the partial recording is the
 * answer and the test continues with the next item. A reload is handled the same way at boot.
 */
import { useCallback, useRef, useState } from 'react';
import { examApi } from '../api';
import { useExam } from '../engine/context';
import { serverNow } from '../engine/clock';
import type { SpeakingItem } from '../speaking-types';
import { getRec, markRec, putRec, recId, type RecRow } from './idb';
import type { ItemRecorder } from './item-recorder';
import { patchSpeakingLocal, speakingLocal } from './local';
import type { Playing } from './prompt-audio';
import { queueFor } from './queue';
import type { MicError } from './recorder';
import type { ResumePoint } from './resume';
import type { SpPhase } from './use-speaking-flow';

export interface LostState { used: boolean; initial: boolean; err: MicError | null; offline: boolean; busy: boolean }
interface Deps {
  phase: SpPhase; item: SpeakingItem | null; idx: number; stageKey: string;
  rec: React.MutableRefObject<ItemRecorder | null>; gen: React.MutableRefObject<number>; playing: React.MutableRefObject<Playing | null>;
  mic: { open: () => Promise<{ ok: true } | { ok: false; err: MicError }> };
  enter: (i: number) => Promise<void>; setPhase: (p: SpPhase) => void; setIdx: (i: number) => void;
}

export function useLost() {
  const { s, dispatch, holdDeadline, timeOut } = useExam();
  const id = s.attemptId;
  const deps = useRef<Deps | null>(null);
  const at = useRef<string | null>(null);
  const done = useRef(false);
  const [state, setState] = useState<LostState | null>(null);
  const isUsed = (k: string) => s.spRestarted.includes(k) || speakingLocal(id).restarted.includes(k);
  const markDone = (k: string) => patchSpeakingLocal(id, { done: [...speakingLocal(id).done, k] });
  const submitRow = async (row: RecRow) => { const fin = { ...row, id: recId(id, row.itemKey), backup: false, state: 'final' as const, updatedAt: Date.now() }; await putRec(fin); queueFor(id).add(fin); markDone(row.itemKey); };

  const trigger = useCallback(async () => {
    const d = deps.current;
    if (!d || state || ['boot', 'finishing', 'mic_lost'].includes(d.phase)) return;
    d.gen.current += 1;
    d.playing.current?.stop();
    holdDeadline(true);
    at.current = new Date(serverNow()).toISOString();
    done.current = d.phase === 'saving' || d.phase === 'saved';
    const used = !!d.item?.records && isUsed(d.item.itemKey);
    const r = d.rec.current;
    d.rec.current = null;
    if (r && !done.current) {
      if (used) await submitRow(await r.stop('final'));
      else {
        // contract v1.2 §4a order: the partial goes up as `kind=backup` BEFORE the restart
        const b = await r.stop('final', true);
        await markRec(recId(id, d.item!.itemKey), 'dropped');
        if (b.chunks.length) queueFor(id).add(b);
      }
    }
    setState({ used, initial: false, err: null, offline: false, busy: false });
    d.setPhase('mic_lost');
  }, [state, holdDeadline, id]); // eslint-disable-line react-hooks/exhaustive-deps

  /** Restart `item` on the server (once); returns where to continue. */
  const restart = async (item: SpeakingItem, reason: 'mic_lost' | 'page_reload', idx: number, partial: RecRow | null): Promise<number | 'offline' | 'locked'> => {
    if (partial && partial.chunks.length) {
      const b = { ...partial, id: recId(id, item.itemKey, true), backup: true, state: 'final' as const, updatedAt: Date.now() };
      await putRec(b);
      await markRec(partial.id, 'dropped');
      queueFor(id).add(b);
    }
    await queueFor(id).settled(recId(id, item.itemKey, true), 15_000);
    const r = await examApi.restartItem(id, deps.current?.stageKey ?? 'speaking', item.itemKey, { reason, ...(at.current && reason === 'mic_lost' ? { interruptedAt: at.current } : {}) });
    if (r.ok) {
      dispatch({ t: 'DEADLINE', stageKey: r.data.stage.stageKey, deadlineAt: r.data.stage.deadlineAt ?? '' });
      patchSpeakingLocal(id, { restarted: [...speakingLocal(id).restarted, item.itemKey] });
      return idx;
    }
    if (r.code === 'RESTART_LIMIT') {
      const keep = await getRec(recId(id, item.itemKey, true));
      if (keep && keep.chunks.length) await submitRow(keep);
      return idx + 1;
    }
    if (r.code === 'ALREADY_RECORDED') return idx + 1;
    if (r.code === 'STAGE_LOCKED') return 'locked';
    return r.kind === 'network' ? 'offline' : idx;
  };

  const reconnect = useCallback(async () => {
    const d = deps.current;
    if (!d || !state) return;
    setState({ ...state, busy: true, err: null, offline: false });
    const m = await d.mic.open();
    if (!m.ok) { setState({ ...state, busy: false, err: m.err }); return; }
    let to: number | 'offline' | 'locked' = d.idx;
    if (state.initial || !d.item?.records) to = d.idx;
    else if (done.current || state.used) to = d.idx + 1;
    else to = await restart(d.item, 'mic_lost', d.idx, null);
    if (to === 'offline') { setState({ ...state, busy: false, offline: true }); return; }
    holdDeadline(false);
    setState(null);
    if (to === 'locked') { void timeOut(); return; }
    void d.enter(to);
  }, [state, holdDeadline, timeOut]); // eslint-disable-line react-hooks/exhaustive-deps

  const boot = useCallback(async (a: { rp: ResumePoint; micOk: boolean; micErr: MicError | null; items: SpeakingItem[] }) => {
    const d = deps.current;
    if (!d) return;
    let to = a.rp.idx;
    const cur = a.items[a.rp.idx];
    if (cur && a.rp.interrupted === cur.itemKey) {
      if (a.rp.used) { if (a.rp.partial) await submitRow(a.rp.partial); to = a.rp.idx + 1; }
      else { const r = await restart(cur, 'page_reload', a.rp.idx, a.rp.partial); to = typeof r === 'number' ? r : a.rp.idx; if (r === 'locked') { void timeOut(); return; } }
    }
    if (!a.micOk) { d.setIdx(to); holdDeadline(true); setState({ used: false, initial: true, err: a.micErr, offline: false, busy: false }); d.setPhase('mic_lost'); return; }
    void d.enter(to);
  }, [holdDeadline, timeOut]); // eslint-disable-line react-hooks/exhaustive-deps

  const bind = (x: Deps) => { deps.current = x; };
  return { state, trigger, reconnect, boot, bind };
}
