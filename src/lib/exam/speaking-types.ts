/**
 * IELTS Speaking wire types — `.claude/specs/exams/speaking-api-contract.md` v1.2 (Bekzod, 2026-10-22).
 * Names follow the contract 1:1. v1.2 fields are optional here only so older payloads still render.
 */
import type { Iso, StageBrief } from './types';

// ── §1 stage content ────────────────────────────────────────────────────────
export type SpeakingItemKind = 'examiner_line' | 'interview' | 'cue_card' | 'rounding_off' | 'discussion';
export interface SpeakingItem {
  itemKey: string;
  part: 1 | 2 | 3;
  kind: SpeakingItemKind;
  records: boolean;
  prompt: string;
  bullets: string[] | null;
  cardFollowUp: string | null;
  frame: string | null;
  promptAudioAssetId: string | null;
  promptAudioDurationMs: number | null;
  imageAssetId: string | null;
  prepSec: number;
  responseSec: number;
  minResponseSec: number | null;
}
export type PromptDisplay = 'audio_then_text' | 'audio_only' | 'text';
export interface SpeakingStageContent { kind: 'speaking'; promptDisplay: PromptDisplay; notesField: boolean; items: SpeakingItem[] }

// ── §2 upload / §3 resume / §4a restart ─────────────────────────────────────
/** §2 v1.2: `kind:'backup'` = partial recording from a first interruption (uploaded before the restart, never graded). */
export type RecordingKind = 'main' | 'backup';
export interface RecordingUploadResp { recordingId: string; itemKey: string; kind?: RecordingKind; status: 'UPLOADED' | string; serverNow: Iso }
export interface ResumeRecording { itemKey: string; stageKey: string; status: 'UPLOADED' | 'REJECTED' | string; durationMs?: number | null; deleted?: boolean }
export type RestartReason = 'mic_lost' | 'page_reload' | 'device_change' | 'network' | 'other';
export interface RestartResp { stage: StageBrief; itemKey: string; restartsLeft: 0; extendedBySec: number; serverNow: Iso }

// ── §4 result ───────────────────────────────────────────────────────────────
export type SpeakingStatus = 'pending' | 'received' | 'transcribing' | 'scoring' | 'ready' | 'needs_review' | 'not_graded' | 'no_response'
  /** v1.2: speech present but too little for the 4 criteria — no band. */
  | 'too_short';
export type SpeakingCriterionKey = 'fluency_coherence' | 'lexical_resource' | 'grammatical_range_accuracy' | 'pronunciation';
export interface SpeakingQuote { itemKey: string; part: number; quote: string; startMs: number | null }
export interface SpeakingCriterion {
  key: SpeakingCriterionKey; name: string; band: number; note: string;
  quotes: SpeakingQuote[]; nextStep: string | null;
  wordsToPractise?: { word: string; itemKey: string; startMs: number | null }[];
}
export interface SpeakingResultItem {
  itemKey: string; part: number; kind: string; question: string;
  transcript: string | null; noResponse: boolean; durationMs: number | null;
  recording: { id: string; url: string; expiresAt: Iso; mime: string } | null;
  recordingDeleted: boolean;
  /** v1.2: partial recording from before an interruption — staff result only (always null for the learner). */
  backupRecording?: { id: string; url: string; expiresAt: Iso; mime: string; durationMs?: number | null } | null;
  /** v1.2: the item was restarted after an interruption. */
  restarted?: boolean;
  /** v1.2: the item's answer time ("0:24 / 0:30"). */
  responseSec?: number | null;
}
export interface SpeakingHistoryRow { at: Iso; by: { id: string; fullName: string } | null; action: 'override' | 'revert'; from: number | null; to: number | null; note: string | null }
export interface SpeakingReview {
  aiBand: number | null;
  aiCriteria: { key: string; band: number }[] | null;
  passes: number[];
  flags: string[];
  provider: string | null; model: string | null; costUsd: number | null;
  reviewedBy: { id: string; fullName: string } | null; reviewedAt: Iso | null;
  history: SpeakingHistoryRow[];
  canOverride: boolean;
}
export interface SpeakingResult {
  sectionKey: 'speaking'; stageKey: 'speaking';
  status: SpeakingStatus;
  band: number | null; label: string | null;
  aiGraded: true;
  teacherReviewed: boolean; teacherNote: string | null;
  /** v1.2: who changed the score (when `teacherReviewed`). */
  teacherName?: string | null;
  criteria: SpeakingCriterion[] | null;
  summary: string | null;
  strengths: string[];
  nextSteps: string[];
  noResponse: boolean;
  answeredCount: number; unansweredCount: number;
  availableUntil: Iso | null;
  audioKeptUntil: Iso | null;
  recordingsDeletedAt: Iso | null;
  recordingsDeleteReason: 'learner' | 'retention' | null;
  items: SpeakingResultItem[];
  transcriptNote: true;
  canDeleteRecordings: boolean;
  /** v1.2: quote/word `startMs` is trusted only when true (else the clip plays from 0). */
  timestampsReliable?: boolean;
  /** v1.2: taken in audio-only mode (§2 `promptMode`). */
  audioOnly?: boolean;
  /** v1.2: audio retention of this centre / site in days (ERP 365, B2C 90) — never hard-code "12 months". */
  audioRetentionDays?: number;
  review?: SpeakingReview;
}

// ── §7 staff override ───────────────────────────────────────────────────────
export interface SpeakingOverrideBody { criteria: Record<SpeakingCriterionKey, number>; note: string }
export interface SpeakingOverrideResp { speaking: SpeakingResult; overallBand: unknown; serverNow: Iso }

export const CRITERION_KEYS: SpeakingCriterionKey[] = ['fluency_coherence', 'lexical_resource', 'grammatical_range_accuracy', 'pronunciation'];

/** IELTS rounding of the 4-criterion mean (contract §7): x.25 → x.5, x.75 → next whole. */
export function ieltsBand(bands: number[]): number {
  const m = bands.reduce((a, b) => a + b, 0) / bands.length;
  const whole = Math.floor(m);
  const frac = m - whole;
  if (frac < 0.25) return whole;
  if (frac < 0.75) return whole + 0.5;
  return whole + 1;
}

/** `speaking` from any result payload (player, hub, staff, B2C) — null when the attempt has none. */
export function speakingOf(r: { speaking?: SpeakingResult | null } | null | undefined): SpeakingResult | null {
  return r?.speaking ?? null;
}

/** `{period}` text key + vars for a retention in days (v1.2 `audioRetentionDays`): 365 → "12 months", 90 → "90 days". */
export function retentionPeriod(days: number | null | undefined, fallbackB2c: boolean): { key: 'speaking.period_12m' | 'speaking.period_90d' | 'speaking.period_days'; n?: number } {
  const d = days ?? (fallbackB2c ? 90 : 365);
  if (d === 365 || d === 366) return { key: 'speaking.period_12m' };
  if (d === 90) return { key: 'speaking.period_90d' };
  return { key: 'speaking.period_days', n: d };
}
