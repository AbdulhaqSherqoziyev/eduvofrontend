'use client';
/** Selection menu "Highlight · Note · Clear" (design G4): 36px, 8px above the selection, Esc closes, ←/→ moves. */
import { Eraser, Highlighter, StickyNote } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useT } from '@/lib/exam/engine/context';

export interface MenuPos { x: number; y: number; below: boolean }

export function HighlightMenu({ pos, canClear, onHighlight, onNote, onClear, onClose }: {
  pos: MenuPos; canClear: boolean; onHighlight: () => void; onNote: () => void; onClear: () => void; onClose: () => void;
}) {
  const { t } = useT();
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        const btns = Array.from(ref.current?.querySelectorAll('button') ?? []);
        const i = btns.indexOf(document.activeElement as HTMLButtonElement);
        if (i >= 0) { e.preventDefault(); btns[(i + (e.key === 'ArrowRight' ? 1 : btns.length - 1)) % btns.length].focus(); }
      }
    };
    const down = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) onClose(); };
    document.addEventListener('keydown', key);
    document.addEventListener('mousedown', down);
    return () => { document.removeEventListener('keydown', key); document.removeEventListener('mousedown', down); };
  }, [onClose]);

  const b = { height: 32, padding: '0 10px', border: 'none', background: 'transparent', color: 'var(--x-ink)', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6, borderRadius: 8 } as const;
  return (
    <div ref={ref} role="toolbar" aria-label={t('chrome.highlight')} className="x-pop" onMouseDown={(e) => e.preventDefault()}
      style={{ position: 'absolute', left: pos.x, top: pos.y, transform: `translate(-50%, ${pos.below ? '8px' : 'calc(-100% - 8px)'})`, height: 36, padding: 2, display: 'flex', alignItems: 'center', gap: 2,
        background: 'var(--x-panel)', border: '1px solid var(--x-pop-border)', boxShadow: 'var(--x-menu-shadow)', borderRadius: 10, zIndex: 20 }}>
      <button type="button" style={b} onClick={onHighlight}><Highlighter size={14} aria-hidden />{t('chrome.highlight')}</button>
      <span style={{ width: 1, height: 18, background: 'var(--x-line)' }} />
      <button type="button" style={b} onClick={onNote}><StickyNote size={14} aria-hidden />{t('chrome.note')}</button>
      {canClear && (
        <>
          <span style={{ width: 1, height: 18, background: 'var(--x-line)' }} />
          <button type="button" style={b} onClick={onClear}><Eraser size={14} aria-hidden />{t('chrome.clear')}</button>
        </>
      )}
    </div>
  );
}
