/**
 * IELTS Speaking wire types — `.claude/specs/exams/speaking-api-contract.md` v1.1 (Bekzod, 2026-10-21).
 * Names follow the contract 1:1. Fields marked `req:` are NOT in the contract yet (asked of Bekzod
 * in the frontend report) and are optional, so the UI works without them.
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
export interface RecordingUploadResp { recordingId: string; itemKey: string; status: 'UPLOADED'; serverNow: Iso }
export interface ResumeRecording { itemKey: string; stageKey: string; status: 'UPLOADED' | 'REJECTED' | string; durationMs?: number | null; deleted?: boolean }
export type RestartReason = 'mic_lost' | 'page_reload' | 'device_change' | 'network' | 'other';
export interface RestartResp { stage: StageBrief; itemKey: string; restartsLeft: 0; extendedBySec: number; serverNow: Iso }

// ── §4 result ───────────────────────────────────────────────────────────────
export type SpeakingStatus = 'pending' | 'received' | 'transcribing' | 'scoring' | 'ready' | 'needs_review' | 'not_graded' | 'no_response'
  /** req: Dilnoza spec §2.3 `too_short` — not in contract v1.1 (asked of Bekzod); drawn when sent. */
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
  /** req (staff, spec §3.2): partial recording kept from before an interruption. */
  backupRecording?: { id: string; url: string; expiresAt: Iso; mime: string } | null;
  /** req (staff, spec §3.2): the item was restarted after an interruption. */
  restarted?: boolean;
  /** req (staff table "0:24 / 0:30"). */
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
  /** req (spec §3.3 "ustoz ismi 12 muted"): who wrote `teacherNote`. */
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
  /** req (spec §2.2 play rule): quote/word `startMs` is trusted only when true. Absent → whole clip from 0. */
  timestampsReliable?: boolean;
  /** req (spec §2.2 "Taken in exam mode" chip): the learner used the audio-only switch. */
  audioOnly?: boolean;
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
