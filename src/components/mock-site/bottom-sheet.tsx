'use client';
/** Phone bottom sheet (Mobile App.dc.html): 28px top radius, grab handle, title + Done, slide-up 280 ms. */
import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useTranslations } from 'next-intl';

export function BottomSheet({ open, title, onClose, children, doneLabel }: { open: boolean; title: string; onClose: () => void; children: React.ReactNode; doneLabel?: string }) {
  const t = useTranslations('common');
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    ref.current?.focus();
    return () => { document.body.style.overflow = prev; document.removeEventListener('keydown', onKey); };
  }, [open, onClose]);
  if (!open || typeof document === 'undefined') return null;
  return createPortal(
    <>
      <div className="m-backdrop" onClick={onClose} aria-hidden />
      <div className="m-sheet" role="dialog" aria-modal="true" aria-label={title} ref={ref} tabIndex={-1}>
        <div className="m-sheet__grab"><span /></div>
        <div className="m-sheet__head">
          <b style={{ fontSize: 18 }}>{title}</b>
          <button type="button" className="m-sheet__done" onClick={onClose}>{doneLabel ?? t('sheet.done')}</button>
        </div>
        <div className="m-sheet__body">{children}</div>
      </div>
    </>,
    document.body,
  );
}
