'use client';
/**
 * Google Identity Services (contract A3). Available only when NEXT_PUBLIC_GOOGLE_CLIENT_ID is set
 * (backend answers 503 GOOGLE_NOT_CONFIGURED otherwise) — the button then shows its "Soon" state.
 * Uses One Tap / the account chooser prompt and resolves with the ID token (credential).
 */
import { useCallback } from 'react';

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

interface GoogleId {
  initialize: (o: { client_id: string; callback: (r: { credential?: string }) => void; ux_mode?: string; cancel_on_tap_outside?: boolean }) => void;
  prompt: (cb?: (n: { isNotDisplayed: () => boolean; isSkippedMoment: () => boolean }) => void) => void;
}
declare global { interface Window { google?: { accounts: { id: GoogleId } } } }

let loading: Promise<void> | null = null;
function load() {
  if (window.google?.accounts?.id) return Promise.resolve();
  if (!loading) {
    loading = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = 'https://accounts.google.com/gsi/client'; s.async = true; s.defer = true;
      s.onload = () => resolve(); s.onerror = () => reject(new Error('gsi'));
      document.head.appendChild(s);
    });
  }
  return loading;
}

export function useGoogleSignIn() {
  const signIn = useCallback(async (): Promise<string | null> => {
    await load();
    return new Promise((resolve) => {
      window.google!.accounts.id.initialize({ client_id: CLIENT_ID, callback: (r) => resolve(r.credential ?? null), cancel_on_tap_outside: true });
      window.google!.accounts.id.prompt((n) => { if (n.isNotDisplayed() || n.isSkippedMoment()) resolve(null); });
    });
  }, []);
  return { available: !!CLIENT_ID, signIn };
}
