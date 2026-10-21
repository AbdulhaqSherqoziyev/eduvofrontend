/**
 * One clip at a time (spec §2.2 AudioClip): starting any recording pauses the one that was playing.
 * Snippets (quote 6 s, word 1.5 s from `startMs`) go through the same bus. Never auto-plays (T6).
 */
let current: HTMLAudioElement | null = null;
let snippet: HTMLAudioElement | null = null;
let snippetTimer: number | undefined;

export function claim(a: HTMLAudioElement) {
  if (current && current !== a) current.pause();
  current = a;
}

export function release(a: HTMLAudioElement) {
  if (current === a) current = null;
}

/** Plays `url` from `fromMs` for `durMs`, on a user gesture only. */
export function playSnippet(url: string, fromMs: number, durMs: number) {
  window.clearTimeout(snippetTimer);
  snippet?.pause();
  const a = new Audio(url);
  snippet = a;
  claim(a);
  const start = () => {
    try { a.currentTime = Math.max(0, fromMs / 1000); } catch { /* not seekable yet */ }
    void a.play().catch(() => undefined);
    snippetTimer = window.setTimeout(() => a.pause(), durMs);
  };
  if (a.readyState >= 1) start();
  else a.addEventListener('loadedmetadata', start, { once: true });
  a.load();
}
