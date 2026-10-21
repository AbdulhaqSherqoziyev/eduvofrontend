/**
 * Wire types — mirror of `.claude/specs/exams/_api-contract.md` v1.1 (Bekzod, 2026-10-10).
 * Fields marked `req:` are NOT in the contract; they are asked of Bekzod in the
 * frontend report and are optional so the player works without them.
 */
import type { GroupContent, QuestionContent } from './content-types';
import type { ResumeRecording, SpeakingResult, SpeakingStageContent } from './speaking-types';

export type Iso = string;
export type AttemptStatus = 'ACTIVE' | 'COMPLETED' | 'EXPIRED' | 'CANCELLED';
export type StageStatus = 'PENDING' | 'IN_PROGRESS' | 'LOCKED';
export type StageKind = 'questions' | 'writing' | 'speaking' | 'break' | 'read_only';
export type TimerMode = 'fixed' | 'audio_driven' | 'scripted' | 'none';
export type AnswerValue = string | string[] | null;

// ── ExamConfigPublic (subset the player reads; _shared-decisions.md §1.2) ────
export interface StageAudioCfg {
  scope?: 'part' | 'group';
  play_count: number;
  contains_repeat?: boolean;
  pre_prep_sec?: number;
  repeat_gap_sec?: number;
  inter_part_gap_sec?: number; // cefr.md §4 (5 s) — default 5 when play_count > 1
  lead_in_sec?: number; // req: IELTS T9 "Audio starts in 5…" (default 5 for audio_driven)
  chain?: 'auto';
}

export interface StageNavCfg {
  back?: boolean;
  across_parts?: boolean;
  flag?: boolean;
  early_finish?: boolean | 'after_audio_chain';
  review_page?: boolean;
  questions_visible?: 'during' | 'after_audio';
  hide_upcoming?: boolean;
}

export interface StageCfg {
  key: string;
  kind: StageKind;
  layout?: string;
  timer: { mode: TimerMode; duration_sec?: number; review_sec?: number };
  audio?: StageAudioCfg;
  nav?: StageNavCfg;
  tools?: { highlight_notes?: boolean };
  /** SAT Math: ["graphing_calculator", "reference_sheet"] (sat.md §2.1). */
  tools_extra?: string[];
  /** SAT break stage (sat.md §2.1). */
  show_countdown?: boolean;
  auto_advance?: boolean;
  can_switch_tasks?: boolean;
  editor?: { spellcheck?: boolean; external_paste?: boolean; internal_copy_paste?: boolean; count_mode?: string };
  tasks?: { key: string; type?: string; min_words?: number; max_words?: number; weight?: number }[];
}

export interface SectionCfg {
  key: string;
  title: string;
  order: number;
  intro?: string; // req: intro paragraph (design A10 `sec.intro`)
  separate_sitting?: boolean;
  /** req: intro tiles TIME/CONTENT before the stage starts (counts are not secret; `expect` is stripped). */
  brief?: { durationSec?: number; questions?: number; parts?: number; tasks?: number };
  stages: StageCfg[];
}

export interface ExamConfig {
  code: string;
  family: string;
  name: string;
  short?: string; // req: top bar "{short} mock"; falls back to family
  label?: string;
  ui?: { min_width_px?: number; tools?: string[]; ui_locale?: 'en' | 'uz' | 'user' };
  precheck?: string[];
  sections: SectionCfg[];
  scoring?: { display?: { estimated?: boolean; ai_as_range?: boolean } };
}

// ── Attempt ─────────────────────────────────────────────────────────────────
export interface StageBrief {
  sectionKey: string;
  stageKey: string;
  kind: StageKind;
  order: number;
  status: StageStatus;
  startedAt: Iso | null;
  deadlineAt: Iso | null;
  lockedAt: Iso | null;
  audioStartedAt: Iso | null;
  separateSitting: boolean;
}

export interface MediaRef { assetId: string; url: string; kind: 'audio' | 'image'; mime?: string; bytes: number; durationMs: number | null; expiresAt?: Iso }

export interface ServerAnswer { questionId: string; stageKey: string; value: AnswerValue; uiState: Record<string, unknown> | null; clientSeq: number }

export interface AttemptState {
  attempt: {
    id: string; examCode: string; testId: string; mode: 'full' | 'section'; sectionKey: string | null;
    status: AttemptStatus; isPreview: boolean; currentStageKey: string | null; startedAt: Iso; finishedAt: Iso | null;
    /** Staff preview may close any stage before its timer (contract 1.4, Bekzod 10-11); `isPreview` alone also enables it. */
    previewEarlyFinish?: boolean;
    candidate?: { name: string; code?: string }; // req: top bar "Name · ID" (design A1)
  };
  config: ExamConfig;
  stages: StageBrief[];
  answers: ServerAnswer[];
  recordings: ResumeRecording[];
  /** speaking contract §4a: items that already used their one technical restart. */
  itemRestarts?: { stageKey: string; itemKey: string }[];
  audioOffsetMs: number | null;
  preload?: MediaRef[]; // req: next PENDING stage media, so the first section's audio loads before its timer (T20)
  serverNow: Iso;
}

// ── Stage content ───────────────────────────────────────────────────────────
export interface Question { id: string; no: number; type: string; check: string; content: QuestionContent; points: number }
export interface Group { id: string; layout: string | null; instructions: string | null; content: GroupContent | null; multiGroup: boolean; questions: Question[] }
export interface Part {
  part: number; title: string | null; instructions: string | null; passageHtml: string | null;
  imageAssetId: string | null; audioAssetId: string | null; audioDurationMs: number | null; groups: Group[];
}
export interface WritingTask {
  questionId: string; key: string; type: string; prompt: string; imageAssetId: string | null;
  bullets: string[] | null; minWords: number | null; maxWords: number | null; weight: number;
  label?: string; hint?: string; // req: "Task 1 · about 20 minutes" (design A13); fallback from key
}
export type StageContent =
  | { kind: 'questions' | 'break' | 'read_only'; parts: Part[] }
  | { kind: 'writing'; tasks: WritingTask[] }
  | SpeakingStageContent;

export interface StageStartResp { stage: StageBrief; content: StageContent; media: MediaRef[]; serverNow: Iso }
export interface SaveResp { accepted: string[]; rejected: { questionId: string; reason: string }[]; deadlineAt: Iso; serverNow: Iso }
export interface SubmitResp { stage: StageBrief; nextStageKey: string | null; preload: MediaRef[]; attemptStatus: AttemptStatus; serverNow: Iso }

export type IntegrityType = 'tab_switch' | 'fullscreen_exit' | 'window_blur' | 'paste' | 'copy' | 'resize';
export interface IntegrityEvent { type: IntegrityType; at: Iso; stageKey?: string; meta?: Record<string, unknown> }

// ── Result ──────────────────────────────────────────────────────────────────
export interface NextLevel { level: string; min: number }
export interface ResultSection {
  key: string; title: string; status: 'READY' | 'GRADING' | 'NEEDS_HUMAN' | 'PENDING' | 'NOT_TAKEN';
  raw: number | null; max: number | null; scaled: number | null; label: string | null; level: string | null;
  estimated: boolean; techSkippedParts: number[]; techSkippedQuestions: number; nextLevel: NextLevel | null;
}
export interface ReviewRow {
  questionId: string; sectionKey: string; no: number; type: string; yours: AnswerValue; correct: string[];
  isCorrect: boolean; points: number; explanation: string | null; passageAnchor: string | null;
  /** contract §1b: SAT SPR 'DECIMAL_NOT_FULL' (a short decimal like .666), else null. */
  hint?: string | null;
  /** Optional, parallel to `correct`: the option text behind each MCQ key ("B" → "4x + 1"). Absent for SPR. */
  correctText?: string[] | null;
  /** contract v1.4: the stage the question belonged to (`rw_m1`, `math_m2`, `listening`…) — SAT rows read "M1·4" since `no` restarts per module. */
  stageKey?: string;
  /** Not in the v1.8 contract (evidence = `passageAnchor`); drawn only if a later version sends it (string or {text}). */
  evidence?: unknown;
}
/** §1.10 v1.8 `overallBand` (2026-10-12): overall from the READY sections (IELTS without Speaking, SAT 400–1600). */
export interface EstimatedOverall { value: number | null; label: string | null; level?: string | null; basis: string[]; missing: string[]; pending?: boolean }
export interface SummaryTypeLine { type: string; label?: string | null; correct: number; total: number }
export interface ResultSummarySection { section: string; title?: string; correct: number | null; total: number | null; byType: SummaryTypeLine[]; weakest?: unknown[]; strongest?: unknown[]; tasks?: unknown[] }
export interface ResultResp {
  attemptId: string; examCode: string; mode: 'full' | 'section'; status: 'PARTIAL' | 'FINAL';
  sections: ResultSection[];
  overall: { value: number; label: string; level: string | null; estimated: boolean; nextLevel: NextLevel | null } | null;
  certificate: { level: string; min: number; scaleMax: number } | null;
  reviewAvailableAt: Iso | null;
  review: ReviewRow[];
  /** contract §1.10: `criteria` is `[{name, score, max, note}]` (grading runner) or a `{name: band}` map; `feedback` is multi-line text (summary / "Kuchli tomonlar:" / "Keyingi qadamlar:"). */
  ai: { taskKey: string; status: 'GRADING' | 'READY' | 'NEEDS_HUMAN'; scoreMin: number | null; scoreMax: number | null; score: number | null; criteria?: unknown; feedback?: string | null }[];
  examName?: string; // req: "IELTS Academic · Full mock" header
  passages?: { sectionKey: string; part: number; title: string | null; passageHtml: string }[]; // req: "Show in passage"
  practice?: { type: string; label: string; questions: number }; // req: T35 "Practice: <type> · N questions"
  overallBand?: EstimatedOverall | null;
  /** pre-v1.8 working name of `overallBand` (tolerated). */
  estimatedOverall?: EstimatedOverall | null;
  summary?: { sections?: ResultSummarySection[]; nextSteps?: string[] } | null;
  /** speaking contract §4: the Speaking block (null when the attempt has no Speaking). */
  speaking?: SpeakingResult | null;
  serverNow: Iso;
}
