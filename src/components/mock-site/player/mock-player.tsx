'use client';
/**
 * Mock-site host for the shared player (components/exam). The player itself is unchanged; this host
 * only supplies the transport (same-origin `/api`, learner token, one silent refresh on 401) and the
 * "Log in to keep going" modal instead of the ERP's "open the portal" card.
 */
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ExamHostContext, type ExamHost } from '@/components/exam/host';
import { ExamRoot } from '@/components/exam/screens/ExamRoot';
import { configureExamTransport, setExamToken } from '@/lib/exam/api';
import { currentAccessToken, ensureSession, refreshSession } from '@/lib/mock/api/client';
import { useLang } from '@/lib/mock/hooks/use-lang';
import { SessionModal } from './session-modal';

const BASE = process.env.NEXT_PUBLIC_MOCK_API_BASE || '/api';

export function MockPlayer({ attemptId }: { attemptId: string }) {
  const router = useRouter();
  const { href } = useLang();
  const [state, setState] = useState<'boot' | 'ready' | 'guest'>('boot');

  useEffect(() => {
    configureExamTransport({
      base: BASE,
      renewAuth: async () => { const ok = await refreshSession(); setExamToken(currentAccessToken()); return ok; },
    });
    void ensureSession().then((s) => {
      setExamToken(currentAccessToken());
      setState(s.status === 'learner' ? 'ready' : 'guest');
    });
  }, []);

  const host = useMemo<ExamHost>(() => ({
    renderAuthExpired: ({ retry }) => <SessionModal onBack={() => { setState('ready'); retry(); }} />,
  }), []);

  if (state === 'boot') return <div className="exam-root" data-exam-theme="standard" data-exam-font="m" />;
  return (
    <ExamHostContext.Provider value={host}>
      <div dir="ltr" lang="en">
        <ExamRoot key={state} attemptId={attemptId} hasToken={state === 'ready'} onComplete={() => router.replace(href(`/results/${encodeURIComponent(attemptId)}`))} />
      </div>
    </ExamHostContext.Provider>
  );
}
