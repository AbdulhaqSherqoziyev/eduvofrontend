'use client';
import { useEffect, useState } from 'react';

/** Client-only media query (for portals/overlays that CSS classes cannot hide). false during SSR. */
export function useMedia(query: string): boolean {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const m = window.matchMedia(query);
    const f = () => setOn(m.matches);
    f();
    m.addEventListener('change', f);
    return () => m.removeEventListener('change', f);
  }, [query]);
  return on;
}
export const PHONE_QUERY = '(max-width: 519.98px)';
