'use client';
/**
 * Audio preload: every audio file is fetched to a Blob before the section can
 * start (T10, T20 — no buffering mid-exam, the student's time never pays for our
 * network). Blob URLs are keyed by assetId (signed URLs change on every start).
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { examApi } from '../api';
import type { MediaRef } from '../types';

const blobs = new Map<string, string>();
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());

/** Practice mode registers its synthesized clip here. */
export function registerBlob(assetId: string, url: string) {
  blobs.set(assetId, url);
  notify();
}

/** useSyncExternalStore subscription: fires whenever a blob lands. */
export function subscribeBlobs(fn: () => void): () => void {
  listeners.add(fn);
  return () => { listeners.delete(fn); };
}

export function blobUrlFor(assetId: string | null | undefined): string | null {
  return assetId ? blobs.get(assetId) ?? null : null;
}

async function loadOne(ref: MediaRef, onBytes: (n: number) => void, signal: AbortSignal): Promise<void> {
  if (blobs.has(ref.assetId)) { onBytes(ref.bytes || 1); return; }
  const res = await examApi.fetchMedia(ref.url, signal);
  if (!res.ok || !res.body) throw new Error(`media ${res.status}`);
  const reader = res.body.getReader();
  const parts: BlobPart[] = [];
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    parts.push(value as Uint8Array<ArrayBuffer>);
    onBytes(value.byteLength);
  }
  blobs.set(ref.assetId, URL.createObjectURL(new Blob(parts, { type: ref.mime || res.headers.get('Content-Type') || 'audio/mpeg' })));
  notify();
}

const imageInflight = new Map<string, Promise<boolean>>();

/**
 * Images (Writing Task 1 chart, map/plan, SAT figure) are fetched to a Blob too,
 * but never gate a start: the <img> falls back to the signed URL meanwhile. Once
 * a blob exists the picture survives URL expiry (15 min) and task switches.
 * data:/blob:/mock: URLs (mock + practice) need no fetch.
 */
export function prefetchImage(ref: MediaRef): Promise<boolean> {
  if (ref.kind !== 'image' || !ref.url || /^(data:|blob:|mock:)/.test(ref.url)) return Promise.resolve(false);
  if (blobs.has(ref.assetId)) return Promise.resolve(true);
  const cur = imageInflight.get(ref.assetId);
  if (cur) return cur;
  const p = (async () => {
    const ctrl = new AbortController();
    const tm = setTimeout(() => ctrl.abort(), 20_000);
    try { await loadOne(ref, () => undefined, ctrl.signal); return true; } catch { return false; } finally { clearTimeout(tm); imageInflight.delete(ref.assetId); }
  })();
  imageInflight.set(ref.assetId, p);
  return p;
}

export function prefetchImages(refs: MediaRef[]): void {
  for (const r of refs) if (r.kind === 'image') void prefetchImage(r);
}

export interface PreloadState { progress: number; ready: boolean; error: boolean; failCount: number; bytesPerSec: number | null; retry: () => void }

/** Preloads `refs` (audio only). `ready` is true at once when there is nothing to load. */
export function useMediaPreload(refs: MediaRef[]): PreloadState {
  const audio = refs.filter((r) => r.kind === 'audio');
  const key = audio.map((r) => r.assetId).join('|');
  const [st, setSt] = useState({ progress: 0, ready: audio.length === 0, error: false, failCount: 0, bytesPerSec: null as number | null });
  const [nonce, setNonce] = useState(0);
  const refsRef = useRef(audio);
  refsRef.current = audio;

  useEffect(() => {
    const list = refsRef.current;
    if (!list.length) { setSt((s) => ({ ...s, progress: 1, ready: true, error: false })); return; }
    const ctrl = new AbortController();
    const total = list.reduce((a, r) => a + (r.bytes || 1), 0);
    let got = 0;
    const t0 = performance.now();
    setSt((s) => ({ ...s, progress: 0, ready: false, error: false }));
    (async () => {
      try {
        for (const r of list) {
          await loadOne(r, (n) => {
            got += n;
            const sec = (performance.now() - t0) / 1000;
            setSt((s) => ({ ...s, progress: Math.min(0.99, got / total), bytesPerSec: sec > 0.2 ? got / sec : s.bytesPerSec }));
          }, ctrl.signal);
        }
        setSt((s) => ({ ...s, progress: 1, ready: true }));
      } catch {
        if (!ctrl.signal.aborted) setSt((s) => ({ ...s, error: true, failCount: s.failCount + 1 }));
      }
    })();
    return () => ctrl.abort();
  }, [key, nonce]);

  const retry = useCallback(() => setNonce((n) => n + 1), []);
  return { ...st, retry };
}
