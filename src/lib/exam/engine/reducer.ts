import type { AnswerValue, AttemptState, MediaRef, StageStartResp, SubmitResp } from '../types';
import type { AnswerEntry, ExamState, Highlight, Phase, UiPrefs } from './state';
import { firstQuestionId } from './selectors';

export type Action =
  | { t: 'BOOTED'; data: AttemptState; answers: Record<string, AnswerEntry>; flags: Record<string, boolean>; ui: UiPrefs; phase: Phase; stageKey: string | null; prevSubmitted: string | null; timeEnded: string | null; resumeSaved: number }
  | { t: 'FAIL'; kind: string; code?: string }
  | { t: 'PHASE'; phase: Phase }
  | { t: 'STAGE_STARTED'; resp: StageStartResp; highlights: Highlight[] }
  | { t: 'ANSWER'; ids: string[]; value: AnswerValue; seq: number }
  | { t: 'SYNCED'; sent: Record<string, number>; at: number }
  | { t: 'SYNC_FAIL'; at: number }
  | { t: 'DEADLINE'; stageKey: string; deadlineAt: string }
  | { t: 'FLAG'; id: string }
  | { t: 'GOTO'; partIdx: number; q?: string | null }
  | { t: 'UI'; patch: Partial<UiPrefs> }
  | { t: 'MODAL'; modal: ExamState['modal'] }
  | { t: 'HL'; highlights: Highlight[] }
  | { t: 'SUBMITTING'; on: boolean }
  | { t: 'SUBMIT_FAIL'; error: ExamState['submitError'] }
  | { t: 'SUBMITTED'; resp: SubmitResp; reason: 'user' | 'timeout'; title: string; next: { title: string; minutes: number } | null; writing: boolean }
  | { t: 'TIMEUP_START'; next: { title: string; minutes: number } | null; writing: boolean }
  | { t: 'TIMEUP_ACK' }
  | { t: 'PRELOAD'; refs: MediaRef[] }
  | { t: 'FS'; exited: boolean }
  | { t: 'TAB_NOTED'; at: number | null };

export function reducer(s: ExamState, a: Action): ExamState {
  switch (a.t) {
    case 'BOOTED':
      return {
        ...s, attempt: a.data.attempt, config: a.data.config, stages: a.data.stages, answers: a.answers, flags: a.flags, ui: a.ui,
        phase: a.phase, stageKey: a.stageKey, prevSubmitted: a.prevSubmitted, timeEnded: a.timeEnded, resumeSaved: a.resumeSaved, preload: a.data.preload ?? [], error: null,
      };
    case 'FAIL':
      return { ...s, phase: a.kind === 'auth' ? 'auth' : 'error', error: { kind: a.kind, code: a.code } };
    case 'PHASE':
      return { ...s, phase: a.phase, modal: null };
    case 'STAGE_STARTED': {
      const st = a.resp.stage;
      return {
        ...s, phase: 'section', stageKey: st.stageKey, content: a.resp.content, media: a.resp.media, highlights: a.highlights,
        stages: s.stages.map((x) => (x.stageKey === st.stageKey ? st : x)), partIdx: 0, currentQ: firstQuestionId(a.resp.content), timeEnded: null,
      };
    }
    case 'ANSWER': {
      const answers = { ...s.answers };
      for (const id of a.ids) answers[id] = { v: a.value, seq: a.seq, synced: false };
      return { ...s, answers };
    }
    case 'SYNCED': {
      const answers = { ...s.answers };
      for (const [id, seq] of Object.entries(a.sent)) if (answers[id] && answers[id].seq === seq) answers[id] = { ...answers[id], synced: true };
      const wasDown = s.syncFailSince != null;
      return { ...s, answers, lastSyncAt: a.at, syncFailSince: null, backOnlineAt: wasDown ? a.at : s.backOnlineAt };
    }
    case 'SYNC_FAIL':
      return s.syncFailSince ? s : { ...s, syncFailSince: a.at, backOnlineAt: null };
    case 'DEADLINE':
      return { ...s, stages: s.stages.map((x) => (x.stageKey === a.stageKey && x.deadlineAt !== a.deadlineAt ? { ...x, deadlineAt: a.deadlineAt } : x)) };
    case 'FLAG':
      return { ...s, flags: { ...s.flags, [a.id]: !s.flags[a.id] } };
    case 'GOTO':
      return { ...s, partIdx: a.partIdx, currentQ: a.q === undefined ? s.currentQ : a.q };
    case 'UI':
      return { ...s, ui: { ...s.ui, ...a.patch } };
    case 'MODAL':
      return { ...s, modal: a.modal };
    case 'HL':
      return { ...s, highlights: a.highlights };
    case 'SUBMITTING':
      return { ...s, submitting: a.on, submitError: a.on ? null : s.submitError };
    case 'SUBMIT_FAIL':
      return { ...s, submitError: a.error };
    case 'SUBMITTED': {
      const r = a.resp;
      const stages = s.stages.map((x) => (x.stageKey === r.stage.stageKey ? r.stage : x));
      const phase: Phase = a.reason === 'timeout' ? 'timeup' : r.nextStageKey ? 'intro' : 'complete';
      return {
        ...s, stages, stageKey: r.nextStageKey, content: null, media: [], preload: r.preload, highlights: [], flags: {}, modal: null, submitting: false, submitError: null,
        prevSubmitted: a.title, phase, timeup: a.reason === 'timeout' ? { next: a.next, writing: a.writing, acked: true } : null, partIdx: 0, currentQ: null,
      };
    }
    case 'TIMEUP_START':
      return { ...s, phase: 'timeup', modal: null, timeup: { next: a.next, writing: a.writing, acked: false } };
    case 'TIMEUP_ACK':
      return { ...s, phase: s.stageKey ? 'intro' : 'complete', timeup: null };
    case 'PRELOAD':
      return { ...s, preload: a.refs };
    case 'FS':
      return { ...s, fsExited: a.exited };
    case 'TAB_NOTED':
      return { ...s, tabNotedAt: a.at };
    default:
      return s;
  }
}
