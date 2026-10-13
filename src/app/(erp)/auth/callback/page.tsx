'use client';

import { useEffect } from 'react';
import { setSession } from '@/lib/auth/session';

/**
 * Auto-login bridge: the landing page (eduvo.uz) signs a center up, then sends
 * the new director here with the session in the URL hash (#t=<token>&u=<user>).
 * We persist it and drop the user straight into the dashboard.
 */
export default function AuthCallbackPage() {
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.hash.replace(/^#/, ''));
      const token = params.get('t');
      const userRaw = params.get('u');
      if (token && userRaw) {
        const user = JSON.parse(userRaw);
        setSession({ accessToken: token, user });
        window.location.replace('/dashboard');
        return;
      }
    } catch {
      /* fall through to login */
    }
    window.location.replace('/login');
  }, []);

  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="size-10 animate-spin rounded-full border-[3px] border-[rgba(46,107,230,0.25)] border-t-primary" />
        <div className="text-[14px] font-semibold text-muted">Tizimga kirilmoqda…</div>
      </div>
    </div>
  );
}
