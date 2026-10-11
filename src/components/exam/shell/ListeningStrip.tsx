'use client';
/**
 * Listening strip + the hidden <audio> it drives (design A4, Sevara T9–T11).
 * Position comes from the server clock, so reloads resume mid-recording and
 * seeking/pausing are undone on the next tick. Volume is the only control.
 */
import { useEffect, useMemo, useRef } from 'react';
import { buildTimeline, chainEnd, segAt } from '@/lib/exam/engine/audio-chain';
import { useServerNow } from '@/lib/exam/engine/clock';
import { useExam, useT } from '@/lib/exam/engine/context';
import { blobUrlFor } from '@/lib/exam/engine/media';
import { partNos, partsOf } from '@/lib/exam/engine/selectors';
import { fmtClock, fmtMSS, parseIso } from '@/lib/exam/format';

export function useListeningChain() {
  const { s, stage, stageCfg } = useExam();
  const parts = partsOf(s.content);
  const audioDriven = stageCfg?.timer.mode === 'audio_driven';
  const tl = useMemo(() => buildTimeline(parts.map((p) => p.audioDurationMs ?? 0), stageCfg?.audio, audioDriven), [parts, stageCfg?.audio, audioDriven]);
  const start = parseIso(stage?.audioStartedAt ?? stage?.startedAt) ?? 0;
  return { tl, start, parts, audioDriven, end: chainEnd(tl) };
}

export function ListeningStrip({ onAudioError }: { onAudioError: (failed: boolean) => void }) {
  const { s, stage, stageCfg, dispatch, setUi } = useExam();
  const { t } = useT();
  const { tl, start, parts, end } = useListeningChain();
  const now = useServerNow(250);
  const audioRef = useRef<HTMLAudioElement>(null);
  const lastPart = useRef<number>(-1);
  const elapsed = now - start;
  const { seg, offset } = segAt(tl, elapsed);
  const plays = stageCfg?.audio?.play_count ?? 1;

  // drive the element from the server clock
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    a.volume = s.ui.volume;
    if (seg.kind !== 'play') { if (!a.paused) a.pause(); return; }
    const url = blobUrlFor(parts[seg.part]?.audioAssetId);
    if (!url) return; // tech-skipped part: silence, no error for the student
    if (a.src !== url) a.src = url;
    const want = offset / 1000;
    if (Math.abs(a.currentTime - want) > 1.5) { try { a.currentTime = want; } catch { /* not seekable yet */ } }
    if (a.paused) void a.play().then(() => onAudioError(false)).catch(() => undefined);
  });

  // move the question pane to the part whose audio is about to start (cefr.md §4)
  useEffect(() => {
    if (seg.part !== lastPart.current && seg.kind !== 'review' && seg.kind !== 'done') {
      lastPart.current = seg.part;
      const firstQ = parts[seg.part]?.groups[0]?.questions[0]?.id ?? null;
      dispatch({ t: 'GOTO', partIdx: seg.part, q: firstQ });
    }
  }, [seg.part, seg.kind, parts, dispatch]);

  const p = parts[seg.part];
  const nos = p ? partNos(p) : [];
  const [a, b] = nos.length ? [Math.min(...nos), Math.max(...nos)] : [0, 0];
  const deadline = parseIso(stage?.deadlineAt) ?? now;
  let label = '';
  let note = '';
  if (seg.kind === 'leadin') label = t('listening.countdown', { n: Math.ceil((seg.end - elapsed) / 1000), a, b });
  else if (seg.kind === 'prep') label = t('listening.prep', { p: p?.part ?? seg.part + 1, t: fmtMSS((seg.end - elapsed) / 1000), a, b });
  else if (seg.kind === 'play' || seg.kind === 'gap') {
    label = t('listening.playing', { n: seg.part + 1, m: parts.length });
    note = plays > 1 ? t(seg.play >= 2 || seg.kind === 'gap' ? 'listening.play_2_of_2' : 'listening.play_1_of_2') : t('listening.plays_once');
  } else if (seg.kind === 'review') label = t('listening.review');
  else label = t('listening.all_finished', { t: fmtClock((deadline - now) / 1000) });
  const playing = seg.kind === 'play';
  const pct = Math.min(100, (Math.max(0, elapsed) / Math.max(1, end)) * 100);
  const vol = Math.round(s.ui.volume * 100);

  return (
    <div style={{ flexShrink: 0, padding: '14px 22px 0' }}>
      <audio ref={audioRef} preload="auto" onError={() => onAudioError(true)} style={{ display: 'none' }} />
      <div style={{ background: 'var(--x-panel)', border: '1px solid var(--x-line)', borderRadius: 14, padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 16 }}>
        <div aria-hidden style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 20, width: 22 }}>
          {[10, 18, 8, 14].map((h, i) => (
            <div key={i} className={playing ? 'x-eq' : undefined} style={{ width: 4, height: playing ? h + 2 : 4, borderRadius: 2, background: playing ? 'var(--x-accent)' : 'var(--x-line)', animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
        <span role="status" aria-live="polite" style={{ fontSize: 13.5, fontWeight: 800, whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>{label}</span>
        <div style={{ flex: 1, height: 5, borderRadius: 3, background: 'var(--x-track)' }}><div style={{ height: '100%', borderRadius: 3, background: 'var(--x-accent)', width: `${pct}%` }} /></div>
        {note && <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--x-muted)', whiteSpace: 'nowrap' }}>{note}</span>}
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 700, color: 'var(--x-muted)' }}>
          {t('chrome.volume')}
          <input type="range" min={0} max={100} value={vol} onChange={(e) => setUi({ volume: Number(e.target.value) / 100 })} style={{ width: 90, accentColor: 'var(--x-ink)' }} />
        </label>
      </div>
    </div>
  );
}
