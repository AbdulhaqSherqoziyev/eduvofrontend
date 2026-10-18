'use client';
/**
 * AdminTopbar.dc.html: breadcrumbs + title, global search (N2; "/" focuses it), PROD/DEV pill,
 * notifications (N3). Search and the bell need `mock.manage` (Kontent role does not see them).
 */
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useId, useRef, useState } from 'react';
import { adminApi } from '@/lib/admin-mock/api';
import { ago, attemptNo, money, ticketNo } from '@/lib/admin-mock/format';
import type { NotificationItem, SearchRes } from '@/lib/admin-mock/types';
import { useAdminShell } from './context';
import type { Crumb } from './nav';

const isTyping = (t: EventTarget | null) =>
  t instanceof HTMLElement && (t.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(t.tagName));

export function AdminTopbar({ title, crumbs }: { title: string; crumbs: Crumb[] }) {
  const { env, can, me } = useAdminShell();
  const manage = !!me && can('mock.manage');
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
      {(manage || !me) && <Search disabled={!me} />}
      <span className={`ma-env ${env === 'DEV' ? 'is-dev' : 'is-prod'}`}>{env}</span>
      {(manage || !me) && <Bell />}
    </header>
  );
}

/* ---------- search (N2) ---------- */

type Hit = { key: string; href: string; title: string; sub: string };

function hits(r: SearchRes): Array<{ group: string; items: Hit[] }> {
  return [
    { group: "O'quvchilar", items: r.learners.map((l) => ({ key: `l${l.id}`, href: `/learners/${l.id}`, title: l.email ?? l.displayName ?? l.shortId, sub: `${l.displayName ?? '—'} · ID ${l.shortId}` })) },
    { group: 'Buyurtmalar', items: r.orders.map((o) => ({ key: `o${o.id}`, href: `/orders/${o.id}`, title: o.reference, sub: `${o.learnerEmail ?? '—'} · ${money(o.total)}${o.receiptNo ? ` · ${o.receiptNo}` : ''}` })) },
    { group: 'Urinishlar', items: r.attempts.map((a) => ({ key: `a${a.id}`, href: `/attempts?open=${a.id}`, title: attemptNo(a.shortId), sub: `${a.testTitle} · ${a.learnerEmail ?? '—'}` })) },
    { group: 'Murojaatlar', items: r.tickets.map((t) => ({ key: `t${t.id}`, href: `/tickets?open=${t.id}`, title: `${ticketNo(t.no)} · ${t.subject}`, sub: t.email })) },
  ].filter((g) => g.items.length);
}

function Search({ disabled }: { disabled: boolean }) {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const listId = useId();
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<{ q: string; res?: SearchRes; err?: boolean }>({ q: '' });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== '/' || e.ctrlKey || e.metaKey || e.altKey || isTyping(e.target)) return;
      e.preventDefault();
      input.current?.focus();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    const v = q.trim();
    if (v.length < 2) { setState({ q: v }); return; }
    const ctl = new AbortController();
    const t = window.setTimeout(() => {
      adminApi.search(v, ctl.signal).then(
        (res) => setState({ q: v, res }),
        (e) => { if ((e as Error)?.name !== 'AbortError') setState({ q: v, err: true }); },
      );
    }, 250);
    return () => { ctl.abort(); window.clearTimeout(t); };
  }, [q]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => { if (!wrap.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  const groups = state.res ? hits(state.res) : [];
  const flat = groups.flatMap((g) => g.items);
  const v = q.trim();
  const go = (href: string) => { setOpen(false); setQ(''); input.current?.blur(); router.push(href); };

  return (
    <div className="ma-search-wrap" ref={wrap}>
      <form
        role="search"
        className="ma-search"
        onSubmit={(e) => { e.preventDefault(); if (flat.length === 1) go(flat[0].href); }}
        onClick={() => input.current?.focus()}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M11 18a7 7 0 100-14 7 7 0 000 14M21 21l-5-5" /></svg>
        <input
          ref={input}
          type="search"
          value={q}
          disabled={disabled}
          onChange={(e) => { setQ(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => { if (e.key === 'Escape') { setOpen(false); e.currentTarget.blur(); } }}
          placeholder="Email, buyurtma №, kvitansiya №, urinish ID"
          aria-label="Qidiruv"
          aria-keyshortcuts="/"
          aria-controls={listId}
          autoComplete="off"
          spellCheck={false}
          maxLength={254}
        />
        <span className="ma-kbd" aria-hidden="true">/</span>
      </form>
      {open && v.length >= 2 && (
        <div className="ma-bell-menu ma-search-menu" id={listId} role="listbox" aria-label="Qidiruv natijalari">
          {state.q !== v && !state.err && [0, 1].map((i) => <div key={i} style={{ padding: 10 }}><span className="ma-skel" style={{ width: `${75 - i * 20}%`, height: 14 }} /></div>)}
          {state.q === v && state.err && <span className="ma-note-empty">Qidiruv ishlamadi. Qayta urinib ko&apos;ring.</span>}
          {state.q === v && state.res && !flat.length && <span className="ma-note-empty">&quot;{v}&quot; bo&apos;yicha hech narsa topilmadi.</span>}
          {state.q === v && groups.map((g) => (
            <div key={g.group} className="ma-search-group">
              <span className="ma-bell-head">{g.group}</span>
              {g.items.map((h) => (
                <Link key={h.key} href={h.href} className="ma-note" role="option" aria-selected={false} onClick={(e) => { e.preventDefault(); go(h.href); }}>
                  <span className="ma-note-text"><b>{h.title}</b><span>{h.sub}</span></span>
                </Link>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- notifications (N3) ---------- */

const DOT: Record<string, string> = { warn: 'var(--warn)', ok: 'var(--ok)', blue: 'var(--blue)', err: 'var(--err)' };

const KIND_TITLE: Record<string, string> = {
  transfer_claimed: "Yangi o'tkazma da'vosi",
  manual_order_pending: "Yangi o'tkazma buyurtmasi",
  order_paid: "To'langan buyurtma",
  support_ticket: 'Yangi murojaat',
  amount_mismatch: 'Summa mos emas',
  provider_price_mismatch: 'Paddle narxi mos emas',
  refund_credits_used: 'Qaytarish: kreditlar ishlatilgan',
  refund_partial: 'Qisman qaytarish',
  refund_unexpected_status: 'Qaytarish: kutilmagan holat',
  paid_unknown_order: "Noma'lum buyurtmaga to'lov",
  order_refunded: 'Buyurtma qaytarildi',
  paddle_sync_failed: 'Paddle sinxroni xatosi',
};

function noteView(n: NotificationItem): { title: string; sub: string; href: string } {
  const when = ago(n.at);
  const base = KIND_TITLE[n.kind] ?? n.kind;
  const href = n.href.type === 'order' ? `/orders/${n.href.id}` : n.href.type === 'ticket' ? `/tickets?open=${n.href.id}` : '/audit';
  if (n.ticket) return { title: `${base} ${ticketNo(n.ticket.no)}`, sub: `"${n.ticket.subject}" · ${when}`, href };
  if (n.order) {
    const who = n.order.provider === 'paddle' ? 'Paddle' : n.order.learnerEmail ?? '—';
    return { title: `${base} · ${n.order.reference}`, sub: `${who} · ${money(n.order.total)} · ${when}`, href };
  }
  return { title: base, sub: when, href };
}

function Bell() {
  const { unread, notifications, notificationsError, loadNotifications, markSeen, me } = useAdminShell();
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

  // opening the menu marks what it shows as seen (contract N3 `notifications/seen`)
  useEffect(() => { if (open && notifications) markSeen(); }, [open, notifications, markSeen]);

  return (
    <div className="ma-bell-wrap" ref={wrap}>
      <button
        type="button"
        className="ma-bell"
        title="Bildirishnomalar"
        aria-label={unread ? `Bildirishnomalar (${unread} ta yangi)` : 'Bildirishnomalar'}
        aria-expanded={open}
        aria-controls={menuId}
        disabled={!me}
        onClick={() => { if (!open) loadNotifications(); setOpen((o) => !o); }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M6 8a6 6 0 1112 0c0 7 3 9 3 9H3s3-2 3-9M10 21h4" /></svg>
      </button>
      {unread > 0 && <span className="ma-bell-dot" aria-hidden="true" />}
      {open && (
        <div className="ma-bell-menu" id={menuId}>
          <span className="ma-bell-head">Bildirishnomalar</span>
          {!notifications && !notificationsError && [0, 1, 2].map((i) => <div key={i} style={{ padding: 10 }}><span className="ma-skel" style={{ width: `${80 - i * 15}%`, height: 14 }} /></div>)}
          {notificationsError && !notifications && <span className="ma-note-empty">Yuklab bo&apos;lmadi. Qayta urinib ko&apos;ring.</span>}
          {notifications && notifications.items.length === 0 && <span className="ma-note-empty">Yangi bildirishnoma yo&apos;q</span>}
          {notifications?.items.map((n) => {
            const v = noteView(n);
            return (
              <Link key={n.id} href={v.href} className="ma-note" onClick={() => setOpen(false)}>
                <span className="ma-note-dot" style={{ background: DOT[n.tone] ?? 'var(--blue)' }} aria-hidden="true" />
                <span className="ma-note-text"><b>{v.title}</b><span>{v.sub}</span></span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
