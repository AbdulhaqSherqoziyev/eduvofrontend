/**
 * Student hub wire types — `_api-contract.md` §1.1, 1.2, 1.3, 1.11, 1.13
 * (checked against backend `attempt/hub.service.ts`, `center/code-login.service.ts`).
 * v1 = B2B: no price, no balance anywhere on the student side.
 */
import type { AttemptStatus, Iso, StageBrief } from './types';

export type ExamFamily = 'IELTS' | 'CEFR' | 'SAT' | 'TOEFL' | 'HSK';
export type AttemptMode = 'full' | 'section';
export type GradingKind = 'objective' | 'ai_writing' | 'ai_speaking';

export interface HubSection {
  key: string;
  title: string;
  order: number;
  durationSec: number | null;
  gradingKind: GradingKind;
  available: boolean;
  separateSitting: boolean;
  brief: { durationSec: number | null; questions: number | null; parts: number | null; tasks: number | null };
}

export interface HubExam {
  code: string;
  family: ExamFamily;
  name: string;
  label: string;
  configVersion: string;
  sections: HubSection[];
  fullMock: boolean;
  freeSampleAvailable: boolean;
  bestOverall: number | null;
  lastAttemptAt: Iso | null;
  activeAttemptId: string | null;
  /** Optional launch flag; missing → `COMING_SOON` fallback. */
  comingSoon?: boolean;
}

export interface HubAssignment {
  id: string;
  title: string;
  examCode: string;
  testId: string;
  mode: AttemptMode;
  sectionKey: string | null;
  windowStart: Iso;
  windowEnd: Iso;
  attemptId: string | null;
  attemptStatus: AttemptStatus | null;
}

export interface HubResp { exams: HubExam[]; assignments: HubAssignment[]; serverNow: Iso }

export interface DetailAttempt {
  id: string;
  testId: string;
  mode: AttemptMode;
  sectionKey: string | null;
  status: AttemptStatus;
  isFree: boolean;
  startedAt: Iso;
  finishedAt: Iso | null;
  resultSummary: { overall: number | null; sections: Record<string, number | null> } | null;
}

export interface DetailResp {
  exam: HubExam;
  tests: { id: string; title: string }[];
  attempts: DetailAttempt[];
  assignments: HubAssignment[];
  serverNow: Iso;
}

export interface ProgressAttempt {
  attemptId: string;
  at: Iso;
  mode: AttemptMode;
  overall: number | null;
  sections: Record<string, number | null>;
}
export interface ProgressResp { byExam: { code: string; name: string; attempts: ProgressAttempt[] }[]; serverNow: Iso }

export interface CreateAttemptBody { testId: string; mode: AttemptMode; sectionKey?: string; assignmentId?: string }
export interface CreateAttemptResp { attemptId: string; isFree: boolean; chargedUzs: number; stages: StageBrief[]; serverNow: Iso }

export interface CodeLoginResp {
  token: string;
  expiresAt: Iso;
  student: { id: string; fullName: string };
  assignment: Omit<HubAssignment, 'attemptId' | 'attemptStatus'>;
  attemptId: string | null;
  serverNow: Iso;
}
