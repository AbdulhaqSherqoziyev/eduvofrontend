'use client';
/** /{lang}/start ("Take a mock" in the learner nav) → the learner's goal exam, else IELTS. */
import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ensureSession } from '@/lib/mock/api/client';
import { useSession } from '@/lib/mock/hooks/use-session';

export default function StartIndex() {
  const { lang } = useParams<{ lang: string }>();
  const router = useRouter();
  const session = useSession();
  useEffect(() => {
    void ensureSession().then((s) => {
      if (s.status === 'offline' || s.status === 'unknown') return;
      const exam = s.status === 'learner' ? s.learner.goal?.exam ?? 'ielts' : 'ielts';
      router.replace(`/${lang}/start/${exam}?mode=full`);
    });
  }, [lang, router, session.status]);
  return <main style={{ minHeight: '60vh' }} />;
}
