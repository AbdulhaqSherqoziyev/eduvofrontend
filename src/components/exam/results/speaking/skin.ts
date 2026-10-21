/**
 * The three "skins" of SpeakingResultPanel (speaking-design.md §2): one structure, three palettes.
 * hub — ERP student hub (neomorphic, Tailwind shadows via className);
 * flat — player result page / staff preview (q.385–469 palette);
 * b2c — mock.eduvo.uz (`--ink/--ink2/--mut/--ai/--aiBg/--okBg/--paper/--inset` tokens, dark-mode aware).
 */
import type { CSSProperties } from 'react';

export type SkinName = 'hub' | 'flat' | 'b2c';

export interface Skin {
  name: SkinName;
  ink: string; sub: string; muted: string; track: string; accent: string; paper: string;
  okBg: string; okFg: string; aiBg: string; aiFg: string; line: string; danger: string;
  /** Criterion card / inset tiles. */
  card: CSSProperties; cardClass?: string;
  /** Low-band "steps" card. */
  stepCard: CSSProperties; stepClass?: string;
  surface: string;
}

const SERIF = "'Source Serif 4', Georgia, serif";
export const serif = SERIF;

export const SKINS: Record<SkinName, Skin> = {
  flat: {
    name: 'flat', ink: '#1E2A3A', sub: '#4A586C', muted: '#7A8699', track: '#DDE3EC', accent: '#2E6BE6', paper: '#F4F6F9',
    okBg: '#E5F5EE', okFg: '#1F7A55', aiBg: '#EEE9FF', aiFg: '#5B3FD1', line: '#E6EAF0', danger: '#C23A4C', surface: '#fff',
    card: { border: '1px solid #E6EAF0', borderRadius: 16, padding: '16px 18px' },
    stepCard: { background: '#EEE9FF', borderRadius: 16, padding: 18 },
  },
  hub: {
    name: 'hub', ink: '#1E2A3A', sub: '#4A586C', muted: '#7A8699', track: '#DDE3EC', accent: '#2E6BE6', paper: '#F4F6F9',
    okBg: '#E5F5EE', okFg: '#1F7A55', aiBg: '#EEE9FF', aiFg: '#5B3FD1', line: '#DDE3EC', danger: '#C23A4C', surface: 'transparent',
    card: { borderRadius: 16, padding: 16 }, cardClass: 'shadow-nm-inset-sm',
    stepCard: { borderRadius: 16, padding: 18 }, stepClass: 'shadow-nm-inset',
  },
  b2c: {
    name: 'b2c', ink: 'var(--ink)', sub: 'var(--ink2)', muted: 'var(--mut)', track: 'var(--line)', accent: 'var(--blue)', paper: 'var(--paper)',
    okBg: 'var(--okBg)', okFg: 'var(--ok)', aiBg: 'var(--aiBg)', aiFg: 'var(--ai)', line: 'var(--line)', danger: '#C23A4C', surface: 'var(--bg)',
    card: { boxShadow: 'var(--inset)', borderRadius: 16, padding: '14px 16px' },
    stepCard: { background: 'var(--aiBg)', borderRadius: 16, padding: 18 },
  },
};

export const caps = (s: Skin): CSSProperties => ({ fontSize: 11, fontWeight: 800, letterSpacing: 0.8, color: s.muted, textTransform: 'uppercase' });
export const chip = (bg: string, fg: string): CSSProperties => ({ fontSize: 10.5, fontWeight: 800, letterSpacing: 0.4, borderRadius: 7, padding: '3px 8px', color: fg, background: bg, display: 'inline-flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap' });

/** "0:42" */
export function mmss(sec: number): string {
  const s = Math.max(0, Math.round(sec));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

/** Speaking band "6.0" (0.5 step), criterion band "6" (whole). */
export const bandText = (v: number) => v.toFixed(1);
