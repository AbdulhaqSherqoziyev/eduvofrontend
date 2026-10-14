'use client';
/**
 * ExamHost — what the embedding site (ERP portal/hub vs mock.eduvo.uz) supplies to the shared
 * player. Empty by default: the ERP keeps its existing behaviour (session-expired card → /portal).
 */
import { createContext, useContext, type ComponentType, type ReactNode } from 'react';
import type { Locale } from '@/lib/exam/i18n';

export interface ExamHost {
  /** Replaces the "session expired" screen (phase `auth`, or no token at all). `retry` re-boots the attempt. */
  renderAuthExpired?: (a: { retry: () => void; locale: Locale }) => ReactNode;
  /**
   * Checked once when the player mounts: true → the pre-check screen is skipped and the attempt
   * opens on the section intro (the host already ran its own system check). ERP: not set.
   */
  skipPrecheck?: () => boolean;
  /** Pre-check "Cancel" target (ERP default `/portal`). */
  cancelHref?: string;
  /** Top bar, left: rendered before the section title (B2C logo). */
  topBarBrand?: ReactNode;
  /** Top bar, right: rendered before the text-size button (B2C instruction language + Help). */
  topBarTools?: ReactNode;
  /**
   * mock.eduvo.uz layout (Player.dc.html): messages in one language (no second line), top bar
   * "logo · section / Name · test ID · timer · Notes · tools · Submit section", Hide timer only on
   * SAT, part tabs + current part numbers + Back/Next in the footer, Review flag on every question.
   * ERP: not set — the ERP player is unchanged.
   */
  b2c?: boolean;
  /** Instruction language when the learner has not picked one in the player yet. */
  initialLocale?: Locale;
  /**
   * Replaces both the ERP pre-check and "Welcome back" when the attempt is (re)opened directly.
   * Rendered inside the player's ExamContext, so it can call useExam() for data and actions.
   */
  ResumeScreen?: ComponentType;
  /** B2C: the server closed the attempt without a result (409 TOO_MANY_SKIPS { attemptCancelled }). */
  onAttemptCancelled?: () => void;
  /** B2C top bar name (learner display name, or a localized "Candidate"); ERP uses attempt.candidate.name. */
  candidateName?: string;
  /** Fallback when the screen is narrower than the player needs (ERP: /portal). */
  narrowHref?: string;
}

export const ExamHostContext = createContext<ExamHost>({});
export const useExamHost = () => useContext(ExamHostContext);
