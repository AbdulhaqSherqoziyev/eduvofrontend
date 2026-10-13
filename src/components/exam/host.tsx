'use client';
/**
 * ExamHost — what the embedding site (ERP portal/hub vs mock.eduvo.uz) supplies to the shared
 * player. Empty by default: the ERP keeps its existing behaviour (session-expired card → /portal).
 */
import { createContext, useContext, type ReactNode } from 'react';
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
}

export const ExamHostContext = createContext<ExamHost>({});
export const useExamHost = () => useContext(ExamHostContext);
