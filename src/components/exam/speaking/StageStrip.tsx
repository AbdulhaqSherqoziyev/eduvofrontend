'use client';
/**
 * Stage strip (design q.271–277, spec §1.3): label · 52-bar wave · right slot, plus the 3px progress line.
 * The ONLY red in Speaking is the static 8px "Recording" dot (Q5) — label text stays ink, the wave is
 * ink while recording and a grey 4px line otherwise. Last 10 s: the line slowly turns amber (no sound, no text).
 */
import { Check, Timer, Volume2 } from 'lucide-react';
import type { ReactNode } from 'react';
import { Spinner } from '../shell/ui';

export type StripKind = 'listen' | 'countdown' | 'recording' | 'saving' | 'saved' | 'prep';

function Icon({ k }: { k: StripKind }) {
  if (k === 'recording') return <span aria-hidden style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--x-rec)', flexShrink: 0 }} />;
  if (k === 'saving') return <Spinner size={14} />;
  if (k === 'saved') return <Check size={14} color="var(--x-ok-fg)" aria-hidden />;
  if (k === 'listen') return <Volume2 size={14} color="var(--x-accent)" aria-hidden />;
  return <Timer size={14} color="var(--x-accent)" aria-hidden />;
}

export function StageStrip({ kind, label, sub, bars, live, right, progress, lastTen, showLine = true }: {
  kind: StripKind; label: string; sub?: string; bars: number[]; live: boolean; right?: ReactNode;
  /** 0..1 of the answer (or prep) time; null = no line */
  progress: number | null; lastTen: boolean; showLine?: boolean;
}) {
  const reduced = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  return (
    <div style={{ width: 660, background: 'var(--x-panel)', border: '1px solid var(--x-line)', borderRadius: 18, padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
        <div role="status" aria-live="polite" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5, fontWeight: 800, whiteSpace: 'nowrap', color: kind === 'saved' ? 'var(--x-ok-fg)' : 'var(--x-ink)' }}>
          <Icon k={kind} />
          <span style={{ fontVariantNumeric: 'tabular-nums' }}>{label}</span>
          {sub && <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--x-muted)', fontVariantNumeric: 'tabular-nums' }}>{sub}</span>}
        </div>
        <div aria-hidden style={{ flex: 1, height: 40, display: 'flex', alignItems: 'center', gap: 3 }}>
          {bars.map((b, i) => <div key={i} style={{ flex: 1, borderRadius: 2, height: live ? 4 + Math.round(b * 36) : 4, background: live ? 'var(--x-ink)' : 'var(--x-line)' }} />)}
        </div>
        <div style={{ minWidth: 150, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>{right}</div>
      </div>
      {showLine && (
        <div aria-hidden style={{ height: 3, borderRadius: 2, background: 'var(--x-track)', overflow: 'hidden' }}>
          <div style={{ height: '100%', borderRadius: 2, width: `${Math.min(100, Math.max(0, (progress ?? 0) * 100))}%`,
            background: lastTen ? 'var(--x-flag)' : 'var(--x-accent)',
            transition: `width ${reduced ? 1000 : 250}ms linear, background-color 10s linear` }} />
        </div>
      )}
    </div>
  );
}
