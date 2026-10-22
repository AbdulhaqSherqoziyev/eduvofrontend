'use client';
/**
 * Speaking item sequencer (spec §1.0): examiner_line → listen → reveal → 3-2-1 (+pre-roll) →
 * recording → saving → saved (1 s) → next; Part 2: listen → prep (60 s, "I'm ready") → 3-2-1 → 120 s.
 * Repeat ×1 (listen..countdown), Finish answer after `minResponseSec ?? 5`, microphone loss
 * (restart the item once — contract §4a), resume (resume.ts), end-of-section upload wait.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { useExam } from '../engine/context';
import type { SpeakingStageContent } from '../speaking-types';
import { ItemRecorder } from './item-recorder';
import { patchSpeakingLocal, speakingLocal } from './local';
import { playPrompt, type Playing } from './prompt-audio';
import { queueFor } from './queue';
import { resumePoint } from './resume';
import { useMic } from './use-mic';
import { useLost } from './use-lost';
import { usePhaseClock } from './use-phase-clock';

export type SpPhase = 'boot' | 'line' | 'listen' | 'reveal' | 'prep' | 'countdown' | 'recording' | 'saving' | 'saved' | 'mic_lost' | 'finishing';
export const REVEAL_MS = 600;
export const COUNTDOWN_MS = 3000;
const SAVED_MS = 1000;
const LINE_HOLD_MS = 1200;

export function useSpeakingFlow(c: SpeakingStageContent) {
  const ctl = useExam();
  const { s, stage } = ctl;
  const id = s.attemptId;
  const stageKey = stage?.stageKey ?? 'speaking';
  const [idx, setIdx] = useState(0);
  const [phase, setPhaseRaw] = useState<SpPhase>('boot');
  const [audioDone, setAudioDone] = useState(false);
  const [repeated, setRepeated] = useState<string[]>(() => speakingLocal(id).repeated);
  const clock = usePhaseClock();
  const gen = useRef(0);
  const playing = useRef<Playing | null>(null);
  const rec = useRef<ItemRecorder | null>(null);
  const item = c.items[idx] ?? null;
  queueFor(id).audioOnly = s.ui.audioOnly || c.promptDisplay === 'audio_only';
  const { reset } = clock;
  const setPhase = useCallback((p: SpPhase) => { setPhaseRaw(p); reset(); }, [reset]);
  const lost = useLost();
  const mic = useMic(() => lost.trigger());

  const enter = useCallback(async (i: number) => {
    const g = ++gen.current;
    playing.current?.stop();
    setIdx(i);
    setAudioDone(false);
    const it = c.items[i];
    if (!it) { setPhase('finishing'); return; }
    if (it.records) patchSpeakingLocal(id, { cur: it.itemKey });
    setPhase(it.kind === 'examiner_line' ? 'line' : 'listen');
    const p = playPrompt(it.promptAudioAssetId, s.media, s.ui.volume);
    playing.current = p;
    await p.done;
    if (g !== gen.current) return;
    setAudioDone(true);
    if (it.kind === 'examiner_line') {
      await new Promise((r) => setTimeout(r, s.ui.audioOnly ? 400 : LINE_HOLD_MS));
      if (g === gen.current) void enter(i + 1);
      return;
    }
    setPhase(it.kind === 'cue_card' ? 'prep' : 'reveal');
  }, [c.items, id, s.media, s.ui.volume, s.ui.audioOnly, setPhase]);

  const startCountdown = useCallback(() => {
    if (!item || !mic.stream || !mic.meter.current) return;
    rec.current = new ItemRecorder(mic.stream, mic.meter.current, { attemptId: id, stageKey, itemKey: item.itemKey });
    rec.current.preRoll();
    setPhase('countdown');
  }, [item, mic.stream, mic.meter, id, stageKey, setPhase]);

  const saveAnswer = useCallback(async () => {
    const r = rec.current;
    if (!r || !item) return;
    const g = gen.current;
    setPhase('saving');
    const row = await r.stop('final');
    rec.current = null;
    queueFor(id).add(row);
    patchSpeakingLocal(id, { done: [...speakingLocal(id).done, item.itemKey] });
    if (g !== gen.current) return;
    setPhase('saved');
    await new Promise((res) => setTimeout(res, SAVED_MS));
    if (g === gen.current) void enter(idx + 1);
  }, [item, id, idx, enter, setPhase]);

  // timed transitions
  const el = clock.elapsedMs;
  useEffect(() => {
    if (!item) return;
    if (phase === 'reveal' && el >= REVEAL_MS) startCountdown();
    else if (phase === 'prep' && el >= item.prepSec * 1000) startCountdown();
    else if (phase === 'countdown' && el >= COUNTDOWN_MS) {
      rec.current?.go();
      (document.activeElement as HTMLElement | null)?.blur?.(); // focus hygiene: nothing to "Enter" by accident
      setPhase('recording');
    } else if (phase === 'recording' && (rec.current?.elapsed() ?? 0) >= item.responseSec) void saveAnswer();
  }, [el, phase, item, startCountdown, saveAnswer, setPhase]);

  const repeat = useCallback(() => {
    if (!item || repeated.includes(item.itemKey) || (phase !== 'reveal' && phase !== 'countdown')) return;
    rec.current?.cancel();
    rec.current = null;
    const next = [...repeated, item.itemKey];
    setRepeated(next);
    patchSpeakingLocal(id, { repeated: next });
    (document.activeElement as HTMLElement | null)?.blur?.();
    void enter(idx);
  }, [item, repeated, phase, id, idx, enter]);

  const finish = useCallback(() => {
    if (phase !== 'recording' || !item) return;
    if ((rec.current?.elapsed() ?? 0) < (item.minResponseSec ?? 5)) return;
    void saveAnswer();
  }, [phase, item, saveAnswer]);

  const ready = useCallback(() => {
    if (phase !== 'prep') return;
    (document.activeElement as HTMLElement | null)?.blur?.();
    startCountdown();
  }, [phase, startCountdown]);

  // boot: open the mic, find the resume point, restart an interrupted item if allowed
  useEffect(() => {
    let dead = false;
    (async () => {
      const m = await mic.open();
      const rp = await resumePoint(id, c, s.spRecorded, s.spRestarted);
      void queueFor(id, (ok) => ctl.dispatch(ok ? { t: 'SYNCED', sent: {}, at: Date.now() } : { t: 'SYNC_FAIL', at: Date.now() })).restore();
      if (dead) return;
      void lost.boot({ rp, micOk: m.ok, micErr: m.ok ? null : m.err, items: c.items });
    })();
    return () => { dead = true; gen.current += 1; playing.current?.stop(); void rec.current?.stop('final').then((row) => queueFor(id).add(row)); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  lost.bind({ phase, item, idx, rec, gen, playing, mic, enter, setPhase, setIdx, stageKey });
  return { c, idx, item, phase, audioDone, clock, repeatUsed: !!item && repeated.includes(item.itemKey), mic, lost: lost.state, reconnect: lost.reconnect, repeat, finish, ready, recElapsed: () => rec.current?.elapsed() ?? 0 };
}

export type SpeakingFlow = ReturnType<typeof useSpeakingFlow>;
