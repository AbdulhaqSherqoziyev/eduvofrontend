'use client';
/**
 * Line reader (sat.md §6.5, Bluebook "More → Line Reader"): a clear band over
 * the text, the rest dimmed. Follows the pointer; ↑/↓ move it by a line, Esc
 * turns it off. Pointer events pass through, so the student keeps working.
 */
import { useEffect, useRef, useState } from 'react';
import { useSatTools } from '@/lib/exam/sat/tools';

const BAND = 64;
const DIM = 'rgba(30, 42, 58, 0.45)';

export function LineReader() {
  const tools = useSatTools();
  const box = useRef<HTMLDivElement>(null);
  const [y, setY] = useState(120);
  useEffect(() => {
    const host = box.current?.parentElement;
    if (!host) return;
    const move = (e: PointerEvent) => {
      const r = host.getBoundingClientRect();
      setY(Math.min(Math.max(0, e.clientY - r.top - BAND / 2), r.height - BAND));
    };
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') tools.setLineReader(false);
      const el = e.target as HTMLElement;
      if (el.closest('input, textarea, [role="radio"], [role="separator"]')) return;
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); setY((v) => Math.max(0, v + (e.key === 'ArrowDown' ? 28 : -28))); }
    };
    host.addEventListener('pointermove', move);
    document.addEventListener('keydown', key);
    return () => { host.removeEventListener('pointermove', move); document.removeEventListener('keydown', key); };
  }, [tools]);
  return (
    <div ref={box} aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 4 }}>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: y, background: DIM }} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: y, height: BAND, boxShadow: 'inset 0 0 0 2px var(--x-accent)' }} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: y + BAND, bottom: 0, background: DIM }} />
    </div>
  );
}
