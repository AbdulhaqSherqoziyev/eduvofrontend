'use client';
/**
 * AudioClip (spec §2.2): 40px row — 32px round play/pause, 4px track (12px thumb on hover/focus),
 * "0:42 / 1:58". idle → loading → playing → ended (back to 0). One clip at a time (play-bus).
 * Track: ←/→ = 5 s. `preload="none"`, never auto-plays; `playNonce` changes only on a user click
 * elsewhere (a quote's play button). Load failure → retry button + `results.audio_load_failed`.
 */
import { Pause, Play, RotateCcw } from 'lucide-react';
import { useContext, useEffect, useRef, useState } from 'react';
import { absMedia } from '@/lib/exam/api';
import { t } from '@/lib/exam/i18n';
import { Ctx } from './context';
import { claim, release } from './play-bus';
import { mmss, SKINS } from './skin';

type St = 'idle' | 'loading' | 'playing' | 'paused' | 'error';

/** Self-animating spinner (SVG SMIL) — works in all three skins without page CSS. */
export function Spin({ color, size = 14 }: { color: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" aria-hidden>
      <circle cx="8" cy="8" r="6" fill="none" stroke="#D5DCE6" strokeWidth="2" />
      <path d="M8 2a6 6 0 0 1 6 6" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round">
        <animateTransform attributeName="transform" type="rotate" from="0 8 8" to="360 8 8" dur="0.9s" repeatCount="indefinite" />
      </path>
    </svg>
  );
}

export function AudioClip({ url, durationMs, playNonce, wide }: { url: string; durationMs: number | null; playNonce?: number; wide?: boolean }) {
  // usable outside the panel too (staff answers table): hub palette + Uzbek console strings
  const c = useContext(Ctx);
  const s = c?.skin ?? SKINS.hub;
  const tx = c?.tx ?? ((k: Parameters<typeof t>[0]) => t(k, 'uz'));
  const ref = useRef<HTMLAudioElement>(null);
  const [st, setSt] = useState<St>('idle');
  const [pos, setPos] = useState(0);
  const [dur, setDur] = useState((durationMs ?? 0) / 1000);
  const [hover, setHover] = useState(false);
  const src = absMedia(url);

  const play = () => {
    const a = ref.current;
    if (!a) return;
    claim(a);
    if (a.readyState < 2) setSt('loading');
    void a.play().catch(() => setSt('error'));
  };
  const toggle = () => { const a = ref.current; if (!a) return; if (st === 'playing') a.pause(); else play(); };
  const seek = (sec: number) => { const a = ref.current; if (!a) return; a.currentTime = Math.max(0, Math.min(dur || a.duration || 0, sec)); setPos(a.currentTime); };
  const retry = () => { const a = ref.current; if (!a) return; a.load(); setSt('idle'); play(); };

  useEffect(() => {
    if (!playNonce) return;
    const a = ref.current;
    if (!a) return;
    a.currentTime = 0;
    play();
  }, [playNonce]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => () => { if (ref.current) { ref.current.pause(); release(ref.current); } }, []);

  const pct = dur > 0 ? Math.min(100, (pos / dur) * 100) : 0;
  const btn = { width: wide ? 40 : 32, height: wide ? 40 : 32, borderRadius: '50%', flexShrink: 0, display: 'grid', placeItems: 'center', cursor: 'pointer',
    border: st === 'playing' ? 'none' : '1.5px solid #D5DCE6', background: st === 'playing' ? s.accent : 'transparent', color: st === 'playing' ? '#fff' : s.ink } as const;

  return (
    <div className="print-hide" style={{ display: 'flex', alignItems: 'center', gap: 10, minHeight: 40, width: '100%', minWidth: 0 }}>
      <audio ref={ref} src={src} preload="none"
        onLoadedMetadata={(e) => { const d = e.currentTarget.duration; if (Number.isFinite(d) && d > 0) setDur(d); }}
        onPlaying={() => setSt('playing')} onPause={() => setSt((x) => (x === 'error' ? x : 'paused'))} onWaiting={() => setSt('loading')}
        onTimeUpdate={(e) => setPos(e.currentTarget.currentTime)} onError={() => setSt('error')}
        onEnded={(e) => { e.currentTarget.currentTime = 0; setPos(0); setSt('idle'); release(e.currentTarget); }} />
      {st === 'error' ? (
        <>
          <button type="button" onClick={retry} aria-label={tx('chrome.retry')} style={{ ...btn, border: '1.5px solid #D5DCE6', background: 'transparent', color: s.ink }}><RotateCcw size={14} aria-hidden /></button>
          <span style={{ fontSize: 12, color: s.muted }}>{tx('results.audio_load_failed')}</span>
        </>
      ) : (
        <>
          <button type="button" onClick={toggle} aria-label={tx('results.listen_answer')} aria-pressed={st === 'playing'} style={btn}>
            {st === 'loading' ? <Spin color={s.accent} />
              : st === 'playing' ? <Pause size={14} aria-hidden /> : <Play size={14} aria-hidden />}
          </button>
          <div role="slider" tabIndex={0} aria-label={tx('results.listen_answer')} aria-valuemin={0} aria-valuemax={Math.round(dur)} aria-valuenow={Math.round(pos)} aria-valuetext={`${mmss(pos)} / ${mmss(dur)}`}
            onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} onFocus={() => setHover(true)} onBlur={() => setHover(false)}
            onKeyDown={(e) => { if (e.key === 'ArrowRight') { e.preventDefault(); seek(pos + 5); } if (e.key === 'ArrowLeft') { e.preventDefault(); seek(pos - 5); } }}
            onClick={(e) => { const r = e.currentTarget.getBoundingClientRect(); seek(((e.clientX - r.left) / r.width) * dur); }}
            style={{ flex: 1, minWidth: 40, height: 16, display: 'flex', alignItems: 'center', cursor: 'pointer', outline: 'none', position: 'relative' }}>
            <div style={{ width: '100%', height: 4, borderRadius: 2, background: s.track, position: 'relative' }}>
              <div style={{ position: 'absolute', inset: 0, width: `${pct}%`, borderRadius: 2, background: s.accent }} />
              {hover && <span style={{ position: 'absolute', top: -4, left: `calc(${pct}% - 6px)`, width: 12, height: 12, borderRadius: '50%', background: s.accent }} />}
            </div>
          </div>
          <span style={{ fontSize: 12, fontWeight: 700, color: s.sub, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>{mmss(pos)} / {mmss(dur)}</span>
        </>
      )}
    </div>
  );
}
