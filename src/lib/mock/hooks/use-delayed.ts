'use client';
import { useEffect, useState } from 'react';

/** true only after `active` has stayed true for `ms` — skeletons appear after 300 ms (README Motion). */
export function useDelayedFlag(active: boolean, ms = 300): boolean {
  const [on, setOn] = useState(false);
  useEffect(() => {
    if (!active) { setOn(false); return; }
    const t = window.setTimeout(() => setOn(true), ms);
    return () => window.clearTimeout(t);
  }, [active, ms]);
  return on;
}
