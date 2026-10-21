'use client';
/**
 * The Speaking stage's microphone: one stream for the whole stage, a level meter, and
 * disconnect detection (track `ended`, device unplugged, permission revoked — spec §1.6).
 * `silent` = full silence (< −60 dBFS) for 9 s while recording (spec §1.3 "cant_hear", M7);
 * it clears as soon as signal returns. Speaking quietly or not speaking is never flagged.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { meter, openMic, type Meter, type MicError } from './recorder';

const SILENT_DB = -60;
const SILENT_MS = 9000;

export function useMic(onLost: () => void) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const meterRef = useRef<Meter | null>(null);
  const lostRef = useRef(onLost);
  lostRef.current = onLost;

  const close = useCallback(() => {
    meterRef.current?.close();
    meterRef.current = null;
    setStream((s) => { s?.getTracks().forEach((t) => { t.onended = null; t.stop(); }); return null; });
  }, []);

  const open = useCallback(async (): Promise<{ ok: true; stream: MediaStream; meter: Meter } | { ok: false; err: MicError }> => {
    close();
    const r = await openMic();
    if (!r.ok) return r;
    const m = meter(r.stream);
    meterRef.current = m;
    r.stream.getAudioTracks().forEach((t) => { t.onended = () => lostRef.current(); });
    setStream(r.stream);
    return { ok: true, stream: r.stream, meter: m };
  }, [close]);

  // device unplugged without `ended` (some browsers) / permission revoked
  useEffect(() => {
    if (!stream) return;
    const check = async () => {
      const ended = stream.getAudioTracks().every((t) => t.readyState === 'ended');
      const devs = await navigator.mediaDevices.enumerateDevices().catch(() => null);
      if (ended || (devs && !devs.some((d) => d.kind === 'audioinput'))) lostRef.current();
    };
    navigator.mediaDevices?.addEventListener?.('devicechange', check);
    let perm: PermissionStatus | null = null;
    void navigator.permissions?.query({ name: 'microphone' as PermissionName }).then((p) => { perm = p; p.onchange = () => { if (p.state === 'denied') lostRef.current(); }; }).catch(() => undefined);
    return () => { navigator.mediaDevices?.removeEventListener?.('devicechange', check); if (perm) perm.onchange = null; };
  }, [stream]);

  useEffect(() => () => close(), [close]);
  return { stream, meter: meterRef, open, close };
}

/** Live wave (52 bars, 20 fps; 4 fps with reduced motion) + the 9 s full-silence flag — only while `on`. */
export function useWave(m: React.MutableRefObject<Meter | null>, on: boolean, n = 52) {
  const [bars, setBars] = useState<number[]>(() => Array(n).fill(0));
  const [silent, setSilent] = useState(false);
  useEffect(() => {
    if (!on) { setBars(Array(n).fill(0)); setSilent(false); return; }
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    let quietSince: number | null = null;
    const iv = window.setInterval(() => {
      const mt = m.current;
      if (!mt) return;
      setBars(mt.bars(n));
      const db = mt.db();
      const now = performance.now();
      if (db < SILENT_DB) { quietSince = quietSince ?? now; if (now - quietSince >= SILENT_MS) setSilent(true); } else { quietSince = null; setSilent(false); }
    }, reduced ? 250 : 50);
    return () => window.clearInterval(iv);
  }, [m, on, n]);
  return { bars, silent };
}
