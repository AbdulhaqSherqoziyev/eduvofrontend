'use client';
/** /{lang}/start ("Take a mock" in the learner nav) → the learner's goal exam, else IELTS. */
import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ensureSession } from '@/lib/mock/api/client';

export default function StartIndex() {
  const { lang } = useParams<{ lang: string }>();
  const router = useRouter();
  useEffect(() => {
    void ensureSession().then((s) => {
      const exam = s.status === 'learner' ? s.learner.goal?.exam ?? 'ielts' : 'ielts';
      router.replace(`/${lang}/start/${exam}?mode=full`);
    });
  }, [lang, router]);
  return <main style={{ minHeight: '60vh' }} />;
}
