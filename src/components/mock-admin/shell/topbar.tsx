'use client';
/** AdminTopbar.dc.html: breadcrumbs + title, global search ("/" focuses it), PROD/DEV pill, notifications. */
import Link from 'next/link';
import { useEffect, useId, useRef, useState } from 'react';
import { useAdminShell } from './context';
import type { Crumb } from './nav';

const isTyping = (t: EventTarget | null) =>
  t instanceof HTMLElement && (t.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(t.tagName));

export function AdminTopbar({ title, crumbs }: { title: string; crumbs: Crumb[] }) {
  const { env, notifications, onSearch } = useAdminShell();
  const search = useRef<HTMLInputElement>(null);
  const [q, setQ] = useState('');

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== '/' || e.ctrlKey || e.metaKey || e.altKey || isTyping(e.target)) return;
      e.preventDefault();
      search.current?.focus();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  return (
    <header className="ma-top">
      <div className="ma-top-head">
        <nav aria-label="Navigatsiya yo'li">
          <ol className="ma-crumbs">
            {crumbs.map((c, i) => (
              <li key={i}>
                {c.href ? <Link href={c.href}>{c.label}</Link> : <span>{c.label}</span>}
                <span className="ma-crumb-sep" aria-hidden="true">/</span>
              </li>
            ))}
          </ol>
        </nav>
        <h1 className="ma-title">{title}</h1>
      </div>
      <form
        role="search"
        className="ma-search"
        onSubmit={(e) => {
          e.preventDefault();
          const v = q.trim();
          if (v) onSearch?.(v);
        }}
        onClick={() => search.current?.focus()}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M11 18a7 7 0 100-14 7 7 0 000 14M21 21l-5-5" /></svg>
        <input
          ref={search}
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Escape') e.currentTarget.blur(); }}
          placeholder="Email, buyurtma №, kvitansiya №, urinish ID"
          aria-label="Qidiruv"
          aria-keyshortcuts="/"
          autoComplete="off"
          spellCheck={false}
        />
        <span className="ma-kbd" aria-hidden="true">/</span>
      </form>
      <span className={`ma-env ${env === 'DEV' ? 'is-dev' : 'is-prod'}`}>{env}</span>
      <Bell notes={notifications} />
    </header>
  );
}

const DOT: Record<string, string> = { warn: 'var(--warn)', ok: 'var(--ok)', blue: 'var(--blue)', err: 'var(--err)' };

function Bell({ notes }: { notes: ReturnType<typeof useAdminShell>['notifications'] }) {
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => { if (!wrap.current?.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey); };
  }, [open]);

  const has = !!notes && notes.length > 0;
  return (
    <div className="ma-bell-wrap" ref={wrap}>
      <button
        type="button"
        className="ma-bell"
        title="Bildirishnomalar"
        aria-label="Bildirishnomalar"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((o) => !o)}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M6 8a6 6 0 1112 0c0 7 3 9 3 9H3s3-2 3-9M10 21h4" /></svg>
      </button>
      {has && <span className="ma-bell-dot" aria-hidden="true" />}
      {open && (
        <div className="ma-bell-menu" id={menuId}>
          <span className="ma-bell-head">Bildirishnomalar</span>
          {!notes && [0, 1, 2].map((i) => <div key={i} style={{ padding: 10 }}><span className="ma-skel" style={{ width: `${80 - i * 15}%`, height: 14 }} /></div>)}
          {notes && notes.length === 0 && <span className="ma-note-empty">Yangi bildirishnoma yo&apos;q</span>}
          {notes?.map((n) => (
            <Link key={n.id} href={n.href} className="ma-note" onClick={() => setOpen(false)}>
              <span className="ma-note-dot" style={{ background: DOT[n.tone] }} aria-hidden="true" />
              <span className="ma-note-text"><b>{n.title}</b><span>{n.sub}</span></span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
