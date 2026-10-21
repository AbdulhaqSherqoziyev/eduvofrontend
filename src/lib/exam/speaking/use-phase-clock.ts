'use client';
/** Milliseconds since the current Speaking phase began, ticking every 100 ms (drives transitions and the progress line). */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export function usePhaseClock() {
  const t0 = useRef(typeof performance !== 'undefined' ? performance.now() : 0);
  const [elapsedMs, setEl] = useState(0);
  useEffect(() => {
    const iv = window.setInterval(() => setEl(performance.now() - t0.current), 100);
    return () => window.clearInterval(iv);
  }, []);
  const reset = useCallback(() => { t0.current = performance.now(); setEl(0); }, []);
  return useMemo(() => ({ elapsedMs, reset }), [elapsedMs, reset]);
}
