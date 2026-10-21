'use client';
/**
 * One banner at a time (design G7): audio_failed > offline > fullscreen_exited
 * > online_again. Pushes content down, never overlays. tab_noted is a toast
 * above the navigator (H4: bottom ≥ 86px). 10/5-minute warnings are timer tooltips, not banners.
 */
import { AlertTriangle, CheckCircle, Maximize, MicOff } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useExam, useT } from '@/lib/exam/engine/context';
import { requestFullscreen } from '@/lib/exam/engine/integrity';
import type { TextKey } from '@/lib/exam/i18n';

type Kind = 'audio_failed' | 'offline' | 'offline_long' | 'mic_silent' | 'fullscreen_exited' | 'online_again';

function useTick(ms: number) {
  const [, set] = useState(0);
  useEffect(() => { const iv = window.setInterval(() => set((n) => n + 1), ms); return () => window.clearInterval(iv); }, [ms]);
}

/** Speaking: `micSilent` = 9 s of full silence while recording; `queued` = recordings waiting on this device (offline text changes). */
export function Banners({ audioFailed, micSilent, queued }: { audioFailed?: boolean; micSilent?: boolean; queued?: boolean }) {
  const { s } = useExam();
  const { bi, t } = useT();
  useTick(1000);
  const now = Date.now();
  const down = s.syncFailSince != null ? now - s.syncFailSince : 0;
  let kind: Kind | null = null;
  if (audioFailed) kind = 'audio_failed';
  else if (down >= 3000) kind = down >= 60_000 ? 'offline_long' : 'offline';
  else if (micSilent) kind = 'mic_silent';
  else if (s.fsExited) kind = 'fullscreen_exited';
  else if (s.backOnlineAt && now - s.backOnlineAt < 3000) kind = 'online_again';
  if (!kind) return null;

  const ok = kind === 'online_again';
  const key: TextKey = kind.startsWith('offline') && queued ? 'banner.recording_queued' : kind === 'mic_silent' ? 'speaking.cant_hear' : kind === 'offline' ? 'banner.offline' : kind === 'offline_long' ? 'banner.offline_long' : kind === 'audio_failed' ? 'banner.audio_failed' : kind === 'fullscreen_exited' ? 'banner.fullscreen_exited' : 'banner.online_again';
  const pair = bi(key);
  return (
    <div role={ok ? 'status' : 'alert'} style={{ minHeight: 44, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '4px 20px',
      background: ok ? 'var(--x-ok-bg)' : 'var(--x-warn-bg)', color: ok ? 'var(--x-ok-fg)' : 'var(--x-warn-fg)', borderBottom: `1px solid ${ok ? 'transparent' : 'var(--x-warn-border)'}`, borderTop: `1px solid ${ok ? 'transparent' : 'var(--x-warn-border)'}` }}>
      {kind.startsWith('offline') && <span className="x-dot-pulse" style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--x-flag)' }} />}
      {ok && <CheckCircle size={16} aria-hidden />}
      {kind === 'fullscreen_exited' && <Maximize size={16} aria-hidden />}
      {kind === 'audio_failed' && <AlertTriangle size={16} aria-hidden />}
      {kind === 'mic_silent' && <MicOff size={16} aria-hidden />}
      <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <span style={{ fontSize: 13.5, fontWeight: 600 }}>{pair[0]}</span>
        {pair[1] && <span style={{ fontSize: 12, opacity: 0.8 }}>{pair[1]}</span>}
      </span>
      {kind === 'fullscreen_exited' && (
        <button type="button" onClick={requestFullscreen} style={{ background: 'none', border: 'none', color: 'var(--x-link)', fontSize: 13, fontWeight: 700, padding: 0 }}>{t('chrome.return_fullscreen')}</button>
      )}
    </div>
  );
}

/** "Switching away was noted" — 5 s, no counter; 16px above the 70px navigator (= 86px from the bottom, H4). */
export function TabToast() {
  const { s, dispatch } = useExam();
  const { bi } = useT();
  useEffect(() => {
    if (!s.tabNotedAt) return;
    const tm = window.setTimeout(() => dispatch({ t: 'TAB_NOTED', at: null }), 5000);
    return () => window.clearTimeout(tm);
  }, [s.tabNotedAt, dispatch]);
  if (!s.tabNotedAt) return null;
  const pair = bi('banner.tab_noted');
  return (
    <div role="status" className="x-fade-in" style={{ position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)', zIndex: 25, minHeight: 40, borderRadius: 12, background: 'var(--x-panel)', border: '1px solid var(--x-line)', boxShadow: 'var(--x-menu-shadow)', padding: '6px 16px', textAlign: 'center' }}>
      <div style={{ fontSize: 13.5, fontWeight: 600 }}>{pair[0]}</div>
      {pair[1] && <div style={{ fontSize: 12, color: 'var(--x-muted)' }}>{pair[1]}</div>}
    </div>
  );
}
