'use client';
/** The player's brain: boot/resume, stage start/submit, time-out, answers. UI only calls these. */
import { useCallback, useEffect, useReducer, useRef } from 'react';
import { examApi } from '../api';
import { store } from '../storage';
import type { AnswerValue, StageStartResp } from '../types';
import { useAutosave } from './autosave';
import { useExamHost } from '@/components/exam/host';
import { decideBoot } from './boot';
import { serverNow, useClockSync } from './clock';
import { requestFullscreen, useIntegrity } from './integrity';
import { blobUrlFor, prefetchImages, useMediaPreload } from './media';
import { reducer } from './reducer';
import { flatQuestions, tasksOf } from './selectors';
import { initialState, type Highlight, type UiPrefs } from './state';

export function useExamController(attemptId: string) {
  const [s, dispatch] = useReducer(reducer, attemptId, initialState);
  const { initialLocale, onAttemptCancelled: onCancelled } = useExamHost();
  const live = useRef(s);
  live.current = s;
  const welcomeResp = useRef<StageStartResp | null>(null);
  const timingOut = useRef(false);

  const stage = s.stages.find((x) => x.stageKey === s.stageKey) ?? null;
  const sectionCfg = s.config?.sections.find((x) => x.key === stage?.sectionKey) ?? null;
  const stageCfg = sectionCfg?.stages.find((x) => x.key === stage?.stageKey) ?? sectionCfg?.stages[0] ?? null;

  // ── boot ──
  const boot = useCallback(async () => {
    const r = await examApi.getAttempt(attemptId);
    if (!r.ok) { dispatch({ t: 'FAIL', kind: r.kind, code: r.code }); return; }
    const d = decideBoot(r.data, initialLocale);
    welcomeResp.current = null;
    dispatch({ t: 'BOOTED', data: r.data, answers: d.answers, flags: store.flags(attemptId), ui: d.ui, phase: d.phase, stageKey: d.stageKey, prevSubmitted: d.prevSubmitted, timeEnded: d.timeEnded, resumeSaved: d.resumeSaved });
    if (d.phase === 'welcome' && !d.timeEnded && d.stageKey) {
      const st = await examApi.startStage(attemptId, d.stageKey); // idempotent: same deadline, fresh media URLs
      if (st.ok) { welcomeResp.current = st.data; dispatch({ t: 'PRELOAD', refs: st.data.media }); }
    }
  }, [attemptId, initialLocale]);
  useEffect(() => { void boot(); }, [boot]);

  useClockSync(s.phase !== 'boot' && s.phase !== 'error' && s.phase !== 'auth');
  // running stage's deadline on this device (read by the mock site's signed-out modal)
  const runningDeadline = s.phase === 'section' ? stage?.deadlineAt ?? null : null;
  const betweenStages = s.phase === 'intro' || s.phase === 'timeup' || s.phase === 'complete';
  useEffect(() => {
    if (runningDeadline) store.saveDeadline(attemptId, runningDeadline);
    else if (betweenStages) store.saveDeadline(attemptId, null);
  }, [attemptId, runningDeadline, betweenStages]);

  // ── persistence of prefs/flags/highlights ──
  useEffect(() => { if (s.attempt) store.saveUi(attemptId, s.ui); }, [attemptId, s.ui, s.attempt]);
  useEffect(() => { if (s.attempt) store.saveFlags(attemptId, s.flags); }, [attemptId, s.flags, s.attempt]);
  useEffect(() => { if (s.stageKey && s.phase === 'section') store.saveHighlights(attemptId, s.stageKey, s.highlights); }, [attemptId, s.stageKey, s.highlights, s.phase]);

  const sectionActive = s.phase === 'section';
  const onLocked = useCallback(() => { void timeOut(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const autosave = useAutosave({ attemptId, stageKey: s.stageKey, active: sectionActive, dispatch, onLocked });
  const integrity = useIntegrity({ attemptId, stageKey: s.stageKey, active: ['section', 'intro', 'timeup', 'welcome'].includes(s.phase), dispatch });
  // before a stage: preload its audio while no timer runs; in a section only as a fallback
  // when the backend sent no `preload` (then the timer is already running — Bekzod req).
  const media = useMediaPreload(['precheck', 'intro', 'welcome', 'tryout'].includes(s.phase) ? s.preload : s.phase === 'section' ? s.media : []);
  // images: fetched to blobs in the background (never gating) — before the stage from `preload`,
  // in the stage from `media`, so Task 1 charts / maps survive URL expiry and flaky links.
  useEffect(() => { prefetchImages(s.preload); }, [s.preload]);
  useEffect(() => { prefetchImages(s.media); }, [s.media]);

  // ── answers ──
  const setAnswer = useCallback((ids: string[], value: AnswerValue) => {
    const cur = live.current;
    const floor = Math.max(0, ...ids.map((i) => cur.answers[i]?.seq ?? 0));
    const seq = store.nextSeq(attemptId, floor);
    dispatch({ t: 'ANSWER', ids, value, seq });
    const local = store.answers(attemptId);
    for (const id of ids) local[id] = { v: value, seq, synced: false };
    store.saveAnswers(attemptId, local);
    autosave.queue(ids, value, seq);
  }, [attemptId, autosave]);

  // ── stage start ──
  const beginStage = useCallback(async (): Promise<{ ok: boolean; code?: string; resp?: StageStartResp }> => {
    const cur = live.current;
    if (!cur.stageKey) return { ok: false };
    requestFullscreen();
    let resp = welcomeResp.current;
    if (!resp) {
      const r = await examApi.startStage(attemptId, cur.stageKey);
      if (!r.ok) {
        if (r.code === 'STAGE_LOCKED' || r.code === 'STAGE_NOT_NEXT') void boot();
        return { ok: false, code: r.code ?? r.kind };
      }
      resp = r.data;
    }
    welcomeResp.current = null;
    store.setActiveStage(attemptId, resp.stage.stageKey);
    dispatch({ t: 'STAGE_STARTED', resp, highlights: store.highlights<Highlight>(attemptId, resp.stage.stageKey) });
    // device answers the server has not seen yet → back into the queue
    const ids = new Set([...flatQuestions(resp.content).map((q) => q.id), ...tasksOf(resp.content).map((t) => t.questionId)]);
    for (const [id, a] of Object.entries(cur.answers)) if (!a.synced && ids.has(id)) autosave.queue([id], a.v, a.seq);
    return { ok: true, resp };
  }, [attemptId, autosave, boot]);

  /**
   * Fresh signed media URLs for the running stage. `start` is idempotent (same
   * deadline, new URLs — backend StageStartService), so an <img> whose URL failed
   * or expired can ask again. Single-flight, at most once per 4 s.
   */
  const refreshing = useRef<{ p: Promise<boolean> | null; at: number }>({ p: null, at: 0 });
  const refreshMedia = useCallback(async (): Promise<boolean> => {
    const r0 = refreshing.current;
    if (r0.p) return r0.p;
    if (Date.now() - r0.at < 4000) return false;
    const cur = live.current;
    if (cur.phase !== 'section' || !cur.stageKey) return false;
    const sk = cur.stageKey;
    r0.at = Date.now();
    r0.p = (async () => {
      const r = await examApi.startStage(attemptId, sk);
      if (!r.ok || r.data.stage.stageKey !== sk) return false;
      dispatch({ t: 'MEDIA', stageKey: sk, refs: r.data.media });
      return true;
    })().finally(() => { refreshing.current.p = null; });
    return r0.p;
  }, [attemptId]);

  const nextInfo = useCallback(() => {
    const cur = live.current;
    const i = cur.stages.findIndex((x) => x.stageKey === cur.stageKey);
    const nx = cur.stages.slice(i + 1).find((x) => x.status === 'PENDING' && !x.separateSitting);
    const sec = cur.config?.sections.find((x) => x.key === nx?.sectionKey);
    if (!nx || !sec) return null;
    return { title: sec.title, minutes: Math.round((sec.stages[0]?.timer.duration_sec ?? 0) / 60) };
  }, []);

  // ── submit ──
  const submit = useCallback(async (reason: 'user' | 'timeout') => {
    const cur = live.current;
    if (!cur.stageKey) return false;
    const st = cur.stages.find((x) => x.stageKey === cur.stageKey);
    const title = cur.config?.sections.find((x) => x.key === st?.sectionKey)?.title ?? '';
    const writing = cur.content?.kind === 'writing';
    const next = nextInfo();
    dispatch({ t: 'SUBMITTING', on: true });
    await autosave.flush();
    const r = await examApi.submitStage(attemptId, cur.stageKey, reason);
    if (!r.ok) {
      dispatch({ t: 'SUBMIT_FAIL', error: { status: r.status, code: r.code, message: r.message } });
      dispatch({ t: 'SUBMITTING', on: false });
      if (r.kind === 'network') dispatch({ t: 'SYNC_FAIL', at: Date.now() });
      return false;
    }
    store.clearHighlights(attemptId, cur.stageKey);
    store.setActiveStage(attemptId, null);
    dispatch({ t: 'SUBMITTED', resp: r.data, reason, title, next, writing });
    return true;
  }, [attemptId, autosave, nextInfo]);

  /** Timer reached 0 (or the server said STAGE_LOCKED): neutral Time's-up screen, no modal (T21). */
  const timeOut = useCallback(async () => {
    if (timingOut.current) return;
    timingOut.current = true;
    dispatch({ t: 'TIMEUP_START', next: nextInfo(), writing: live.current.content?.kind === 'writing' });
    while (!(await submit('timeout'))) await new Promise((r) => setTimeout(r, 3000));
    timingOut.current = false;
  }, [nextInfo, submit]);

  useEffect(() => {
    if (!sectionActive || !stage?.deadlineAt) return;
    const dl = Date.parse(stage.deadlineAt);
    const iv = window.setInterval(() => { if (serverNow() >= dl) void timeOut(); }, 250);
    return () => window.clearInterval(iv);
  }, [sectionActive, stage?.deadlineAt, timeOut]);

  const setUi = useCallback((patch: Partial<UiPrefs>) => {
    if (patch.locale) store.saveLocale(patch.locale);
    dispatch({ t: 'UI', patch });
  }, []);

  const reportSkip = useCallback(async () => {
    const started = await beginStage();
    const c = started.resp?.content;
    if (!started.ok || !started.resp || !c || !('parts' in c)) return;
    for (const p of c.parts) {
      if (!p.audioAssetId || blobUrlFor(p.audioAssetId)) continue;
      const r = await examApi.reportSkip(attemptId, started.resp.stage.stageKey, p.part);
      // B2C: too many technical skips closes the attempt without a result (credit comes back)
      if (!r.ok && r.code === 'TOO_MANY_SKIPS' && r.body?.attemptCancelled === true) { onCancelled?.(); return; }
    }
  }, [attemptId, beginStage, onCancelled]);

  return { s, dispatch, stage, sectionCfg, stageCfg, media, setAnswer, beginStage, submit, timeOut, setUi, reportSkip, integrity, boot, refreshMedia };
}

export type ExamCtl = ReturnType<typeof useExamController>;
