'use client';
/**
 * Floating tool panel (design q.312–325, _player-design A-table "Calculator"):
 * dark 40px header to drag, optional bottom-right corner to resize (min size
 * enforced), kept inside the exam body. Hidden (not unmounted) when closed, so
 * the calculator keeps its expressions for the rest of the module (sat.md §6.1).
 */
import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { useT } from '@/lib/exam/engine/context';

export interface Box { x: number; y: number; w: number; h: number }
interface Props {
  title: string; open: boolean; onClose: () => void; initial: Box; min?: { w: number; h: number };
  resizable?: boolean; headerExtra?: ReactNode; onResize?: () => void; children: ReactNode; label: string;
}

export function FloatPanel({ title, open, onClose, initial, min = { w: 360, h: 400 }, resizable, headerExtra, onResize, children, label }: Props) {
  const { t } = useT();
  const [box, setBox] = useState<Box>(initial);
  const ref = useRef<HTMLDivElement>(null);
  // a negative x means "that many px from the right edge" (calculator sits right, reference left — design)
  useLayoutEffect(() => {
    if (!open || box.x >= 0) return;
    const hw = (ref.current?.offsetParent as HTMLElement | null)?.clientWidth ?? window.innerWidth;
    setBox((b) => ({ ...b, x: Math.max(0, hw - b.w + b.x) }));
  }, [open, box.x]);

  const track = (e: React.PointerEvent, mode: 'move' | 'size') => {
    if ((e.target as HTMLElement).closest('button') && mode === 'move') return;
    e.preventDefault();
    const host = ref.current?.offsetParent as HTMLElement | null;
    const hw = host?.clientWidth ?? window.innerWidth;
    const hh = host?.clientHeight ?? window.innerHeight;
    const sx = e.clientX, sy = e.clientY, b0 = box;
    const move = (ev: PointerEvent) => {
      const dx = ev.clientX - sx, dy = ev.clientY - sy;
      setBox(mode === 'move'
        ? { ...b0, x: Math.min(Math.max(0, b0.x + dx), Math.max(0, hw - b0.w)), y: Math.min(Math.max(0, b0.y + dy), Math.max(0, hh - 40)) }
        : { ...b0, w: Math.min(Math.max(min.w, b0.w + dx), hw - b0.x), h: Math.min(Math.max(min.h, b0.h + dy), hh - b0.y) });
      if (mode === 'size') onResize?.();
    };
    const up = () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); onResize?.(); };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  return (
    <div ref={ref} role="dialog" aria-label={label} hidden={!open}
      style={{ position: 'absolute', left: box.x, top: box.y, width: box.w, height: resizable ? box.h : undefined, maxHeight: resizable ? undefined : 'calc(100% - 24px)',
        background: '#fff', color: '#1E2A3A', borderRadius: 16, boxShadow: '0 20px 50px rgba(30,42,58,0.2)', border: '1px solid var(--x-pop-border)', display: open ? 'flex' : 'none', flexDirection: 'column', overflow: 'hidden', zIndex: 5 }}>
      <div onPointerDown={(e) => track(e, 'move')}
        style={{ height: 40, flexShrink: 0, background: '#1E2A3A', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '0 14px', fontSize: 13, fontWeight: 700, cursor: 'move', touchAction: 'none', userSelect: 'none' }}>
        <span>{title}</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {headerExtra}
          <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', padding: 0, color: '#AEB9CB', fontSize: 13, fontWeight: 700 }}>{t('chrome.close')}</button>
        </span>
      </div>
      <div style={{ flex: 1, minHeight: 0, position: 'relative', overflow: resizable ? 'hidden' : 'auto' }}>{children}</div>
      {resizable && (
        <div aria-hidden onPointerDown={(e) => track(e, 'size')}
          style={{ position: 'absolute', right: 0, bottom: 0, width: 18, height: 18, cursor: 'nwse-resize', touchAction: 'none', background: 'linear-gradient(135deg, transparent 50%, #B4BDCA 50%, #B4BDCA 60%, transparent 60%, transparent 70%, #B4BDCA 70%, #B4BDCA 80%, transparent 80%)', zIndex: 2 }} />
      )}
    </div>
  );
}
