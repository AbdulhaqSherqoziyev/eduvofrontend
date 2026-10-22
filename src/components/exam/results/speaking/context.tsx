'use client';
/** Shared state of one SpeakingResultPanel: skin, strings, where it is shown, and "play this answer". */
import { createContext, useContext } from 'react';
import type { TextKey } from '@/lib/exam/i18n';
import type { SpeakingResult } from '@/lib/exam/speaking-types';
import type { Skin } from './skin';

/** erp = ERP student hub · b2c = mock.eduvo.uz learner · staff = centre staff page · preview = player result (staff preview). */
export type PanelMode = 'erp' | 'b2c' | 'staff' | 'preview';
export type Tx = (k: TextKey, v?: Record<string, string | number>) => string;

export interface SpeakingCtx {
  sp: SpeakingResult;
  skin: Skin;
  tx: Tx;
  mode: PanelMode;
  /** Audio replaced by a note (B2C sample result: `sampleNoAudio`). */
  noAudioNote?: string;
  /** B2C: `speakingPendingBody` instead of grading_speaking + can_leave. */
  gradingNote?: string;
  /** Open the item's part, scroll to its clip and play it from 0 (quote play without reliable timestamps). */
  playItem: (itemKey: string) => void;
  /** Item whose clip should start, with a nonce per click. */
  playing: { itemKey: string; nonce: number } | null;
  /** Re-read the result (signed audio URLs live 60 min — contract §5); a clip that fails to load asks for it. */
  refresh?: () => void;
}

export const Ctx = createContext<SpeakingCtx | null>(null);

export function useSpeaking(): SpeakingCtx {
  const c = useContext(Ctx);
  if (!c) throw new Error('useSpeaking outside SpeakingResultPanel');
  return c;
}

/** Recording of an item, if it still exists. */
export function recOf(sp: SpeakingResult, itemKey: string) {
  return sp.items.find((i) => i.itemKey === itemKey)?.recording ?? null;
}
