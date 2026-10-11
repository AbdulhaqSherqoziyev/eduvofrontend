'use client';
/**
 * Standalone "Interfeysni sinab ko'ring" (round 2: link under AssignmentCard →
 * `/exam/try/[code]`). Hosts the player's own TryInterface on a local, offline
 * controller: no attempt, no payment, no request leaves the browser.
 */
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useReducer, useState } from 'react';
import { TryInterface } from '@/components/exam/screens/tryout/TryInterface';
import { MinWidthGate } from '@/components/exam/shell/MinWidthGate';
import { ExamContext } from '@/lib/exam/engine/context';
import type { ExamCtl } from '@/lib/exam/engine/controller';
import { reducer, type Action } from '@/lib/exam/engine/reducer';
import { DEFAULT_UI, initialState, type UiPrefs } from '@/lib/exam/engine/state';
import { store } from '@/lib/exam/storage';

export function TryHost({ code }: { code: string }) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const [s, raw] = useReducer(reducer, 'try', (id) => ({
    ...initialState(id),
    phase: 'tryout' as const,
    config: { code, family: code.split('_')[0] ?? code, name: code, sections: [] },
    ui: { ...DEFAULT_UI, locale: (typeof window !== 'undefined' && store.locale()) || 'en' },
  }));
  const back = useCallback(() => router.push(`/exams/${encodeURIComponent(code)}`), [router, code]);
  const dispatch = useCallback((a: Action) => {
    if (a.t === 'PHASE' && a.phase !== 'tryout') back();
    else raw(a);
  }, [back]);
  const setUi = useCallback((patch: Partial<UiPrefs>) => raw({ t: 'UI', patch }), []);
  const ctl = useMemo(() => ({
    s, dispatch, setUi, stage: null, sectionCfg: null, stageCfg: null, media: {},
    setAnswer: () => undefined, beginStage: async () => undefined, submit: async () => false, timeOut: async () => undefined,
    reportSkip: async () => undefined, integrity: { log: () => undefined }, boot: async () => undefined,
  }) as unknown as ExamCtl, [s, dispatch, setUi]);

  if (!mounted) return <div className="exam-root" data-exam-theme="standard" data-exam-font="m" />;
  return (
    <ExamContext.Provider value={ctl}>
      <div className="exam-root" data-exam-theme={s.ui.theme} data-exam-font={s.ui.font} lang="en">
        <MinWidthGate locale={s.ui.locale}>
          <TryInterface />
        </MinWidthGate>
      </div>
    </ExamContext.Provider>
  );
}
