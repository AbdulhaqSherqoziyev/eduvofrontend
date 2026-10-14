'use client';
/**
 * Mock-site host for the shared player (components/exam). The player engine is unchanged; this host
 * supplies the transport (same-origin `/api`, learner token, one silent refresh on 401), the "Log in
 * to keep going" modal instead of the ERP's "open the portal" card, and the B2C layout
 * (ExamHost.b2c: one-language messages, Player.dc.html top bar and footer, Review flags), the
 * learner's language as the default instruction language, our own resume card instead of the ERP
 * pre-check / "Welcome back", and the "Section submitted" card at the end.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ExamHostContext, type ExamHost } from '@/components/exam/host';
import { ExamRoot } from '@/components/exam/screens/ExamRoot';
import { configureExamTransport, setExamToken } from '@/lib/exam/api';
import { isPlayerLocale } from '@/lib/exam/i18n';
import { MockApiError, currentAccessToken, ensureSession, refreshSession } from '@/lib/mock/api/client';
import { getResult } from '@/lib/mock/api/endpoints';
import { useLang } from '@/lib/mock/hooks/use-lang';
import { useSession } from '@/lib/mock/hooks/use-session';
import { CancelledCard } from '../cancelled-card';
import { MockDoneCard } from './done-card';
import { MockPlayerBrand, MockPlayerTools } from './mock-top-tools';
import { MockResumeCard } from './resume-card';
import { SessionModal } from './session-modal';

const BASE = process.env.NEXT_PUBLIC_MOCK_API_BASE || '/api';

export function MockPlayer({ attemptId }: { attemptId: string }) {
  const { lang, href } = useLang();
  const t = useTranslations('player');
  const [state, setState] = useState<'boot' | 'ready' | 'guest'>('boot');
  const [done, setDone] = useState<null | { writing: boolean }>(null);
  const [cancelled, setCancelled] = useState(false);
  const session = useSession();
  const learner = session.status === 'learner' ? session.learner : null;

  useEffect(() => {
    configureExamTransport({
      base: BASE,
      renewAuth: async () => { const ok = await refreshSession(true); setExamToken(currentAccessToken()); return ok; },
    });
  }, []);
  useEffect(() => {
    if (state !== 'boot') return;
    void ensureSession().then((s) => {
      if (s.status !== 'learner' && s.status !== 'guest') return; // offline: wait for the session banner retry
      setExamToken(currentAccessToken());
      setState(s.status === 'learner' ? 'ready' : 'guest');
    });
  }, [state, session.status]);

  const candidateName = learner?.displayName?.trim() || t('candidate');
  const host = useMemo<ExamHost>(() => ({
    b2c: true,
    initialLocale: isPlayerLocale(lang) ? lang : 'en',
    candidateName,
    ResumeScreen: MockResumeCard,
    narrowHref: `/${lang}/dashboard`,
    renderAuthExpired: ({ retry }) => <SessionModal attemptId={attemptId} onBack={() => { setState('ready'); retry(); }} />,
    // Exam Start already ran the system check and entered fullscreen (SPA navigation keeps it).
    // Opened directly (reload, link) → MockResumeCard instead of the ERP pre-check.
    skipPrecheck: () => typeof document !== 'undefined' && !!document.fullscreenElement,
    cancelHref: `/${lang}/dashboard`,
    topBarBrand: <MockPlayerBrand />,
    topBarTools: <MockPlayerTools />,
    onAttemptCancelled: () => { if (document.fullscreenElement) void document.exitFullscreen().catch(() => undefined); setCancelled(true); },
  }), [lang, attemptId, candidateName]);

  const onComplete = useCallback(() => {
    if (document.fullscreenElement) void document.exitFullscreen().catch(() => undefined);
    // after Writing the result opens in its pending state; the card says so
    getResult(attemptId)
      .then((r) => setDone({ writing: r.mock.sectionCards.some((c) => c.key === 'writing' && c.status === 'GRADING') || r.mock.writing.some((w) => w.status === 'GRADING') }))
      .catch((e: unknown) => { if (e instanceof MockApiError && e.code === 'ATTEMPT_CANCELLED') setCancelled(true); else setDone({ writing: false }); });
  }, [attemptId]);

  if (cancelled) return <CancelledCard full />;
  if (done) return <MockDoneCard resultHref={href(`/results/${encodeURIComponent(attemptId)}`)} writing={done.writing} />;
  if (state === 'boot') return <div className="exam-root" data-exam-theme="standard" data-exam-font="m" />;
  return (
    <ExamHostContext.Provider value={host}>
      <div dir="ltr" lang="en">
        <ExamRoot key={state} attemptId={attemptId} hasToken={state === 'ready'} onComplete={onComplete} />
      </div>
    </ExamHostContext.Provider>
  );
}
