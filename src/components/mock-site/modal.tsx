'use client';
/** Modal card (README Global components): radius 24, backdrop rgba(15,20,30,.45). Focus stays inside. */
import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

export function Modal({ open, onClose, label, children, dismissable = true, width = 440 }: {
  open: boolean; onClose?: () => void; label: string; children: React.ReactNode; dismissable?: boolean; width?: number;
}) {
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const prevFocus = document.activeElement as HTMLElement | null;
    const first = box.current?.querySelector<HTMLElement>('[data-autofocus], button, [href], input, select, textarea');
    first?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && dismissable) onClose?.();
      if (e.key === 'Tab' && box.current) {
        const f = Array.from(box.current.querySelectorAll<HTMLElement>('button:not([disabled]), [href], input:not([disabled]), select, textarea'));
        if (!f.length) return;
        const a = f[0], z = f[f.length - 1];
        if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); }
        else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('keydown', onKey); prevFocus?.focus?.(); };
  }, [open, dismissable, onClose]);
  if (!open || typeof document === 'undefined') return null;
  return createPortal(
    <div className="m-modal-wrap" onMouseDown={(e) => { if (dismissable && e.target === e.currentTarget) onClose?.(); }}>
      <div ref={box} className="m-modal" role="dialog" aria-modal="true" aria-label={label} style={{ maxWidth: width }}>{children}</div>
    </div>,
    document.body,
  );
}
