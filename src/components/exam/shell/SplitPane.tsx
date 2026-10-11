'use client';
/** Passage | questions split (design A5): default 50 %, divider 14px, drag 30–70 %, ←/→ on the divider. */
import { useRef, type ReactNode } from 'react';
import { useExam } from '@/lib/exam/engine/context';

export function SplitPane({ left, right }: { left: ReactNode; right: ReactNode }) {
  const { s, setUi } = useExam();
  const box = useRef<HTMLDivElement>(null);
  const clamp = (n: number) => Math.min(70, Math.max(30, Math.round(n)));
  const start = (e: React.PointerEvent) => {
    e.preventDefault();
    const rect = box.current!.getBoundingClientRect();
    const move = (ev: PointerEvent) => setUi({ split: clamp(((ev.clientX - rect.left) / rect.width) * 100) });
    const up = () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };
  return (
    <div ref={box} style={{ flex: 1, minHeight: 0, display: 'flex' }}>
      <div style={{ width: `${s.ui.split}%`, flexShrink: 0, minWidth: 0 }}>{left}</div>
      <div role="separator" aria-orientation="vertical" aria-valuemin={30} aria-valuemax={70} aria-valuenow={s.ui.split} tabIndex={0}
        onPointerDown={start} onKeyDown={(e) => { if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { e.preventDefault(); setUi({ split: clamp(s.ui.split + (e.key === 'ArrowLeft' ? -5 : 5)) }); } }}
        style={{ width: 14, flexShrink: 0, background: 'var(--x-page)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'col-resize', borderLeft: '1px solid var(--x-line)', borderRight: '1px solid var(--x-line)', touchAction: 'none' }}>
        <div style={{ width: 4, height: 40, borderRadius: 2, background: 'var(--x-border)' }} />
      </div>
      {right}
    </div>
  );
}
