'use client';
import { useEffect, useSyncExternalStore } from 'react';
import { getServerSession, getSession, hasSessionHint, markGuest, refreshSession, subscribeSession, type SessionState } from '../api/client';

let booted = false;

/** Learner session (memory token + refresh cookie). First call on a page restores it once (A4). */
export function useSession(): SessionState {
  const s = useSyncExternalStore(subscribeSession, getSession, getServerSession);
  useEffect(() => {
    if (!booted) { booted = true; if (hasSessionHint()) void refreshSession(); else markGuest(); }
  }, []);
  return s;
}
