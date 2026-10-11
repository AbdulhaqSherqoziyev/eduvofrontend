'use client';
/**
 * Option lists shared by McqSingle / McqMulti / MapLabelling (design A7):
 * rows (A–G, letter chip, selected = selectedBg + accent border) or pills
 * (TRUE/FALSE/NOT GIVEN). Radiogroup keyboard: ←↑/→↓ move and select, Space/Enter select.
 */
import { useRef, type KeyboardEvent } from 'react';
import type { Option } from '@/lib/exam/content-types';

interface Props { options: Option[]; selected: string[]; onPick: (key: string) => void; multi?: boolean; layout?: 'rows' | 'pills'; label: string; atMax?: boolean }

export function Choices({ options, selected, onPick, multi, layout = 'rows', label, atMax }: Props) {
  const refs = useRef<(HTMLElement | null)[]>([]);
  const focusIdx = Math.max(0, options.findIndex((o) => selected.includes(o.key)));
  const onKey = (e: KeyboardEvent, i: number) => {
    const d = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? -1 : 0;
    if (d && !e.altKey) {
      e.preventDefault();
      const n = (i + d + options.length) % options.length;
      refs.current[n]?.focus();
      if (!multi) onPick(options[n].key);
    } else if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      onPick(options[i].key);
    }
  };
  const role = multi ? 'checkbox' : 'radio';

  if (layout === 'pills') {
    return (
      <div role={multi ? 'group' : 'radiogroup'} aria-label={label} style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {options.map((o, i) => {
          const on = selected.includes(o.key);
          return (
            <button key={o.key} ref={(el) => { refs.current[i] = el; }} type="button" role={role} aria-checked={on} tabIndex={i === focusIdx ? 0 : -1}
              onClick={() => onPick(o.key)} onKeyDown={(e) => onKey(e, i)}
              style={{ height: 34, padding: '0 14px', borderRadius: 8, fontSize: 12.5, fontWeight: 800, border: `1.5px solid ${on ? 'var(--x-accent)' : 'var(--x-line)'}`, background: on ? 'var(--x-accent)' : 'var(--x-field)', color: on ? '#fff' : 'var(--x-sub)' }}>
              {o.text}
            </button>
          );
        })}
      </div>
    );
  }
  return (
    <div role={multi ? 'group' : 'radiogroup'} aria-label={label} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {options.map((o, i) => {
        const on = selected.includes(o.key);
        const dis = !!(multi && atMax && !on);
        return (
          <div key={o.key} ref={(el) => { refs.current[i] = el; }} role={role} aria-checked={on} aria-disabled={dis || undefined} tabIndex={multi ? 0 : i === focusIdx ? 0 : -1}
            onClick={() => !dis && onPick(o.key)} onKeyDown={(e) => onKey(e, i)}
            style={{ display: 'flex', alignItems: 'center', gap: 12, minHeight: 42, borderRadius: 10, padding: '8px 12px', cursor: dis ? 'not-allowed' : 'pointer', opacity: dis ? 0.55 : 1,
              border: `1.5px solid ${on ? 'var(--x-accent)' : 'var(--x-line)'}`, background: on ? 'var(--x-sel-bg)' : 'var(--x-field)', color: on ? 'var(--x-sel-fg)' : 'var(--x-ink)', fontSize: 'var(--x-fs-q)' }}>
            <span style={{ width: 24, height: 24, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, flexShrink: 0, background: on ? 'var(--x-accent)' : 'var(--x-tile)', color: on ? '#fff' : 'var(--x-sub)' }}>{o.key}</span>
            <span>{o.text}</span>
          </div>
        );
      })}
    </div>
  );
}
