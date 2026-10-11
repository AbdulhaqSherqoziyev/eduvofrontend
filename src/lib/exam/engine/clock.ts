'use client';
/**
 * Server clock. `deadlineAt` is the only truth (contract §1.4); the device clock
 * may be minutes off. offset = serverNow − (device time at the request midpoint),
 * taken from the lowest-RTT of the last 5 samples (Farrux §B, drift ≤1 s at RTT<500 ms).
 * Every API response feeds a sample; explicit resync on visibility/online/60 s.
 */
import { useEffect, useState } from 'react';
import { examApi, setClockSampler } from '../api';

interface Sample { rtt: number; offset: number }
const samples: Sample[] = [];
let offset = 0;

function addSample(t0: number, t1: number, serverNowIso: string) {
  const server = Date.parse(serverNowIso);
  if (!Number.isFinite(server)) return;
  const rtt = t1 - t0;
  const midWall = Date.now() - (performance.now() - (t0 + t1) / 2);
  samples.push({ rtt, offset: server - midWall });
  while (samples.length > 5) samples.shift();
  offset = samples.reduce((best, s) => (s.rtt < best.rtt ? s : best)).offset;
}

if (typeof window !== 'undefined') setClockSampler(addSample);

export function serverNow(): number {
  return Date.now() + offset;
}

let timeEndpointMissing = false;
/** One explicit sample; falls back silently when `/portal/exams/time` is not deployed yet. */
export async function resyncClock(): Promise<number | null> {
  if (timeEndpointMissing) return null;
  const t0 = performance.now();
  const r = await examApi.time();
  if (!r.ok && r.status === 404) timeEndpointMissing = true;
  return r.ok ? performance.now() - t0 : null;
}

/** Resync on tab return, reconnect and every 60 s while mounted. */
export function useClockSync(active: boolean) {
  useEffect(() => {
    if (!active) return;
    const kick = () => { if (document.visibilityState === 'visible') void resyncClock(); };
    void (async () => { for (let i = 0; i < 3; i++) await resyncClock(); })();
    const iv = window.setInterval(kick, 60_000);
    document.addEventListener('visibilitychange', kick);
    window.addEventListener('online', kick);
    return () => {
      window.clearInterval(iv);
      document.removeEventListener('visibilitychange', kick);
      window.removeEventListener('online', kick);
    };
  }, [active]);
}

/** Re-render every `ms` and return the server time. */
export function useServerNow(ms = 250): number {
  const [t, setT] = useState(() => serverNow());
  useEffect(() => {
    const iv = window.setInterval(() => setT(serverNow()), ms);
    return () => window.clearInterval(iv);
  }, [ms]);
  return t;
}
