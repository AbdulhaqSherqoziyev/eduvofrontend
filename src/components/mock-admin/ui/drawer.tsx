'use client';
/** Right drawer (Admin Attempts.dc.html): scrim rgba(20,28,40,.28), panel min(480px, 100%), ✕ close. */
import { useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { IconButton } from './button';
import { useFocusTrap } from './focus';

export function Drawer({ open, onClose, title, eyebrow, sub, children }: {
  open: boolean;
  onClose: () => void;
  title: React.ReactNode;
  /** small mono line above the title (e.g. attempt id) */
  eyebrow?: React.ReactNode;
  sub?: React.ReactNode;
  children: React.ReactNode;
}) {
  const box = useRef<HTMLElement>(null);
  const titleId = useId();
  useFocusTrap(open, box, onClose);
  if (!open || typeof document === 'undefined') return null;
  return createPortal(
    <>
      <div className="ma-drawer-scrim" onClick={onClose} aria-hidden="true" />
      <aside ref={box} className="ma-drawer" role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1}>
        <div className="ma-drawer-head">
          <div>
            {eyebrow && <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--mut)', fontFamily: 'ui-monospace,Menlo,monospace' }}>{eyebrow}</span>}
            <b id={titleId} style={{ fontSize: 18 }}>{title}</b>
            {sub && <span style={{ fontSize: 13, color: 'var(--ink2)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sub}</span>}
          </div>
          <IconButton label="Yopish" size={36} onClick={onClose} data-autofocus>✕</IconButton>
        </div>
        {children}
      </aside>
    </>,
    document.body,
  );
}
