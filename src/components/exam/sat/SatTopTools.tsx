'use client';
/**
 * SAT top-bar tools (design q.135–140, sat.md §4): Calculator + Reference in
 * Math (dark when open), and Bluebook's "More" menu with Line reader and
 * in-app Zoom (sat.md §6.5). Rendered inside TopBar's right group.
 */
import { ChevronDown, Minus, Plus } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useT } from '@/lib/exam/engine/context';
import { useSatTools, ZOOMS } from '@/lib/exam/sat/tools';

const btn = (on: boolean) => ({ height: 36, padding: '0 12px', borderRadius: 9, border: '1.5px solid var(--x-line)', background: on ? 'var(--x-dark-bg)' : 'transparent', color: on ? 'var(--x-dark-fg)' : 'var(--x-ink)', fontSize: 12.5, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }) as const;
const item = { height: 34, width: '100%', padding: '0 10px', border: 'none', background: 'transparent', color: 'var(--x-ink)', fontSize: 13, fontWeight: 700, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 } as const;

function More() {
  const { t } = useT();
  const tools = useSatTools();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const down = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', down);
    document.addEventListener('keydown', key);
    return () => { document.removeEventListener('mousedown', down); document.removeEventListener('keydown', key); };
  }, [open]);
  const zi = ZOOMS.indexOf(tools.zoom);
  const step = (d: number) => tools.setZoom(ZOOMS[Math.min(ZOOMS.length - 1, Math.max(0, zi + d))]);
  const sq = { width: 28, height: 28, borderRadius: 7, border: '1.5px solid var(--x-line)', background: 'transparent', color: 'var(--x-ink)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' } as const;
  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button type="button" aria-expanded={open} aria-haspopup="menu" onClick={() => setOpen((o) => !o)} style={btn(open)}>{t('sat.more')}<ChevronDown size={14} aria-hidden /></button>
      {open && (
        <div role="menu" className="x-pop" style={{ position: 'absolute', right: 0, top: 42, width: 250, background: 'var(--x-panel)', border: '1px solid var(--x-pop-border)', borderRadius: 12, boxShadow: 'var(--x-menu-shadow)', padding: 6, zIndex: 20 }}>
          <button type="button" role="menuitemcheckbox" aria-checked={tools.lineReader} style={item} onClick={() => { tools.setLineReader(!tools.lineReader); setOpen(false); }}>
            {t('sat.line_reader')}<span style={{ fontSize: 12, color: tools.lineReader ? 'var(--x-accent)' : 'var(--x-muted)' }}>{tools.lineReader ? 'ON' : 'OFF'}</span>
          </button>
          <div style={{ ...item, cursor: 'default' }}>
            <span>{t('sat.zoom')}</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <button type="button" aria-label={t('sat.zoom_out')} disabled={zi <= 0} onClick={() => step(-1)} style={{ ...sq, opacity: zi <= 0 ? 0.4 : 1 }}><Minus size={14} aria-hidden /></button>
              <span style={{ minWidth: 42, textAlign: 'center', fontVariantNumeric: 'tabular-nums', fontSize: 12.5 }}>{Math.round(tools.zoom * 100)}%</span>
              <button type="button" aria-label={t('sat.zoom_in')} disabled={zi >= ZOOMS.length - 1} onClick={() => step(1)} style={{ ...sq, opacity: zi >= ZOOMS.length - 1 ? 0.4 : 1 }}><Plus size={14} aria-hidden /></button>
            </span>
          </div>
          {tools.zoom !== 1 && <button type="button" role="menuitem" style={{ ...item, color: 'var(--x-link)' }} onClick={() => tools.setZoom(1)}>{t('sat.zoom_reset')}</button>}
        </div>
      )}
    </div>
  );
}

export function SatTopTools({ math }: { math: boolean }) {
  const { t } = useT();
  const tools = useSatTools();
  return (
    <>
      {math && <button type="button" aria-pressed={tools.calc} onClick={() => tools.setCalc(!tools.calc)} style={btn(tools.calc)}>{t('chrome.calculator')}</button>}
      {math && <button type="button" aria-pressed={tools.ref} onClick={() => tools.setRef(!tools.ref)} style={btn(tools.ref)}>{t('chrome.reference')}</button>}
      <More />
    </>
  );
}
