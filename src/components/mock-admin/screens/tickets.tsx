'use client';
/** Admin Tickets.dc.html — K1 list (open/closed), K2 thread + learner context, K3 reply (+ close), K4 close/reopen. */
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/admin-mock/api';
import { newIdemKey } from '@/lib/admin-mock/http';
import { errText, isNotFound } from '@/lib/admin-mock/errors';
import { ago, attemptNo, dateTime, examLabel, ticketNo } from '@/lib/admin-mock/format';
import type { AdminTicketRow, TicketDetailRes } from '@/lib/admin-mock/types';
import { Button } from '../ui/button';
import { Pager } from '../ui/filters';
import { ErrorState } from '../ui/state';
import { useToast } from '../ui/toast';
import { useUrlState } from './hooks';
import { balanceChips } from './learners';
import { shortName } from './order-detail';
import { statusOf } from './order-shared';

const PS = 30;
const card = { borderRadius: 24, boxShadow: 'var(--raise)', display: 'flex', flexDirection: 'column', minWidth: 0 } as const;

export function TicketsScreen() {
  const [f, setF] = useUrlState({ status: 'OPEN', open: '', page: '1' });
  const page = Math.max(1, Number(f.page) || 1);
  const query = { status: f.status, page, pageSize: PS };
  const list = useQuery({ queryKey: ['am', 'tickets', query], queryFn: () => adminApi.tickets(query), placeholderData: (p) => p });
  const items = list.data?.items ?? [];
  const selId = f.open || items[0]?.id || null;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,300px),1fr))', gap: 20, alignItems: 'start' }}>
      <section style={{ ...card, padding: 14, gap: 10 }}>
        <div className="ma-seg" role="tablist" aria-label="Holat">
          <button type="button" role="tab" style={{ flex: 1, justifyContent: 'center' }} aria-selected={f.status === 'OPEN'} onClick={() => setF({ status: 'OPEN', open: '', page: '1' })}>
            Ochiq{list.data ? ` · ${list.data.counts.open}` : ''}
          </button>
          <button type="button" role="tab" style={{ flex: 1, justifyContent: 'center' }} aria-selected={f.status === 'CLOSED'} onClick={() => setF({ status: 'CLOSED', open: '', page: '1' })}>Yopiq</button>
        </div>
        {list.isError && !list.data && <ErrorState flat title="Yuklab bo'lmadi" text={errText(list.error)} onRetry={() => list.refetch()} retrying={list.isFetching} />}
        {!list.data && !list.isError && [1, 2, 3, 4].map((i) => <span key={i} className="ma-skel" style={{ height: 70, borderRadius: 14 }} />)}
        {list.data && items.length === 0 && <span style={{ padding: 12, fontSize: 13, color: 'var(--ink2)', textAlign: 'center' }}>{f.status === 'OPEN' ? "Ochiq murojaat yo'q." : "Yopiq murojaat yo'q."}</span>}
        {items.map((t) => (
          <button key={t.id} type="button" className="ma-ticket-item" aria-current={t.id === selId ? 'true' : undefined} onClick={() => setF({ open: t.id })}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <b style={{ fontSize: 13, flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.subject}</b>
              <span style={{ fontSize: 11, color: 'var(--mut)', fontWeight: 700, whiteSpace: 'nowrap' }}>{ago(t.lastMessageAt ?? t.createdAt).replace(/ oldin$/, '')}</span>
            </div>
            <span style={{ fontSize: 12, color: 'var(--ink2)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ticketNo(t.no)} · {t.email}</span>
            <span style={{ fontSize: 12, color: 'var(--mut)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.preview}</span>
          </button>
        ))}
        {list.data && list.data.total > PS && <Pager page={page} pageSize={PS} total={list.data.total} shown={items.length} onPage={(p) => setF({ page: String(p), open: '' })} />}
      </section>
      <Thread id={selId} />
    </div>
  );
}

function Thread({ id }: { id: string | null }) {
  const qc = useQueryClient();
  const toast = useToast();
  const q = useQuery({ queryKey: ['am', 'ticket', id], queryFn: () => adminApi.ticket(id!), enabled: !!id, retry: (n, e) => !isNotFound(e) && n < 1 });
  const [body, setBody] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const idem = useMemo(() => newIdemKey(), [id, q.data?.messages.length]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { setBody(''); setErr(null); }, [id]);
  const refresh = () => { void q.refetch(); void qc.invalidateQueries({ queryKey: ['am', 'tickets'] }); void qc.invalidateQueries({ queryKey: ['am', 'badges'] }); };

  async function setStatus(t: AdminTicketRow) {
    setBusy('status');
    try {
      await adminApi.setTicketStatus(t.id, t.status === 'OPEN' ? 'CLOSED' : 'OPEN');
      toast({ tone: 'ok', title: t.status === 'OPEN' ? 'Murojaat yopildi' : 'Murojaat qayta ochildi', text: ticketNo(t.no) });
      refresh();
    } catch (e) {
      toast({ tone: 'err', title: 'Saqlanmadi', text: errText(e) });
    } finally {
      setBusy(null);
    }
  }
  async function reply(close: boolean) {
    const b = body.trim();
    if (!b) { setErr('Javob matnini yozing.'); return; }
    setBusy(close ? 'close' : 'send');
    try {
      const r = await adminApi.reply(id!, { body: b, close: close || undefined }, idem);
      setBody('');
      toast({ tone: r.mailQueued ? 'ok' : 'warn', title: close ? 'Javob yuborildi, murojaat yopildi' : 'Javob yuborildi', text: r.mailQueued ? undefined : "O'quvchiga email yuborilmadi (email yo'q)." });
      refresh();
    } catch (e) {
      setErr(errText(e));
    } finally {
      setBusy(null);
    }
  }

  if (!id) return <section style={{ ...card, padding: 20, gridColumn: 'span 2' }}><span style={{ fontSize: 13, color: 'var(--ink2)' }}>Murojaat tanlang.</span></section>;
  if (isNotFound(q.error)) return <section style={{ ...card, padding: 20 }}><b>Murojaat topilmadi</b></section>;
  if (q.isError && !q.data) return <section style={{ ...card, padding: 20 }}><ErrorState flat title="Yuklab bo'lmadi" text={errText(q.error)} onRetry={() => q.refetch()} retrying={q.isFetching} /></section>;
  if (!q.data) return <><span className="ma-skel" style={{ height: 360, borderRadius: 24 }} /><span className="ma-skel" style={{ height: 300, borderRadius: 24 }} /></>;
  const { ticket: t, messages, context } = q.data;
  const open = t.status === 'OPEN';
  return (
    <>
      <section style={{ ...card, padding: 20, gap: 16 }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1, minWidth: 200 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--mut)' }}>{ticketNo(t.no)} · {dateTime(t.createdAt)}</span>
            <b style={{ fontSize: 17 }}>{t.subject}</b>
          </div>
          <span className={`ma-chip ${open ? 't-warn' : 't-neutral'}`}>{open ? 'Ochiq' : 'Yopiq'}</span>
          <Button variant="secondary" size={36} style={{ color: 'var(--ink2)', borderRadius: 10, padding: '0 14px' }} onClick={() => setStatus(t)} loading={busy === 'status'}>{open ? 'Yopish' : 'Qayta ochish'}</Button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {messages.map((m, i) => <Bubble key={m.id ?? i} m={m} learnerName={t.learnerName ?? t.name} />)}
        </div>
        {open && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <textarea rows={3} className={`ma-textarea${err ? ' is-error' : ''}`} placeholder="Javob yozing…" value={body} maxLength={4000} onChange={(e) => { setBody(e.target.value); setErr(null); }} aria-label="Javob" />
            {err && <span className="ma-field-error s-sm" role="alert">{err}</span>}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <Button variant="secondary" size={40} style={{ color: 'var(--ink2)', padding: '0 16px' }} onClick={() => reply(true)} loading={busy === 'close'} disabled={!!busy && busy !== 'close'}>Javob berib yopish</Button>
              <Button size={40} style={{ padding: '0 18px' }} onClick={() => reply(false)} loading={busy === 'send'} disabled={!!busy && busy !== 'send'}>Yuborish</Button>
            </div>
          </div>
        )}
      </section>
      <Context t={t} c={context} />
    </>
  );
}

function Bubble({ m, learnerName }: { m: TicketDetailRes['messages'][number]; learnerName: string }) {
  const admin = m.author === 'ADMIN';
  const sys = m.author === 'SYSTEM';
  const who = sys ? 'Tizim' : admin ? `${shortName(m.authorName)} · admin` : `${m.authorName ?? learnerName} · ${dateTime(m.createdAt)}`;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignSelf: admin ? 'flex-end' : 'flex-start', maxWidth: '88%' }}>
      <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--mut)', textAlign: admin ? 'right' : 'left' }}>{who}</span>
      <div style={{ padding: '12px 14px', borderRadius: 16, background: admin ? 'var(--grad)' : sys ? 'transparent' : 'var(--paper)', color: admin ? '#fff' : sys ? 'var(--mut)' : 'var(--ink)', fontSize: 14, lineHeight: 1.5, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{m.body}</div>
      {admin && m.mailStatus === 'FAILED' && <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--err)', textAlign: 'right' }}>Email yuborilmadi</span>}
    </div>
  );
}

const ORDER_SHORT: Record<string, { t: string; fg: string }> = { PENDING: { t: 'Kutmoqda', fg: 'var(--warn)' }, PAID: { t: "To'langan", fg: 'var(--ok)' } };

function Context({ t, c }: { t: AdminTicketRow; c: TicketDetailRes['context'] }) {
  const box = { display: 'flex', justifyContent: 'space-between', gap: 10, padding: '10px 12px', borderRadius: 12, background: 'var(--paper)', fontSize: 13, color: 'var(--ink)' } as const;
  return (
    <section style={{ ...card, padding: 20, gap: 14 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
        <b style={{ fontSize: 15 }}>{c.learner?.displayName ?? t.learnerName ?? t.name}</b>
        <span style={{ fontSize: 13, color: 'var(--ink2)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.learner?.email ?? t.email}</span>
        {c.learner && <Link href={`/learners/${c.learner.id}`} style={{ fontSize: 13, fontWeight: 700, marginTop: 4 }}>Profilni ochish →</Link>}
      </div>
      {c.balances.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--mut)' }}>Balans</span>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {balanceChips(c.balances as Parameters<typeof balanceChips>[0]).map((b) => <span key={b.t} className={`ma-chip t-${b.tone}`}>{b.t}</span>)}
          </div>
        </div>
      )}
      {c.lastOrders.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--mut)' }}>Oxirgi buyurtmalar</span>
          {c.lastOrders.map((o) => {
            const s = ORDER_SHORT[o.status] ?? { t: statusOf(o.status).t, fg: 'var(--ink2)' };
            return (
              <Link key={o.id} href={`/orders/${o.id}`} style={box} className="ma-hover-row">
                <span style={{ fontWeight: 700 }}>{o.reference} · {examLabel(o.product.exam)} {o.product.qty}</span>
                <span style={{ fontWeight: 800, color: s.fg }}>{s.t}</span>
              </Link>
            );
          })}
        </div>
      )}
      {c.lastAttempt && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--mut)' }}>Oxirgi urinish</span>
          <Link href={`/attempts?open=${c.lastAttempt.id}`} style={box} className="ma-hover-row">
            <span style={{ fontWeight: 700 }}>{attemptNo(c.lastAttempt.shortId)} · {c.lastAttempt.testTitle}</span>
            <span style={{ fontWeight: 800 }}>{c.lastAttempt.score ? c.lastAttempt.score.label ?? c.lastAttempt.score.value : '—'}</span>
          </Link>
        </div>
      )}
      {!c.learner && <span style={{ fontSize: 12, color: 'var(--mut)', fontWeight: 600 }}>Bu email bo&apos;yicha o&apos;quvchi hisobi topilmadi.</span>}
    </section>
  );
}
