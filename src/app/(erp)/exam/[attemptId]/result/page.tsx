'use client';
/**
 * /exam/[attemptId]/result — objective result right after the player.
 * The hub version (`/exams/attempts/[id]/result`, v3 shell, _hub-design.md §4)
 * will reuse ResultsView when the hub is built.
 */
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ResultsView } from '@/components/exam/results/ResultsView';
import { setExamToken } from '@/lib/exam/api';
import type { Locale } from '@/lib/exam/i18n';
import { examStudentToken } from '@/lib/exam/session';
import { store } from '@/lib/exam/storage';

export default function ExamResultPage() {
  const { attemptId } = useParams<{ attemptId: string }>();
  const [locale, setLocale] = useState<Locale | null>(null);
  // Staff preview: `?preview=` on the URL (set by the player's onComplete) + the token the player kept in sessionStorage.
  const [isPreview, setIsPreview] = useState(false);
  useEffect(() => {
    try {
      const q = new URLSearchParams(window.location.search);
      const preview = q.has('preview');
      setIsPreview(preview);
      setExamToken(preview ? window.sessionStorage.getItem('eduvo_exam_preview_token') : examStudentToken());
    } catch { /* no storage → request fails politely */ }
    if (document.fullscreenElement) void document.exitFullscreen().catch(() => undefined);
    setLocale(store.locale() ?? 'uz');
  }, []);
  return (
    <div style={{ position: 'fixed', inset: 0, overflow: 'auto', background: '#EEF1F6', color: '#1E2A3A', fontFamily: "'Manrope', system-ui, sans-serif" }}>
      {locale && <ResultsView attemptId={attemptId} locale={locale} isPreview={isPreview} />}
    </div>
  );
}
