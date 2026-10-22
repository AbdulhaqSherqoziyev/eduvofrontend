'use client';
/**
 * Small shared pieces of the Analitika section: Card (§3.1), "(i)" definition popover (§3.5),
 * muted notes, error text (§2.7, 429), the dim-while-refetching wrapper and tracker states.
 */
import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import type { UseQueryResult } from '@tanstack/react-query';
import { AdminApiError } from '@/lib/admin-mock/http';
import { loadErrText } from '@/lib/admin-mock/errors';
import { dayLabel, dayMonth } from '@/lib/admin-mock/format';
import { EmptyState, ErrorState } from '../../ui/state';
import { T } from './texts';

export const h3 = { margin: 0, fontSize: 15, fontWeight: 800 } as const;
export const mutedText = { fontSize: 12, fontWeight: 600, color: 'var(--mut)' } as const;
export const eyebrow = { fontSize: 11, fontWeight: 800, color: 'var(--mut)', letterSpacing: '.06em', textTransform: 'uppercase' } as const;

/** §3.1 */
export function Card({ title, right, children, gap = 14, style, label }: {
  title?: React.ReactNode; right?: React.ReactNode; children: React.ReactNode; gap?: number; style?: React.CSSProperties; label?: string;
}) {
  return (
    <section aria-label={label} style={{ borderRadius: 24, boxShadow: 'var(--raise)', padding: 20, display: 'flex', flexDirection: 'column', gap, minWidth: 0, ...style }}>
      {(title || right) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {title && <h3 style={{ ...h3, flex: 1, minWidth: 0 }}>{title}</h3>}
          {right}
        </div>
      )}
      {children}
    </section>
  );
}

export function Pill({ children }: { children: React.ReactNode }) {
  return <span style={{ fontSize: 12, fontWeight: 700, padding: '3px 9px', borderRadius: 999, background: 'var(--hover)', color: 'var(--mut)', whiteSpace: 'nowrap' }}>{children}</span>;
}

/** Text-styled button ("Hammasini ko'rish", "30 kunni ko'rish") */
export function TextButton({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} style={{ border: 0, background: 'transparent', padding: 0, color: 'var(--blue)', fontSize: 13, fontWeight: 700, alignSelf: 'flex-start' }}>
      {children}
    </button>
  );
}

const iGlyph = {
  width: 16, height: 16, borderRadius: 999, border: '1.5px solid currentColor', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  fontSize: 10, fontWeight: 800, fontStyle: 'normal', lineHeight: 1, flexShrink: 0,
} as const;

/** "(i)" + muted note (footers, card notes) */
export function Note({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <p style={{ ...mutedText, margin: 0, display: 'flex', gap: 6, alignItems: 'flex-start', lineHeight: 1.5, ...style }}>
      <i aria-hidden="true" style={{ ...iGlyph, marginTop: 1 }}>i</i>
      <span>{children}</span>
    </p>
  );
}

/**
 * §3.5 definition: a 16×16 "(i)" button with a popover (`ma-filter-menu` look, max 260px). Esc / click
 * outside closes it and focus returns to the button. The text also sits in the DOM as sr-only.
 */
export function InfoPop({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  const [alignRight, setAlignRight] = useState(false);
  const wrap = useRef<HTMLSpanElement>(null);
  const btn = useRef<HTMLButtonElement>(null);
  const id = useId();
  useLayoutEffect(() => {
    if (!open || !btn.current) return;
    const r = btn.current.getBoundingClientRect();
    setAlignRight(r.left + Math.min(260, window.innerWidth - 32) > window.innerWidth - 16);
  }, [open]);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => { if (!wrap.current?.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { setOpen(false); btn.current?.focus(); } };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey); };
  }, [open]);
  return (
    <span ref={wrap} style={{ position: 'relative', display: 'inline-flex', verticalAlign: 'middle' }}>
      <button ref={btn} type="button" aria-label={T.infoAria} aria-expanded={open} aria-describedby={`${id}-d`} onClick={() => setOpen((o) => !o)}
        style={{ ...iGlyph, padding: 0, background: 'transparent', color: 'var(--mut)', cursor: 'pointer' }}>
        i
      </button>
      <span id={`${id}-d`} className="ma-sr">{text}</span>
      {open && (
        <span className="ma-filter-menu" role="note"
          style={{ top: 24, minWidth: 0, width: 'max-content', maxWidth: 'min(260px, calc(100vw - 32px))', fontSize: 12.5, fontWeight: 600, color: 'var(--ink2)', lineHeight: 1.5, textTransform: 'none', letterSpacing: 0, whiteSpace: 'normal', padding: '10px 12px', ...(alignRight ? { left: 'auto', right: 0 } : {}) }}>
          {text}
        </span>
      )}
    </span>
  );
}

/** §2.7 error text (429 → "Juda ko'p so'rov. N soniyadan keyin …") */
export function anErrText(e: unknown) {
  if (e instanceof AdminApiError && e.code === 'HOUR_RANGE_TOO_OLD') return T.period.errHourOld;
  if (e instanceof AdminApiError && e.status === 429) {
    const s = Number(e.data.retryAfterSec);
    if (Number.isFinite(s) && s > 0) return T.state.rateLimited(Math.ceil(s));
  }
  return loadErrText(e, T.state.loadErrText);
}

/** §2.7: block error (flat) or whole-tab error (raised) */
export function QueryError({ q, flat }: { q: UseQueryResult<unknown>; flat?: boolean }) {
  return <ErrorState flat={flat} title={T.state.loadErr} text={anErrText(q.error)} onRetry={() => void q.refetch()} retrying={q.isFetching} />;
}

/** §2.7: the previous data stays at 60% opacity while the next filter's answer loads (no skeleton). */
export function Dim({ on, children, style }: { on: boolean; children: React.ReactNode; style?: React.CSSProperties }) {
  return <div className="ma-an-dim" aria-busy={on || undefined} style={{ opacity: on ? 0.6 : 1, display: 'flex', flexDirection: 'column', gap: 20, minWidth: 0, ...style }}>{children}</div>;
}

export function NotTracked() {
  return <EmptyState title={T.state.notTrackedTitle} text={T.state.notTrackedText} />;
}

/** "19 okt" of `trackingSince` */
export const sinceLabel = (v: string | null | undefined) => (!v ? '' : /^\d{4}-\d{2}-\d{2}$/.test(v) ? dayLabel(v) : dayMonth(v));

/** the selected period ended before tracking started (§2.7) */
export function BeforeTracking({ since }: { since: string }) {
  return <p style={{ ...mutedText, margin: 0, fontSize: 13 }}>{T.state.beforeTracking(sinceLabel(since))}</p>;
}

/** title of a null value by its contract reason (§0.3) */
export function reasonTitle(reason: string | undefined, trackingSince?: string | null): string {
  if (reason === 'retention') return T.state.old90;
  if (reason === 'not_tracking' && trackingSince) return T.state.trackedSince(sinceLabel(trackingSince));
  if (reason === 'db_error') return T.state.loadErr;
  return T.state.noData;
}

/** "—" with its reason as a title */
export function Dash({ title }: { title?: string }) {
  return <span title={title}>—</span>;
}

/** muted "… — kompyuterda ko'ring." (§13) */
export function DesktopOnly({ children }: { children: React.ReactNode }) {
  return <span style={mutedText}>{children}</span>;
}
