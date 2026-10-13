'use client';
/**
 * Cloudflare Turnstile (contract §0.7). Active only when NEXT_PUBLIC_TURNSTILE_SITE_KEY is set;
 * otherwise `token` is '' and the backend skips the check (dev, TURNSTILE_SECRET empty).
 * Render `<div ref={ref} />` where the widget may appear (managed mode shows it only when needed).
 */
import { useCallback, useEffect, useRef, useState } from 'react';

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '';
const SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

interface TurnstileApi { render: (el: HTMLElement, o: Record<string, unknown>) => string; reset: (id: string) => void; remove: (id: string) => void }
declare global { interface Window { turnstile?: TurnstileApi } }

let loading: Promise<void> | null = null;
function loadScript() {
  if (window.turnstile) return Promise.resolve();
  if (!loading) {
    loading = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = SRC; s.async = true; s.defer = true;
      s.onload = () => resolve(); s.onerror = () => reject(new Error('turnstile'));
      document.head.appendChild(s);
    });
  }
  return loading;
}

export function useTurnstile(enabled = true) {
  const ref = useRef<HTMLDivElement>(null);
  const id = useRef<string | null>(null);
  const [token, setToken] = useState('');
  const active = !!SITE_KEY && enabled;
  useEffect(() => {
    if (!active || !ref.current) return;
    let cancelled = false;
    loadScript().then(() => {
      if (cancelled || !ref.current || !window.turnstile) return;
      id.current = window.turnstile.render(ref.current, {
        sitekey: SITE_KEY,
        appearance: 'interaction-only',
        callback: (t: string) => setToken(t),
        'expired-callback': () => setToken(''),
      });
    }).catch(() => undefined);
    return () => { cancelled = true; if (id.current && window.turnstile) window.turnstile.remove(id.current); id.current = null; };
  }, [active]);
  const reset = useCallback(() => { setToken(''); if (id.current && window.turnstile) window.turnstile.reset(id.current); }, []);
  return { ref, token, active, reset };
}
