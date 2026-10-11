'use client';
/** /exam/[attemptId] — the player. Token: `?preview=<exam_preview token>`, else the hub PIN session (`/exams/login`), else the portal token. */
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import { ExamRoot } from '@/components/exam/screens/ExamRoot';
import { IS_MOCK, setExamToken } from '@/lib/exam/api';
import { examStudentToken } from '@/lib/exam/session';

const PREVIEW_KEY = 'eduvo_exam_preview_token';

function resolveToken(): string | null {
  try {
    const q = new URLSearchParams(window.location.search);
    if (q.has('preview')) {
      const fromUrl = q.get('preview');
      if (fromUrl) window.sessionStorage.setItem(PREVIEW_KEY, fromUrl);
      return window.sessionStorage.getItem(PREVIEW_KEY);
    }
    return examStudentToken();
  } catch {
    return null;
  }
}

export default function ExamPage() {
  const { attemptId } = useParams<{ attemptId: string }>();
  const router = useRouter();
  const token = useMemo(() => (typeof window === 'undefined' ? null : resolveToken()), []);
  useEffect(() => {
    setExamToken(token);
    // take the preview token out of the address bar once Next has finished its own URL bookkeeping
    const tm = window.setTimeout(() => {
      const q = new URLSearchParams(window.location.search);
      if (q.get('preview')) { q.set('preview', ''); window.history.replaceState(window.history.state, '', `${window.location.pathname}?${q.toString()}`); }
    }, 1500);
    return () => window.clearTimeout(tm);
  }, [token]);
  if (typeof window !== 'undefined') setExamToken(token);
  const ok = IS_MOCK || !!token;
  // Students land on the hub result (_hub-design.md §4); staff previews keep the player's own result page.
  const isPreview = typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('preview');
  const done = isPreview ? `/exam/${encodeURIComponent(attemptId)}/result?preview=` : `/exams/attempts/${encodeURIComponent(attemptId)}/result`;
  return <ExamRoot attemptId={attemptId} hasToken={ok} onComplete={() => router.replace(done)} />;
}
