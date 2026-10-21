/**
 * Examiner prompt playback from the preloaded blob (T10/T20 — no buffering mid-exam).
 * Resolves when the clip ends; a missing or failing clip resolves at once (the text is the fallback).
 */
import { absMedia } from '../api';
import { blobUrlFor } from '../engine/media';
import type { MediaRef } from '../types';

export interface Playing { done: Promise<void>; stop: () => void }

export function playPrompt(assetId: string | null, media: MediaRef[], volume: number): Playing {
  const src = blobUrlFor(assetId) ?? (assetId ? media.find((m) => m.assetId === assetId)?.url : null);
  if (!src) return { done: Promise.resolve(), stop: () => undefined };
  const a = new Audio(src.startsWith('mock:') ? '' : blobUrlFor(assetId) ?? absMedia(src));
  a.volume = Math.max(0, Math.min(1, volume));
  let finish: () => void = () => undefined;
  const done = new Promise<void>((res) => { finish = res; });
  a.onended = () => finish();
  a.onerror = () => finish();
  a.play().catch(() => finish());
  return { done, stop: () => { a.onended = null; a.onerror = null; a.pause(); finish(); } };
}
