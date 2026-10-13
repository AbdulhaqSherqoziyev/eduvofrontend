'use client';
/** Private pages: wait for the session; guests go to /login?next=<this page>. */
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ensureSession } from '../api/client';
import { useLang } from './use-lang';
import { useSession } from './use-session';

export function useLearner() {
  const s = useSession();
  const router = useRouter();
  const { href } = useLang();
  useEffect(() => {
    void ensureSession().then((x) => {
      if (x.status !== 'learner') router.replace(href(`/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`));
    });
  }, [router, href]);
  return s.status === 'learner' ? s.learner : null;
}
