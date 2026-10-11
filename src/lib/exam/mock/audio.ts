/**
 * Synthesized "recording" for the mock: 8 kHz mono PCM WAV with soft
 * speech-like tone bursts, served through a throttled stream so the real
 * preload progress UI ("Preparing audio… 64%") is exercised.
 */
const RATE = 8000;

export function synthWav(durationMs: number, seed = 1): Uint8Array<ArrayBuffer> {
  const n = Math.max(1, Math.round((durationMs / 1000) * RATE));
  const buf = new ArrayBuffer(44 + n * 2);
  const v = new DataView(buf);
  const str = (o: number, s: string) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
  str(0, 'RIFF'); v.setUint32(4, 36 + n * 2, true); str(8, 'WAVE'); str(12, 'fmt ');
  v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
  v.setUint32(24, RATE, true); v.setUint32(28, RATE * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true);
  str(36, 'data'); v.setUint32(40, n * 2, true);
  for (let i = 0; i < n; i++) {
    const t = i / RATE;
    const syll = (t * 3.1 + seed) % 1; // ~3 "syllables" per second
    const gap = Math.floor(t / 2.4 + seed) % 4 === 3; // a pause every few seconds
    const env = gap ? 0 : Math.sin(Math.PI * Math.min(1, syll / 0.7)) * (syll < 0.7 ? 1 : 0);
    const f = 170 + 60 * Math.sin(t * 1.3 + seed);
    const s = env * 0.12 * (Math.sin(2 * Math.PI * f * t) + 0.4 * Math.sin(4 * Math.PI * f * t));
    v.setInt16(44 + i * 2, Math.max(-1, Math.min(1, s)) * 32767, true);
  }
  return new Uint8Array(buf);
}

/** Response whose body arrives at ~bytesPerSec, with Content-Length for progress. */
export function throttledResponse(bytes: Uint8Array<ArrayBuffer>, bytesPerSec = 420_000, signal?: AbortSignal): Response {
  const chunk = 16_384;
  let off = 0;
  const stream = new ReadableStream<Uint8Array>({
    async pull(ctrl) {
      if (signal?.aborted) { ctrl.error(new DOMException('aborted', 'AbortError')); return; }
      if (off >= bytes.length) { ctrl.close(); return; }
      await new Promise((r) => setTimeout(r, (chunk / bytesPerSec) * 1000));
      ctrl.enqueue(bytes.subarray(off, off + chunk));
      off += chunk;
    },
  });
  return new Response(stream, { headers: { 'Content-Type': 'audio/wav', 'Content-Length': String(bytes.length) } });
}

/** A short 440 Hz chime for the pre-check "Play sample" (works offline, no asset). */
export function sampleToneUrl(): string {
  const n = RATE * 2;
  const bytes = synthWav(2000, 0.3);
  const v = new DataView(bytes.buffer);
  for (let i = 0; i < n; i++) {
    const t = i / RATE;
    const env = Math.min(1, t * 8) * Math.min(1, (2 - t) * 4);
    v.setInt16(44 + i * 2, Math.sin(2 * Math.PI * 440 * t) * env * 0.25 * 32767, true);
  }
  return URL.createObjectURL(new Blob([bytes.buffer as ArrayBuffer], { type: 'audio/wav' }));
}
