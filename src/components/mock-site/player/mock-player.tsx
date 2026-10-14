'use client';
/**
 * Mock-site host for the shared player (components/exam). The player itself is unchanged; this host
 * only supplies the transport (same-origin `/api`, learner token, one silent refresh on 401) and the
 * "Log in to keep going" modal instead of the ERP's "open the portal" card, the B2C top-bar parts
 * (logo, instruction language, Help) and skips the second system check after Exam Start.
 */
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ExamHostContext, type ExamHost } from '@/components/exam/host';
import { ExamRoot } from '@/components/exam/screens/ExamRoot';
import { configureExamTransport, setExamToken } from '@/lib/exam/api';
import { currentAccessToken, ensureSession, refreshSession } from '@/lib/mock/api/client';
import { useLang } from '@/lib/mock/hooks/use-lang';
import { useSession } from '@/lib/mock/hooks/use-session';
import { MockPlayerBrand, MockPlayerTools } from './mock-top-tools';
import { SessionModal } from './session-modal';

const BASE = process.env.NEXT_PUBLIC_MOCK_API_BASE || '/api';

export function MockPlayer({ attemptId }: { attemptId: string }) {
  const router = useRouter();
  const { lang, href } = useLang();
  const [state, setState] = useState<'boot' | 'ready' | 'guest'>('boot');
  const session = useSession();

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

  const host = useMemo<ExamHost>(() => ({
    renderAuthExpired: ({ retry }) => <SessionModal attemptId={attemptId} onBack={() => { setState('ready'); retry(); }} />,
    // Exam Start already ran the system check and entered fullscreen (SPA navigation keeps it).
    // Opened directly (reload, link) → not fullscreen → the player's own pre-check runs as before.
    skipPrecheck: () => typeof document !== 'undefined' && !!document.fullscreenElement,
    cancelHref: `/${lang}/dashboard`,
    topBarBrand: <MockPlayerBrand />,
    topBarTools: <MockPlayerTools />,
  }), [lang, attemptId]);

  if (state === 'boot') return <div className="exam-root" data-exam-theme="standard" data-exam-font="m" />;
  return (
    <ExamHostContext.Provider value={host}>
      <div dir="ltr" lang="en">
        <ExamRoot key={state} attemptId={attemptId} hasToken={state === 'ready'} onComplete={() => router.replace(href(`/results/${encodeURIComponent(attemptId)}`))} />
      </div>
    </ExamHostContext.Provider>
  );
}
