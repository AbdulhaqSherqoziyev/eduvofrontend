'use client';

import { useEffect, useState } from 'react';

/**
 * Connection state for the cash desk.
 *
 * Starts `true` so the server render and the first paint never flash an
 * offline bar at someone who is online (§A.8). The screens that use it never
 * queue a write for later — a money entry sent quietly ten minutes on is worse
 * than one that was not sent at all (§B.7).
 */
export function useOnline(): boolean {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    const sync = () => setOnline(navigator.onLine);
    sync();
    window.addEventListener('online', sync);
    window.addEventListener('offline', sync);
    return () => {
      window.removeEventListener('online', sync);
      window.removeEventListener('offline', sync);
    };
  }, []);

  return online;
}
