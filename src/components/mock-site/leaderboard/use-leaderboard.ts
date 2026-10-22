'use client';
/**
 * L1 loader shared by the landing block and the dashboard card. Keeps the previous tab's data on
 * screen while the next one loads (§3.5 "opacity .5 + aria-busy"), skeleton rows only after 300 ms,
 * per-instance cache so switching back is instant. `timeoutMs` (landing: 4 s) turns a slow answer
 * into an error.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { MockApiError } from '@/lib/mock/api/client';
import { getLeaderboard } from '@/lib/mock/api/endpoints';
import type { Leaderboard, LbExam, LbPeriod } from '@/lib/mock/api/types';
import { useDelayedFlag } from '@/lib/mock/hooks/use-delayed';

export interface LbState { data: Leaderboard | null; receivedAt: number; loading: boolean; error: boolean }
const FRESH_MS = 60_000;

export function useLeaderboard({ enabled, period, exam, timeoutMs, before }: {
  enabled: boolean; period: LbPeriod; exam: LbExam; timeoutMs?: number; before?: () => Promise<unknown>;
}) {
  const [st, setSt] = useState<LbState>({ data: null, receivedAt: 0, loading: false, error: false });
  const cache = useRef(new Map<string, { data: Leaderboard; at: number }>());
  const [nonce, setNonce] = useState(0);
  const key = `${period}:${exam}`;

  useEffect(() => {
    if (!enabled) return;
    const hit = cache.current.get(key);
    if (hit && Date.now() - hit.at < FRESH_MS) { setSt({ data: hit.data, receivedAt: hit.at, loading: false, error: false }); return; }
    const ac = new AbortController();
    let timedOut = false;
    const timer = timeoutMs ? window.setTimeout(() => { timedOut = true; ac.abort(); }, timeoutMs) : 0;
    setSt((s) => ({ ...s, loading: true, error: false }));
    (async () => {
      try {
        if (before) await before();
        const data = await getLeaderboard({ period, exam }, ac.signal);
        const at = Date.now();
        cache.current.set(key, { data, at });
        setSt({ data, receivedAt: at, loading: false, error: false });
      } catch (e) {
        if ((e as Error)?.name === 'AbortError' && !timedOut) return;
        if (!(e instanceof MockApiError) && (e as Error)?.name !== 'AbortError') console.error('leaderboard', e);
        setSt((s) => ({ ...s, loading: false, error: true }));
      } finally { window.clearTimeout(timer); }
    })();
    return () => { window.clearTimeout(timer); ac.abort(); };
    // `before` is a stable module function at every call site
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, key, nonce, timeoutMs]);

  const retry = useCallback(() => { cache.current.clear(); setNonce((n) => n + 1); }, []);
  /** optimistic local change (hide/show own name); drops the cache so the next tab refetches */
  const patch = useCallback((fn: (d: Leaderboard) => Leaderboard) => {
    cache.current.clear();
    setSt((s) => (s.data ? { ...s, data: fn(s.data) } : s));
  }, []);
  const skel = useDelayedFlag(st.loading && !!st.data);
  return { ...st, skel, retry, patch };
}
