'use client';
/**
 * SAT answer choices + option eliminator (design q.302–309, sat.md §3/§6.4):
 * 54px rows, round letter chip, selected = accent border + selected bg.
 * With "ABC" on, each row gets a cross-out button (letter struck through →
 * "Undo"). A crossed-out option can still be chosen; choosing it un-crosses it.
 */
import { useRef, type KeyboardEvent } from 'react';
import type { Option } from '@/lib/exam/content-types';
import { useT } from '@/lib/exam/engine/context';
import { useSatTools } from '@/lib/exam/sat/tools';
import { MathText } from './MathText';

interface Props { qid: string; no: number; options: Option[]; selected: string | null; onPick: (k: string) => void }

export function SatOptions({ qid, no, options, selected, onPick }: Props) {
  const { t } = useT();
  const tools = useSatTools();
  const crossed = tools.elim[qid] ?? [];
  const refs = useRef<(HTMLDivElement | null)[]>([]);
  const focusIdx = Math.max(0, options.findIndex((o) => o.key === selected));
  const pick = (k: string) => { tools.unElim(qid, k); onPick(k); };
  const onKey = (e: KeyboardEvent, i: number) => {
    const d = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? -1 : 0;
    if (d) {
      e.preventDefault();
      const n = (i + d + options.length) % options.length;
      refs.current[n]?.focus();
      pick(options[n].key);
    } else if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); pick(options[i].key); }
  };

  return (
    <div role="radiogroup" aria-label={`Question ${no}`} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {options.map((o, i) => {
        const on = o.key === selected;
        const el = crossed.includes(o.key);
        const bd = on ? 'var(--x-accent)' : 'var(--x-border)';
        return (
          <div key={o.key} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div ref={(n) => { refs.current[i] = n; }} role="radio" aria-checked={on} tabIndex={i === focusIdx ? 0 : -1}
              aria-label={el ? `${o.key}, crossed out` : undefined} onClick={() => pick(o.key)} onKeyDown={(e) => onKey(e, i)}
              style={{ flex: 1, minHeight: 54, borderRadius: 12, display: 'flex', alignItems: 'center', gap: 14, padding: '10px 16px', cursor: 'pointer', fontSize: 'var(--x-fs-q)',
                border: `1.5px solid ${bd}`, background: on ? 'var(--x-sel-bg)' : 'var(--x-panel)', color: el ? 'var(--x-disabled)' : on ? 'var(--x-sel-fg)' : 'var(--x-ink)', textDecoration: el ? 'line-through' : 'none' }}>
              <span style={{ width: 28, height: 28, borderRadius: '50%', border: `1.5px solid ${bd}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, flexShrink: 0 }}>{o.key}</span>
              <span style={{ minWidth: 0 }}><MathText text={o.text} /></span>
            </div>
            {tools.elimOn && (
              <button type="button" onClick={() => tools.toggleElim(qid, o.key)} aria-pressed={el} aria-label={el ? t('sat.undo') : t('sat.cross_out', { k: o.key })}
                style={{ width: 52, height: 30, border: '1.5px solid var(--x-line)', background: 'transparent', borderRadius: 8, fontSize: 11.5, fontWeight: 800, color: 'var(--x-muted)', textDecoration: el ? 'none' : 'line-through', flexShrink: 0 }}>
                {el ? t('sat.undo') : o.key}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
