import type { Locale } from '../i18n';
import type { AnswerValue, AttemptState, ExamConfig, MediaRef, StageBrief, StageContent } from '../types';

export type Phase = 'boot' | 'error' | 'auth' | 'precheck' | 'tryout' | 'welcome' | 'intro' | 'section' | 'timeup' | 'complete';
export type ThemeKey = 'standard' | 'contrast' | 'cream';
export type FontKey = 's' | 'm' | 'l';

export interface UiPrefs { theme: ThemeKey; font: FontKey; timerHidden: boolean; split: number; locale: Locale; audioOnly: boolean; volume: number }
export interface Highlight { id: string; part: number; pid: string; start: number; end: number; note?: string }
export interface AnswerEntry { v: AnswerValue; seq: number; synced: boolean }

export interface ExamState {
  phase: Phase;
  attemptId: string;
  error: { kind: string; code?: string } | null;
  attempt: AttemptState['attempt'] | null;
  config: ExamConfig | null;
  stages: StageBrief[];
  /** Stage in progress, or the next one to start. */
  stageKey: string | null;
  content: StageContent | null;
  media: MediaRef[];
  /** Media to preload before the next stage starts (submit.preload / attempt.preload). */
  preload: MediaRef[];
  answers: Record<string, AnswerEntry>;
  flags: Record<string, boolean>;
  partIdx: number;
  currentQ: string | null;
  highlights: Highlight[];
  ui: UiPrefs;
  modal: 'finish' | 'report' | 'preview_finish' | null;
  /** Last stage-submit failure (shown by the preview finish modal); cleared on the next submit. */
  submitError: { status?: number; code?: string; message?: string } | null;
  prevSubmitted: string | null;
  timeup: { next: { title: string; minutes: number } | null; writing: boolean; acked: boolean } | null;
  /** Resume: the stage's time ran out while the student was away (G8). */
  timeEnded: string | null;
  /** Answers already saved for the stage being resumed (G8). */
  resumeSaved: number;
  submitting: boolean;
  /** Epoch ms when sync started failing (offline banner after 3 s, long text after 60 s). */
  syncFailSince: number | null;
  backOnlineAt: number | null;
  lastSyncAt: number | null;
  fsExited: boolean;
  tabNotedAt: number | null;
}

export const DEFAULT_UI: UiPrefs = { theme: 'standard', font: 'm', timerHidden: false, split: 50, locale: 'en', audioOnly: false, volume: 0.8 };

export function initialState(attemptId: string): ExamState {
  return {
    phase: 'boot', attemptId, error: null, attempt: null, config: null, stages: [], stageKey: null, content: null,
    media: [], preload: [], answers: {}, flags: {}, partIdx: 0, currentQ: null, highlights: [], ui: DEFAULT_UI,
    modal: null, submitError: null, prevSubmitted: null, timeup: null, timeEnded: null, resumeSaved: 0, submitting: false,
    syncFailSince: null, backOnlineAt: null, lastSyncAt: null, fsExited: false, tabNotedAt: null,
  };
}
