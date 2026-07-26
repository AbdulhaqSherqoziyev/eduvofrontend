'use client';

import { useEffect } from 'react';

/**
 * Registers the app-shell worker, and only from /portal and /t. The ERP is not
 * part of this wave.
 *
 * Skipped in development on purpose: Next rebuilds `/_next/static` chunks on
 * every save, and a stale-while-revalidate copy of those is a broken dev
 * server. Verify the worker with `next build && next start`.
 */
export function SwRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return;
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;
    navigator.serviceWorker.register('/sw.js').catch(() => {
      /* an app that cannot register a worker still works online */
    });
  }, []);
  return null;
}
