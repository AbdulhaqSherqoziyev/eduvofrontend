/**
 * Microphone + MediaRecorder for Speaking (Aziza §2.5, contract §2): mono, echo cancellation,
 * auto gain, NO noise suppression; `audio/webm;codecs=opus` 32 kbps, Safari falls back to `audio/mp4`.
 * The same constraints are used by the pre-check, the intro trial and the exam itself.
 */
export const MIC_CONSTRAINTS: MediaStreamConstraints = {
  audio: { channelCount: 1, echoCancellation: true, autoGainControl: true, noiseSuppression: false },
};
const MIMES = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4;codecs=mp4a.40.2', 'audio/mp4', 'audio/ogg;codecs=opus'];

export const canRecord = () => typeof window !== 'undefined' && !!navigator.mediaDevices?.getUserMedia && typeof MediaRecorder !== 'undefined';

export function pickMime(): string {
  if (typeof MediaRecorder === 'undefined') return '';
  return MIMES.find((m) => { try { return MediaRecorder.isTypeSupported(m); } catch { return false; } }) ?? '';
}

export type MicError = 'errors.mic_denied' | 'errors.mic_not_found' | 'errors.browser_unsupported';

/** getUserMedia with the exam constraints; maps failures to the player's text keys. */
export async function openMic(): Promise<{ ok: true; stream: MediaStream } | { ok: false; err: MicError }> {
  if (!canRecord()) return { ok: false, err: 'errors.browser_unsupported' };
  try {
    return { ok: true, stream: await navigator.mediaDevices.getUserMedia(MIC_CONSTRAINTS) };
  } catch (e) {
    const n = (e as DOMException)?.name;
    return { ok: false, err: n === 'NotFoundError' || n === 'OverconstrainedError' || n === 'NotReadableError' ? 'errors.mic_not_found' : 'errors.mic_denied' };
  }
}

/** 'prompt' when the browser will ask (or the Permissions API can't tell). */
export async function micPermission(): Promise<'granted' | 'denied' | 'prompt'> {
  try {
    const st = await navigator.permissions.query({ name: 'microphone' as PermissionName });
    return st.state === 'granted' || st.state === 'denied' ? st.state : 'prompt';
  } catch {
    return 'prompt';
  }
}

export function newRecorder(stream: MediaStream): MediaRecorder {
  const mimeType = pickMime();
  return new MediaRecorder(stream, { ...(mimeType ? { mimeType } : {}), audioBitsPerSecond: 32_000 });
}

/** Level meter on a stream: `bars(n)` for the UI, `rms()` in dBFS, `clip()` = share of |x| ≥ 0.99 samples. */
export interface Meter { bars: (n: number) => number[]; db: () => number; clipped: () => number; close: () => void }

export function meter(stream: MediaStream): Meter {
  const AC: typeof AudioContext = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const ctx = new AC();
  const an = ctx.createAnalyser();
  an.fftSize = 1024;
  ctx.createMediaStreamSource(stream).connect(an);
  const td = new Float32Array(an.fftSize);
  const read = () => { an.getFloatTimeDomainData(td); return td; };
  return {
    bars(n) {
      const d = read();
      const step = Math.floor(d.length / n);
      return Array.from({ length: n }, (_, i) => {
        let m = 0;
        for (let k = i * step; k < (i + 1) * step; k++) m = Math.max(m, Math.abs(d[k]));
        return Math.min(1, m * 2.2);
      });
    },
    db() {
      const d = read();
      let sum = 0;
      for (let i = 0; i < d.length; i++) sum += d[i] * d[i];
      const rms = Math.sqrt(sum / d.length);
      return rms > 0 ? 20 * Math.log10(rms) : -120;
    },
    clipped() {
      const d = read();
      let c = 0;
      for (let i = 0; i < d.length; i++) if (Math.abs(d[i]) >= 0.99) c++;
      return c / d.length;
    },
    close() { void ctx.close().catch(() => undefined); },
  };
}
