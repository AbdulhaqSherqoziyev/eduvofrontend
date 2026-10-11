'use client';
/**
 * Microphone (design G6, T3): the only place the browser asks for mic access.
 * Record 5 s with a 32-bar level meter → Play back → "I can hear my voice".
 * Shown only when the attempt has Speaking (v1 L/R/W attempts never show it).
 */
import { useEffect, useRef, useState } from 'react';
import { useT } from '@/lib/exam/engine/context';
import type { TextKey } from '@/lib/exam/i18n';
import { Bi, Btn } from '../../shell/ui';
import { CheckCard, hint, type CheckStatus } from './CheckCard';

export function MicCard({ status, onStatus }: { status: CheckStatus; onStatus: (s: CheckStatus) => void }) {
  const { t, bi } = useT();
  const [bars, setBars] = useState<number[]>(() => Array(32).fill(0));
  const [left, setLeft] = useState(0);
  const [clip, setClip] = useState<string | null>(null);
  const [err, setErr] = useState<TextKey | null>(null);
  const stop = useRef<(() => void) | null>(null);
  useEffect(() => () => stop.current?.(), []);

  const record = async () => {
    setErr(null);
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') { setErr('errors.browser_unsupported'); onStatus('attention'); return; }
    onStatus('checking');
    let stream: MediaStream;
    try { stream = await navigator.mediaDevices.getUserMedia({ audio: true }); } catch (e) {
      setErr((e as DOMException)?.name === 'NotFoundError' ? 'errors.mic_not_found' : 'errors.mic_denied');
      onStatus('attention');
      return;
    }
    const ctx = new AudioContext();
    const an = ctx.createAnalyser();
    an.fftSize = 64;
    ctx.createMediaStreamSource(stream).connect(an);
    const rec = new MediaRecorder(stream);
    const chunks: Blob[] = [];
    rec.ondataavailable = (e) => chunks.push(e.data);
    rec.onstop = () => setClip(URL.createObjectURL(new Blob(chunks, { type: rec.mimeType })));
    const buf = new Uint8Array(an.frequencyBinCount);
    let raf = 0;
    const loop = () => { an.getByteFrequencyData(buf); setBars(Array.from({ length: 32 }, (_, i) => buf[i % buf.length] / 255)); raf = requestAnimationFrame(loop); };
    loop();
    rec.start();
    let n = 5;
    setLeft(n);
    const iv = window.setInterval(() => { n -= 1; setLeft(n); if (n <= 0) stop.current?.(); }, 1000);
    stop.current = () => {
      window.clearInterval(iv);
      cancelAnimationFrame(raf);
      if (rec.state !== 'inactive') rec.stop();
      stream.getTracks().forEach((tr) => tr.stop());
      void ctx.close();
      setLeft(0);
      stop.current = null;
    };
  };

  return (
    <CheckCard title={t('precheck.mic_title')} status={status}>
      <div style={hint}>{t('precheck.mic_body')}</div>
      <div style={{ fontSize: 12.5, color: 'var(--x-muted)' }}>{t('precheck.mic_permission')}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <Btn h={38} style={{ fontSize: 13 }} disabled={left > 0} onClick={() => void record()}>{left > 0 ? t('precheck.mic_recording', { s: left }) : t('chrome.record_5s')}</Btn>
        <div aria-hidden style={{ flex: 1, height: 28, display: 'flex', alignItems: 'center', gap: 3 }}>
          {bars.map((b, i) => <div key={i} style={{ flex: 1, borderRadius: 2, height: 4 + Math.round(b * 22), background: left > 0 ? 'var(--x-rec)' : status === 'ready' ? 'var(--x-accent)' : 'var(--x-line)' }} />)}
        </div>
      </div>
      {clip && left === 0 && status !== 'ready' && (
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Btn h={38} style={{ fontSize: 13 }} onClick={() => void new Audio(clip).play()}>{t('chrome.play_back')}</Btn>
          <Btn h={38} variant="accent" style={{ fontSize: 13 }} onClick={() => onStatus('ready')}>{t('precheck.mic_yes')}</Btn>
        </div>
      )}
      {err && <div style={{ background: 'var(--x-warn-bg)', borderRadius: 10, padding: '8px 12px' }}><Bi pair={bi(err)} size={13} color="var(--x-warn-fg)" /></div>}
      {err && <Btn h={36} style={{ alignSelf: 'flex-start', fontSize: 13 }} onClick={() => void record()}>{t('chrome.check_again')}</Btn>}
      <div style={{ fontSize: 12.5, color: 'var(--x-muted)' }}>{t('precheck.mic_quiet_room')}</div>
    </CheckCard>
  );
}
