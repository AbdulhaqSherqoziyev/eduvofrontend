'use client';
/**
 * Integrity log (brief §6, Sevara T6–T8): fullscreen exit, tab switch, window
 * blur, copy → batched to the server for the centre's report. Never blocks:
 * the student only sees the fullscreen banner and one 5 s "noted" toast.
 */
import { useCallback, useEffect, useRef } from 'react';
import { examApi } from '../api';
import type { IntegrityEvent, IntegrityType } from '../types';
import type { Action } from './reducer';

interface Opts { attemptId: string; stageKey: string | null; active: boolean; dispatch: (a: Action) => void }

export function requestFullscreen(): void {
  try {
    const el = document.documentElement;
    if (!document.fullscreenElement && el.requestFullscreen) void el.requestFullscreen().catch(() => undefined);
  } catch {
    /* not allowed (iframe / browser) — the exam runs anyway */
  }
}

export function useIntegrity({ attemptId, stageKey, active, dispatch }: Opts) {
  const queue = useRef<IntegrityEvent[]>([]);
  const wasFs = useRef(false);
  const sk = useRef(stageKey);
  sk.current = stageKey;

  const log = useCallback((type: IntegrityType, meta?: Record<string, unknown>) => {
    queue.current.push({ type, at: new Date().toISOString(), stageKey: sk.current ?? undefined, meta });
  }, []);

  const flush = useCallback(async () => {
    if (!queue.current.length) return;
    const batch = queue.current.splice(0, 50);
    const r = await examApi.integrity(attemptId, batch);
    if (!r.ok) queue.current.unshift(...batch);
  }, [attemptId]);

  useEffect(() => {
    if (!active) return;
    let blurTimer: number | null = null;
    const onFs = () => {
      if (document.fullscreenElement) { wasFs.current = true; dispatch({ t: 'FS', exited: false }); return; }
      if (wasFs.current) { log('fullscreen_exit'); dispatch({ t: 'FS', exited: true }); }
    };
    const onVis = () => {
      if (document.visibilityState === 'hidden') log('tab_switch');
      else dispatch({ t: 'TAB_NOTED', at: Date.now() });
    };
    const onBlur = () => {
      blurTimer = window.setTimeout(() => {
        if (document.visibilityState === 'visible' && !document.hasFocus()) { log('window_blur'); dispatch({ t: 'TAB_NOTED', at: Date.now() }); }
      }, 800);
    };
    const onFocus = () => { if (blurTimer) window.clearTimeout(blurTimer); };
    const onCopy = (e: ClipboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t?.closest?.('[data-exam-editor]')) return; // internal clipboard is allowed in the essay editor (D-7)
      e.preventDefault();
      log('copy');
    };
    const onMenu = (e: MouseEvent) => { if (!(e.target as HTMLElement | null)?.closest?.('[data-exam-editor]')) e.preventDefault(); };
    const iv = window.setInterval(() => void flush(), 10_000);
    document.addEventListener('fullscreenchange', onFs);
    document.addEventListener('visibilitychange', onVis);
    window.addEventListener('blur', onBlur);
    window.addEventListener('focus', onFocus);
    document.addEventListener('copy', onCopy);
    document.addEventListener('cut', onCopy);
    document.addEventListener('contextmenu', onMenu);
    window.addEventListener('pagehide', flush);
    if (document.fullscreenElement) wasFs.current = true;
    return () => {
      window.clearInterval(iv);
      document.removeEventListener('fullscreenchange', onFs);
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('blur', onBlur);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('copy', onCopy);
      document.removeEventListener('cut', onCopy);
      document.removeEventListener('contextmenu', onMenu);
      window.removeEventListener('pagehide', flush);
      void flush();
    };
  }, [active, dispatch, flush, log]);

  return { log };
}
