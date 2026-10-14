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
  // only a decided guest goes to login; `offline` (server unreachable, 429) keeps the page and its banner
  useEffect(() => {
    void ensureSession().then((x) => {
      if (x.status === 'guest') router.replace(href(`/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`));
    });
  }, [router, href, s.status]);
  return s.status === 'learner' ? s.learner : null;
}
