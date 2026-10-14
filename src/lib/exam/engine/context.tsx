'use client';
import { createContext, useContext } from 'react';
import { ExamHostContext } from '@/components/exam/host';
import { t as tr, bi as biTr, bin as binTr, tn as tnTr, type TextKey } from '../i18n';
import type { ExamCtl } from './controller';

export const ExamContext = createContext<ExamCtl | null>(null);

export function useExam(): ExamCtl {
  const c = useContext(ExamContext);
  if (!c) throw new Error('useExam must be used inside <ExamContext.Provider>');
  return c;
}

/** Strings in the student's chosen interface language. */
export function useT() {
  const { s } = useExam();
  const mono = !!useContext(ExamHostContext).b2c;
  const l = s.ui.locale;
  // B2C (mock.eduvo.uz): the learner's language only — the second line of a bilingual pair is empty
  const one = (p: [string, string]): [string, string] => (mono ? [p[0], ''] : p);
  return {
    locale: l,
    t: (k: TextKey, v?: Record<string, string | number>) => tr(k, l, v),
    tn: (base: string, n: number, v?: Record<string, string | number>) => tnTr(base, n, l, v),
    bi: (k: TextKey, v?: Record<string, string | number>) => one(biTr(k, l, v)),
    bin: (base: string, n: number, v?: Record<string, string | number>) => one(binTr(base, n, l, v)),
  };
}
