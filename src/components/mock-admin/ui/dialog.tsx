'use client';
/**
 * Dialog: overlay rgba(20,28,40,.38), card radius 24 on --bg, max-width 440 / 460 / 480 / 600
 * (confirm, refund, promo, import). Destructive confirms use `DialogEffect` (errBg line) and a
 * `danger-solid` button. `busy` blocks closing while the request runs.
 */
import { useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useFocusTrap } from './focus';

export function Dialog({ open, onClose, title, width = 440, gap = 16, busy, children, actions }: {
  open: boolean;
  onClose: () => void;
  title: React.ReactNode;
  width?: 440 | 460 | 480 | 600;
  /** 16 (default) or 14 (Learner Profile confirm) */
  gap?: 14 | 16;
  busy?: boolean;
  children?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  const box = useRef<HTMLDivElement>(null);
  const titleId = useId();
  useFocusTrap(open, box, busy ? undefined : onClose);
  if (!open || typeof document === 'undefined') return null;
  return createPortal(
    <div className="ma-overlay" onMouseDown={(e) => { if (!busy && e.target === e.currentTarget) onClose(); }}>
      <div ref={box} className="ma-dialog" role="dialog" aria-modal="true" aria-labelledby={titleId} style={{ maxWidth: width, gap }} tabIndex={-1}>
        <h2 id={titleId} className="ma-dialog-title">{title}</h2>
        {children}
        {actions && <div className="ma-dialog-actions">{actions}</div>}
      </div>
    </div>,
    document.body,
  );
}

/** The red "what will happen" line of a destructive dialog (e.g. "3 ta IELTS full kredit qaytarib olinadi"). */
export function DialogEffect({ children }: { children: React.ReactNode }) {
  return <div className="ma-dialog-effect">{children}</div>;
}

export function DialogText({ children }: { children: React.ReactNode }) {
  return <p className="ma-dialog-body" style={{ margin: 0 }}>{children}</p>;
}
