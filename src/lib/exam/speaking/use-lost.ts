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
import type { SpeakingItem } from '../speaking-types';
import { getRec, markRec, putRec, recId, type RecRow } from './idb';
import type { ItemRecorder } from './item-recorder';
import { patchSpeakingLocal, speakingLocal } from './local';
import type { Playing } from './prompt-audio';
import { afterMicLoss, afterReload, MAX_STAGE_RESTARTS } from './lost-rules';
import { queueFor } from './queue';
import type { MicError } from './recorder';
import type { ResumePoint } from './resume';
import type { SpPhase } from './use-speaking-flow';

export interface LostState {
  used: boolean; initial: boolean; err: MicError | null; offline: boolean; busy: boolean;
  /** something of this question was recorded (→ "what you recorded is saved"); unstable = restarts used up */
  partial?: boolean; unstable?: boolean;
}

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
  const done = useRef(false);
  const recording = useRef(false);
  const [state, setState] = useState<LostState | null>(null);
  const restartedAll = () => new Set([...s.spRestarted, ...speakingLocal(id).restarted]);
  // v1.5: one restart per item AND at most 2 per stage (MAX_STAGE_RESTARTS) — past that the item ends with its partial
  const isUsed = (k: string) => restartedAll().has(k) || restartedAll().size >= MAX_STAGE_RESTARTS;
  /** "You'll continue from the next question" note after a refused restart (RESTART_LIMIT), ms */
  const [notice, setNotice] = useState<{ at: number; partial: boolean } | null>(null);
  const markDone = (k: string) => patchSpeakingLocal(id, { done: [...speakingLocal(id).done, k] });
  const submitRow = async (row: RecRow) => { const fin = { ...row, id: recId(id, row.itemKey), backup: false, state: 'final' as const, updatedAt: Date.now() }; await putRec(fin); queueFor(id).add(fin); markDone(row.itemKey); };

  /**
   * §4b (v1.5): `pause` only marks the stage (StageBrief.pausedAt — no time-out, uploads wait); `resume` adds the
   * real paused time to the deadline. The upload queue is held in between (409 STAGE_PAUSED otherwise).
   */
  const pause = (action: 'pause' | 'resume', itemKey?: string) => {
    const sk = deps.current?.stageKey ?? 'speaking';
    if (action === 'pause') queueFor(id).pauseUploads();
    return examApi.pauseStage(id, sk, { action, itemKey, reason: 'mic_lost' }).then((r) => {
      if (r.ok && r.data.stage.deadlineAt) dispatch({ t: 'DEADLINE', stageKey: r.data.stage.stageKey, deadlineAt: r.data.stage.deadlineAt, pausedAt: r.data.stage.pausedAt ?? null });
      if (action === 'resume' && (r.ok || r.kind !== 'network')) queueFor(id).resumeUploads();
      else if (!r.ok) console.warn('[speaking] pause', action, r.status, r.code); // PAUSE_LIMIT / offline: the client hold still applies
      return r;
    });
  };

  const trigger = useCallback(async () => {
    const d = deps.current;
    if (!d || state || ['boot', 'finishing', 'mic_lost'].includes(d.phase)) return;
    d.gen.current += 1;
    d.playing.current?.stop();
    holdDeadline(true);
    void pause('pause', d.item?.itemKey);
    done.current = d.phase === 'saving' || d.phase === 'saved';
    const r = d.rec.current;
    recording.current = !!r && !done.current;
    // the item's restart only counts when a recording was running (lost-rules.ts)
    const used = !!d.item?.records && recording.current && isUsed(d.item.itemKey);
    d.rec.current = null;
    let partial = false;
    if (r && !done.current) {
      if (used) { const row = await r.stop('final'); partial = row.chunks.length > 0; await submitRow(row); }
      else {
        // v1.5 §4a: pause → (after reconnect) the partial as `kind=backup` → restart. Only a PARTIAL take is a
        // backup (shorter than the answer time); a take that already reached it is the answer itself.
        const b = await r.stop('final', true);
        await markRec(recId(id, d.item!.itemKey), 'dropped');
        if (b.durationMs >= d.item!.responseSec * 1000) await submitRow(b);
        else if (b.chunks.length) queueFor(id).add(b); // held until resume
      }
    }
    setState({ used, initial: false, err: null, offline: false, busy: false, partial, unstable: used && restartedAll().size >= MAX_STAGE_RESTARTS });
    d.setPhase('mic_lost');
  }, [state, holdDeadline, id]); // eslint-disable-line react-hooks/exhaustive-deps

  /** Restart `item` on the server (once); returns where to continue. */
  const restart = async (item: SpeakingItem, reason: 'mic_lost' | 'page_reload', idx: number, partial: RecRow | null): Promise<number | 'offline' | 'locked'> => {
    if (partial && partial.chunks.length && partial.durationMs < item.responseSec * 1000) {
      const b = { ...partial, id: recId(id, item.itemKey, true), backup: true, state: 'final' as const, updatedAt: Date.now() };
      await putRec(b);
      await markRec(partial.id, 'dropped');
      queueFor(id).add(b);
    }
    await queueFor(id).settled(recId(id, item.itemKey, true), 15_000);
    const r = await examApi.restartItem(id, deps.current?.stageKey ?? 'speaking', item.itemKey, { reason }); // v1.5: the pause measures the gap
    if (r.ok) {
      dispatch({ t: 'DEADLINE', stageKey: r.data.stage.stageKey, deadlineAt: r.data.stage.deadlineAt ?? '' });
      patchSpeakingLocal(id, { restarted: [...speakingLocal(id).restarted, item.itemKey] });
      return idx;
    }
    if (r.code === 'RESTART_LIMIT') {
      // stage limit (2) or budget spent: the partial is this item's answer, the test goes on — blameless note
      const keep = await getRec(recId(id, item.itemKey, true));
      if (keep && keep.chunks.length) await submitRow(keep);
      setNotice({ at: Date.now(), partial: !!keep && keep.chunks.length > 0 });
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
    const rule = afterMicLoss({ initial: state.initial, records: !!d.item?.records, saved: done.current, recording: recording.current, used: state.used });
    let to: number | 'offline' | 'locked' = rule === 'next' ? d.idx + 1 : d.idx;
    const resumed = await pause('resume', d.item?.itemKey); // the real pause goes on the deadline first
    if (rule === 'restart' && d.item) to = await restart(d.item, 'mic_lost', d.idx, null);
    else if (!resumed.ok && resumed.kind === 'network') to = 'offline';
    if (to === 'offline') { setState({ ...state, busy: false, offline: true }); return; }
    holdDeadline(false);
    setState(null);
    if (to === 'locked') { void timeOut(); return; }
    void d.enter(to);
  }, [state, holdDeadline, timeOut]); // eslint-disable-line react-hooks/exhaustive-deps

  const boot = useCallback(async (a: { rp: ResumePoint; micOk: boolean; micErr: MicError | null; items: SpeakingItem[]; pausedAt?: string | null }) => {
    const d = deps.current;
    if (!d) return;
    let to = a.rp.idx;
    const cur = a.items[a.rp.idx];
    // v1.5: reopened while the stage is paused → resume first (real paused time goes on the deadline, uploads go on)
    if (a.pausedAt) await pause('resume', cur?.itemKey);
    if (cur && a.rp.interrupted === cur.itemKey) {
      const rule = afterReload({ used: a.rp.used, partial: !!a.rp.partial });
      if (rule === 'next') { await submitRow(a.rp.partial!); to = a.rp.idx + 1; }
      else if (rule === 'restart') { const r = await restart(cur, 'page_reload', a.rp.idx, a.rp.partial); to = typeof r === 'number' ? r : a.rp.idx; if (r === 'locked') { void timeOut(); return; } }
    }
    if (!a.micOk) { d.setIdx(to); holdDeadline(true); void pause('pause', cur?.itemKey); setState({ used: false, initial: true, err: a.micErr, offline: false, busy: false }); d.setPhase('mic_lost'); return; }
    void d.enter(to);
  }, [holdDeadline, timeOut]); // eslint-disable-line react-hooks/exhaustive-deps

  const bind = (x: Deps) => { deps.current = x; };
  return { state, trigger, reconnect, boot, bind, notice };
}
