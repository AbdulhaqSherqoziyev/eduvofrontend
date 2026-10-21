'use client';
/**
 * Timed microphone test (pre-check 5 s, Speaking intro trial 10 s — spec §1.1-b, §1.2):
 * records with the exam constraints, draws a live meter, then judges the level (level.ts).
 * The clip stays in memory for "Play back" only — never uploaded or stored.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { judge, type Verdict } from './level';
import { meter, newRecorder, openMic, type MicError } from './recorder';

export { LEVEL, judge, type Verdict } from './level';

export function useLevelTest(seconds: number, nBars: number) {
  const [left, setLeft] = useState(0);
  const [bars, setBars] = useState<number[]>(() => Array(nBars).fill(0));
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [clip, setClip] = useState<string | null>(null);
  const [err, setErr] = useState<MicError | null>(null);
  const stopRef = useRef<(() => void) | null>(null);
  useEffect(() => () => stopRef.current?.(), []);
  useEffect(() => () => { if (clip) URL.revokeObjectURL(clip); }, [clip]);

  const start = useCallback(async () => {
    setErr(null);
    setVerdict(null);
    const r = await openMic();
    if (!r.ok) { setErr(r.err); return false; }
    const stream = r.stream;
    const m = meter(stream);
    const rec = newRecorder(stream);
    const chunks: Blob[] = [];
    const dbs: number[] = [];
    const clips: number[] = [];
    rec.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data); };
    rec.onstop = () => setClip(URL.createObjectURL(new Blob(chunks, { type: rec.mimeType || 'audio/webm' })));
    let raf = 0;
    let lastBar = 0;
    const loop = (ts: number) => {
      if (ts - lastBar > 50) { setBars(m.bars(nBars)); lastBar = ts; }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    const sample = window.setInterval(() => { dbs.push(m.db()); clips.push(m.clipped()); }, 100);
    rec.start();
    let n = seconds;
    setLeft(n);
    const iv = window.setInterval(() => { n -= 1; setLeft(n); if (n <= 0) finish(true); }, 1000);
    const finish = (judgeIt: boolean) => {
      window.clearInterval(iv);
      window.clearInterval(sample);
      cancelAnimationFrame(raf);
      if (rec.state !== 'inactive') rec.stop();
      stream.getTracks().forEach((tr) => tr.stop());
      m.close();
      setLeft(0);
      setBars(Array(nBars).fill(0));
      stopRef.current = null;
      if (judgeIt) setVerdict(judge(dbs, clips));
    };
    stopRef.current = () => finish(false);
    return true;
  }, [seconds, nBars]);

  const play = useCallback(() => { if (clip) void new Audio(clip).play().catch(() => undefined); }, [clip]);
  return { left, recording: left > 0, bars, verdict, clip, err, start, play };
}
