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
}

export const ExamHostContext = createContext<ExamHost>({});
export const useExamHost = () => useContext(ExamHostContext);
