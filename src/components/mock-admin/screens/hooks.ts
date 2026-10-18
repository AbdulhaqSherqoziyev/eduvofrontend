'use client';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

/** < 760px — the design's phone layout (bottom nav, cards instead of tables). */
export function useIsMobile() {
  const [m, setM] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 759.98px)');
    const on = () => setM(mq.matches);
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return m;
}

/** Filters kept in the URL (shareable, back button works). */
export function useUrlState<T extends Record<string, string>>(defaults: T) {
  const sp = useSearchParams();
  const router = useRouter();
  const path = usePathname();
  const state = Object.fromEntries(Object.entries(defaults).map(([k, v]) => [k, sp.get(k) ?? v])) as T;
  const set = (patch: Partial<T>) => {
    const p = new URLSearchParams(sp.toString());
    for (const [k, v] of Object.entries(patch)) {
      if (v === undefined || v === '' || v === defaults[k]) p.delete(k);
      else p.set(k, String(v));
    }
    const s = p.toString();
    router.replace(`${path}${s ? `?${s}` : ''}`, { scroll: false });
  };
  return [state, set] as const;
}

/** Ticks every `ms` so relative times ("6 daq oldin") stay fresh. */
export function useNow(ms = 60_000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), ms);
    return () => window.clearInterval(t);
  }, [ms]);
  return now;
}
