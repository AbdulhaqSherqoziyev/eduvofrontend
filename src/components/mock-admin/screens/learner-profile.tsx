'use client';
/**
 * Admin Learner Profile.dc.html — L2 (header, balance cards, lot table), L3 tabs (ledger / orders /
 * attempts / tickets, paged), L4 grant dialog (preview "Yangi balans"), L5 revoke, L6 lock/unlock,
 * L7 password-reset link. States: loading, 404, error.
 */
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/admin-mock/api';
import { newIdemKey } from '@/lib/admin-mock/http';
import { errText, isNotFound } from '@/lib/admin-mock/errors';
import { addDays, ago, attemptNo, dateTime, dayLabel, dayMonth, dotDate, examLabel, flag, money, productName, tashkentDay, ticketNo } from '@/lib/admin-mock/format';
import type { AdminExam, AdminExamCredits, LearnerDetailRes, LotRow } from '@/lib/admin-mock/types';
import type { MockCreditKind } from '@/lib/types/owner-mock';
import { AdminPage } from '../shell/admin-page';
import { ROOT_CRUMB } from '../shell/nav';
import { Button } from '../ui/button';
import { Dialog } from '../ui/dialog';
import { Pager } from '../ui/filters';
import { ErrorState, NotFoundState } from '../ui/state';
import { SkeletonRows } from '../ui/table';
import { useToast } from '../ui/toast';
import { attemptStatus, sectionLabel } from './attempt-shared';
import { LEARNER_STATUS, goalText } from './learners';
import { initialsOf } from './order-detail';
import { statusOf } from './order-shared';

const CRUMBS = [ROOT_CRUMB, { label: "O'quvchilar", href: '/learners' }];
const SHIMMER = { background: 'linear-gradient(90deg,var(--hover) 0%,var(--paper) 50%,var(--hover) 100%)', backgroundSize: '1200px 100%', animation: 'shimmer 1.4s linear infinite' } as const;
const card = { borderRadius: 24, boxShadow: 'var(--raise)', padding: 20, display: 'flex', flexDirection: 'column', gap: 16 } as const;
const EXAMS: AdminExam[] = ['ielts', 'sat', 'cefr'];

const regionName = (cc: string | null) => {
  if (!cc) return '—';
  try { return new Intl.DisplayNames(['uz'], { type: 'region' }).of(cc.toUpperCase()) ?? cc; } catch { return cc; }
};

export function LearnerProfileScreen({ id }: { id: string }) {
  const q = useQuery({ queryKey: ['am', 'learner', id], queryFn: () => adminApi.learner(id), retry: (n, e) => !isNotFound(e) && n < 1 });
  const d = q.data;
  const title = d ? d.learner.displayName ?? d.learner.email ?? d.header.shortId : isNotFound(q.error) ? "O'quvchi" : '…';
  return (
    <AdminPage active="learners" title={title} crumbs={CRUMBS}>
      {isNotFound(q.error) ? (
        <NotFoundState title="O'quvchi topilmadi" text={`ID ${id} bo'yicha hisob yo'q yoki butunlay o'chirilgan.`} backHref="/learners" backLabel="← Ro'yxatga qaytish" />
      ) : q.isError && !d ? (
        <ErrorState title="Ma'lumotlarni yuklab bo'lmadi" text={errText(q.error, "Internet aloqasini tekshiring yoki qayta urinib ko'ring.")} onRetry={() => q.refetch()} retrying={q.isFetching} />
      ) : !d ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }} aria-busy="true">
          <div style={{ height: 120, borderRadius: 24, ...SHIMMER }} />
          <div style={{ height: 240, borderRadius: 24, ...SHIMMER }} />
          <div style={{ height: 300, borderRadius: 24, ...SHIMMER }} />
        </div>
      ) : (
        <Profile d={d} />
      )}
    </AdminPage>
  );
}

type Dlg = 'grant' | 'revoke' | 'block' | null;

function Profile({ d }: { d: LearnerDetailRes }) {
  const qc = useQueryClient();
  const toast = useToast();
  const l = d.learner;
  const [dlg, setDlg] = useState<Dlg>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const s = LEARNER_STATUS[l.status] ?? { t: l.status, tone: 'neutral' as const };
  const locked = l.status === 'LOCKED';
  const gone = l.status === 'DELETED';
  const refresh = () => {
    void qc.invalidateQueries({ queryKey: ['am', 'learner', l.id] });
    void qc.invalidateQueries({ queryKey: ['am', 'learner-tab', l.id] });
    void qc.invalidateQueries({ queryKey: ['am', 'learners'] });
  };

  async function unlock() {
    setBusy('unlock');
    try {
      await adminApi.unlock(l.id);
      toast({ tone: 'ok', title: 'Blokdan chiqarildi' });
      refresh();
    } catch (e) {
      toast({ tone: 'err', title: 'Saqlanmadi', text: errText(e) });
    } finally {
      setBusy(null);
    }
  }
  async function sendReset() {
    setBusy('reset');
    try {
      const r = await adminApi.sendReset(l.id, newIdemKey());
      toast({ tone: 'ok', title: r.kind === 'reset_google_only' ? `Google orqali kirish eslatmasi ${l.email} ga yuborildi` : `Parol tiklash havolasi ${l.email} ga yuborildi` });
    } catch (e) {
      toast({ tone: 'err', title: 'Yuborilmadi', text: errText(e) });
    } finally {
      setBusy(null);
    }
  }

  const h = d.header;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <section style={{ ...card, padding: 'clamp(16px,2vw,24px)', flexDirection: 'row', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'var(--hover)', color: 'var(--blue)', fontWeight: 800, fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }} aria-hidden="true">{initialsOf(l.displayName, l.email)}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1, minWidth: 240 }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <b style={{ fontSize: 20 }}>{l.displayName ?? '—'}</b>
            <span className={`ma-chip t-${s.tone}`}>{s.t}</span>
          </div>
          <span style={{ fontSize: 13, color: 'var(--ink2)', fontWeight: 600 }}>
            {l.email ?? '—'} {h.emailVerified ? <span style={{ color: 'var(--ok)' }}>✓ tasdiqlangan</span> : <span style={{ color: 'var(--err)' }}>✗ tasdiqlanmagan</span>}
            {' · '}{flag(h.country)} {regionName(h.country)} · {h.locale}{h.goal ? ` · Maqsad ${goalText(h.goal)}` : ''}
          </span>
          <span style={{ fontSize: 12, color: 'var(--mut)', fontWeight: 600 }}>
            Ro&apos;yxatdan o&apos;tgan {dayMonth(h.createdAt, true)} · oxirgi faollik {ago(h.lastActiveAt)} · ID {h.shortId}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Button size={42} style={{ fontSize: 13 }} onClick={() => setDlg('grant')} disabled={gone}>+ Kredit qo&apos;shish</Button>
          <Button variant="secondary" size={42} style={{ fontSize: 13, padding: '0 16px' }} onClick={() => setDlg('revoke')} disabled={gone}>Kredit qaytarib olish</Button>
          {locked
            ? <Button variant="danger" size={42} style={{ fontSize: 13, padding: '0 16px' }} onClick={unlock} loading={busy === 'unlock'}>Blokdan chiqarish</Button>
            : <Button variant="danger" size={42} style={{ fontSize: 13, padding: '0 16px' }} onClick={() => setDlg('block')} disabled={gone}>Bloklash</Button>}
          <Button variant="secondary" size={42} style={{ fontSize: 13, padding: '0 16px', color: 'var(--ink2)' }} onClick={sendReset} loading={busy === 'reset'} disabled={gone || !l.email}>Parol tiklash havolasi</Button>
        </div>
      </section>

      <Balance d={d} />
      <Tabs id={l.id} />

      <GrantDialog open={dlg === 'grant'} d={d} onClose={() => setDlg(null)} onDone={() => { setDlg(null); refresh(); }} />
      <RevokeDialog open={dlg === 'revoke'} d={d} onClose={() => setDlg(null)} onDone={() => { setDlg(null); refresh(); }} />
      <BlockDialog open={dlg === 'block'} d={d} onClose={() => setDlg(null)} onDone={() => { setDlg(null); refresh(); }} />
    </div>
  );
}

function canChip(c: AdminExamCredits): { t: string; bg: string; fg: string } {
  if (c.siteStatus === 'coming_soon' || c.blockedReason === 'COMING_SOON') return { t: 'Tez kunda', bg: 'var(--hover)', fg: 'var(--mut)' };
  if (c.canStartFull) return { t: 'Full boshlay oladi', bg: 'var(--okBg)', fg: 'var(--ok)' };
  if (c.blockedReason === 'NO_FRESH_TEST') return { t: "Yangi test yo'q", bg: 'var(--warnBg)', fg: 'var(--warn)' };
  return { t: 'Balans 0', bg: 'var(--warnBg)', fg: 'var(--warn)' };
}
function cardNote(c: AdminExamCredits): { t: string; warn: boolean } {
  if (c.siteStatus === 'coming_soon' || c.blockedReason === 'COMING_SOON') return { t: 'Imtihon hali ochilmagan', warn: false };
  const free = c.freeSection.used
    ? `Bepul bo'lim ishlatilgan (${[sectionLabel(c.freeSection.sectionKey), c.freeSection.usedAt ? dayMonth(c.freeSection.usedAt) : null].filter(Boolean).join(', ')})`
    : c.freeSection.available ? "Bepul bo'lim hali mavjud." : '';
  if (c.canStartFull) return { t: free, warn: false };
  if (c.blockedReason === 'NO_FRESH_TEST') return { t: "Full mock boshlay olmaydi — yangi test qolmagan.", warn: true };
  return { t: `Full mock boshlay olmaydi — balans 0.${c.freeSection.available ? " Bepul bo'lim hali mavjud." : ''}`, warn: true };
}

const SRC: Record<LotRow['source'], string> = { order: 'Buyurtma', admin: 'Admin', promo: 'Promo', free: 'Bepul' };
const KIND: Record<string, string> = { full: 'Full', section: "Bo'lim", unlimited: 'Cheksiz' };

function Balance({ d }: { d: LearnerDetailRes }) {
  const cards = EXAMS.map((e) => d.adminCredits.find((c) => c.exam === e)).filter(Boolean) as AdminExamCredits[];
  return (
    <section style={card}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, flex: 1 }}>Balans</h3>
        <span style={{ fontSize: 12, color: 'var(--mut)', fontWeight: 600 }}>Full mock faqat full kredit yoki faol cheksiz paket bilan boshlanadi. Bepul: har imtihonda bitta bo&apos;lim, bir marta.</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,260px),1fr))', gap: 16 }}>
        {cards.map((c) => {
          const chip = canChip(c);
          const note = cardNote(c);
          const unl = c.unlimitedUntil && Date.parse(c.unlimitedUntil) > Date.now() ? `${dayMonth(c.unlimitedUntil)} gacha` : '—';
          return (
            <div key={c.exam} style={{ borderRadius: 18, boxShadow: 'var(--inset)', padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <b style={{ fontSize: 15 }}>{examLabel(c.exam)}</b>
                <span style={{ fontSize: 11, fontWeight: 800, padding: '3px 8px', borderRadius: 999, background: chip.bg, color: chip.fg }}>{chip.t}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}><span style={{ fontSize: 11, fontWeight: 700, color: 'var(--mut)' }}>Full</span><b style={{ fontSize: 22 }}>{c.fullMocks}</b></div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}><span style={{ fontSize: 11, fontWeight: 700, color: 'var(--mut)' }}>Bo&apos;lim</span><b style={{ fontSize: 22 }}>{c.sections}</b></div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}><span style={{ fontSize: 11, fontWeight: 700, color: 'var(--mut)' }}>Cheksiz</span><b style={{ fontSize: 13, marginTop: 6 }}>{unl}</b></div>
              </div>
              {note.t && <span style={{ fontSize: 12, fontWeight: 700, color: note.warn ? 'var(--warn)' : 'var(--mut)' }}>{note.t}</span>}
            </div>
          );
        })}
      </div>
      <div style={{ borderRadius: 16, background: 'var(--paper)', overflowX: 'auto' }}>
        <table className="ma-table" style={{ minWidth: 640 }}>
          <thead>
            <tr style={{ textAlign: 'left', color: 'var(--mut)', fontSize: 12 }}>
              <th style={{ padding: '12px 16px' }}>Lot · manba</th><th>Imtihon · turi</th><th style={{ textAlign: 'right' }}>Miqdor</th><th style={{ textAlign: 'right' }}>Qolgan</th><th style={{ padding: '12px 16px 12px 10px' }}>Muddati</th>
            </tr>
          </thead>
          <tbody>
            {d.lotRows.length === 0 && <tr><td colSpan={5} style={{ padding: '14px 16px', color: 'var(--ink2)' }}>Hali kredit berilmagan.</td></tr>}
            {d.lotRows.map((r, i) => {
              const days = r.expiresAt ? Math.ceil((Date.parse(r.expiresAt) - Date.now()) / 86400000) : null;
              const soon = days !== null && days >= 0 && days <= 60 && !r.expired && r.remaining > 0;
              return (
                <tr key={r.id ?? `free${i}`}>
                  <td style={{ padding: '11px 16px' }}>
                    <span style={{ fontWeight: 700 }}>{SRC[r.source]}</span>{' '}
                    {r.ref?.type === 'order' && <Link href={`/orders/${r.ref.id}`} style={{ fontWeight: 700 }}>{r.ref.reference ?? '—'}</Link>}
                    {r.ref?.type === 'admin_action' && <span className="ma-mono" style={{ fontWeight: 700, color: 'var(--ink2)' }}>AU-{r.ref.id.slice(0, 6).toUpperCase()}</span>}
                  </td>
                  <td style={{ padding: '11px 10px', color: 'var(--ink2)', fontWeight: 600 }}>{examLabel(r.exam)} · {r.source === 'free' ? sectionLabel(r.sectionKey) || 'Bepul' : KIND[r.kind] ?? r.kind}</td>
                  <td style={{ padding: '11px 10px', textAlign: 'right', fontWeight: 700 }}>{r.kind === 'unlimited' ? '∞' : r.qty}</td>
                  <td style={{ padding: '11px 10px', textAlign: 'right', fontWeight: 800, color: r.remaining > 0 && !r.expired ? 'var(--ink)' : 'var(--mut)' }}>{r.kind === 'unlimited' ? '—' : r.remaining}</td>
                  <td style={{ padding: '11px 16px 11px 10px', fontWeight: 600, color: r.expired || !r.expiresAt ? 'var(--mut)' : soon ? 'var(--warn)' : 'var(--ink2)' }}>
                    {r.expiresAt ? `${dotDate(r.expiresAt)}${r.expired ? " · muddati o'tgan" : soon ? ` · ${days} kun` : ''}` : '—'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

type TabKey = 'ledger' | 'orders' | 'attempts' | 'tickets';
const TABS: Array<{ k: TabKey; label: string; heads: string[] }> = [
  { k: 'ledger', label: 'Kirim/chiqim', heads: ['Sana', '±', 'Sabab', 'Turi', "Bog'liq"] },
  { k: 'orders', label: 'Buyurtmalar', heads: ['Sana', 'Summa', 'Mahsulot', 'Holat', 'Buyurtma'] },
  { k: 'attempts', label: 'Urinishlar', heads: ['Sana', 'Band', 'Test', 'Holat', 'Urinish'] },
  { k: 'tickets', label: 'Murojaatlar', heads: ['Sana', '#', 'Mavzu', 'Holat', 'Murojaat'] },
];
const REASON: Record<string, string> = {
  GRANT_ORDER: 'Buyurtma', ADMIN_ADJUST: "Admin qo'shdi", ADMIN_REVOKE: 'Admin qaytarib oldi', CONSUME_ATTEMPT: 'Urinish',
  REFUND_AUTO: 'Avtomatik qaytarildi', REFUND_REVOKE: 'Qaytarish (refund)', FREE_SECTION: "Bepul bo'lim",
};
interface Row { key: string; a: string; b: string; bFg?: string; c: string; d: string; dTone: string; e: string; href: string | null }

function Tabs({ id }: { id: string }) {
  const [tab, setTab] = useState<TabKey>('ledger');
  const [page, setPage] = useState(1);
  useEffect(() => setPage(1), [tab]);
  const PS = 10;
  const q = useQuery({
    queryKey: ['am', 'learner-tab', id, tab, page],
    queryFn: async (): Promise<{ rows: Row[]; total: number }> => {
      const p = { page, pageSize: PS };
      if (tab === 'ledger') {
        const r = await adminApi.learnerLedger(id, p);
        return { total: r.total, rows: r.items.map((x) => ({
          key: x.id, a: dateTime(x.at), b: x.delta > 0 ? `+${x.delta}` : x.delta < 0 ? `−${-x.delta}` : '0',
          bFg: x.delta > 0 ? 'var(--ok)' : x.delta < 0 ? 'var(--err)' : 'var(--mut)',
          c: [REASON[x.reason] ?? x.reason, x.note].filter(Boolean).join(' · '),
          d: x.reason === 'FREE_SECTION' ? 'Bepul' : KIND[x.kind] ?? x.kind, dTone: x.reason === 'FREE_SECTION' ? 'muted' : 'neutral',
          e: x.ref ? (x.ref.type === 'attempt' ? attemptNo(x.ref.label) : x.ref.label) : '—',
          href: x.ref ? (x.ref.type === 'order' ? `/orders/${x.ref.id}` : x.ref.type === 'attempt' ? `/attempts?open=${x.ref.id}` : null) : null,
        })) };
      }
      if (tab === 'orders') {
        const r = await adminApi.learnerOrders(id, p);
        return { total: r.total, rows: r.items.map((o) => { const s = statusOf(o.status); return { key: o.id, a: dateTime(o.createdAt), b: money(o.quote.total), c: productName(o.quote.product), d: s.t, dTone: s.tone, e: o.reference, href: `/orders/${o.id}` }; }) };
      }
      if (tab === 'attempts') {
        const r = await adminApi.learnerAttempts(id, p);
        return { total: r.total, rows: r.items.map((x) => { const s = attemptStatus(x.status); return { key: x.id, a: dateTime(x.startedAt), b: x.score ? x.score.label ?? String(x.score.value) : '—', c: x.testTitle ?? '—', d: s.t, dTone: s.tone, e: attemptNo(x.shortId), href: `/attempts?open=${x.id}` }; }) };
      }
      const r = await adminApi.learnerTickets(id, p);
      return { total: r.total, rows: r.items.map((t) => ({ key: t.id, a: dateTime(t.createdAt), b: `T-${t.no}`, c: t.subject, d: t.status === 'OPEN' ? 'Ochiq' : 'Yopiq', dTone: t.status === 'OPEN' ? 'warn' : 'neutral', e: ticketNo(t.no).slice(1), href: `/tickets?open=${t.id}` })) };
    },
    placeholderData: (p) => p,
  });
  const cfg = TABS.find((t) => t.k === tab)!;
  return (
    <section style={card}>
      <div className="ma-seg" role="tablist" aria-label="Tarix" style={{ alignSelf: 'flex-start', maxWidth: '100%' }}>
        {TABS.map((t) => <button key={t.k} type="button" role="tab" aria-selected={t.k === tab} onClick={() => setTab(t.k)}>{t.label}</button>)}
      </div>
      {q.isError && !q.data ? (
        <ErrorState flat title="Ro'yxatni yuklab bo'lmadi" text={errText(q.error)} onRetry={() => q.refetch()} retrying={q.isFetching} />
      ) : (
        <div style={{ borderRadius: 16, background: 'var(--paper)', overflowX: 'auto' }}>
          <table className="ma-table" style={{ minWidth: 640 }}>
            <thead><tr style={{ textAlign: 'left', color: 'var(--mut)', fontSize: 12 }}>{cfg.heads.map((h) => <th key={h} style={{ padding: '12px 14px' }}>{h}</th>)}</tr></thead>
            <tbody>
              {!q.data && <SkeletonRows cols={5} n={4} />}
              {q.data && q.data.rows.length === 0 && <tr><td colSpan={5} style={{ padding: '14px', color: 'var(--ink2)' }}>Hali yozuv yo&apos;q.</td></tr>}
              {q.data?.rows.map((r) => (
                <tr key={r.key}>
                  <td style={{ padding: '11px 14px', fontWeight: 600, color: 'var(--ink2)', whiteSpace: 'nowrap' }}>{r.a}</td>
                  <td style={{ padding: '11px 14px', fontWeight: 800, color: r.bFg ?? 'var(--ink)', whiteSpace: 'nowrap' }}>{r.b}</td>
                  <td style={{ padding: '11px 14px', fontWeight: 600 }}>{r.c}</td>
                  <td style={{ padding: '11px 14px' }}><span className={`ma-chip t-${r.dTone}`} style={{ padding: '3px 9px' }}>{r.d}</span></td>
                  <td style={{ padding: '11px 14px', fontWeight: 700, whiteSpace: 'nowrap' }}>{r.href ? <Link href={r.href}>{r.e}</Link> : r.e}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {q.data && q.data.total > PS && <Pager page={page} pageSize={PS} total={q.data.total} shown={q.data.rows.length} onPage={setPage} />}
    </section>
  );
}

/* ---------- dialogs ---------- */

const segBtn = { flex: 1, height: 36 } as const;
function Seg<T extends string>({ value, options, onPick, label }: { value: T; options: Array<{ v: T; t: string; disabled?: boolean }>; onPick: (v: T) => void; label: string }) {
  return (
    <div className="ma-seg" role="group" aria-label={label}>
      {options.map((o) => <button key={o.v} type="button" style={segBtn} aria-pressed={o.v === value} disabled={o.disabled} onClick={() => onPick(o.v)}>{o.t}</button>)}
    </div>
  );
}

function credFor(d: LearnerDetailRes, e: AdminExam) {
  return d.adminCredits.find((c) => c.exam === e) ?? { fullMocks: 0, sections: 0, unlimitedUntil: null };
}

function GrantDialog({ open, d, onClose, onDone }: { open: boolean; d: LearnerDetailRes; onClose: () => void; onDone: () => void }) {
  const toast = useToast();
  const [exam, setExam] = useState<AdminExam>('ielts');
  const [kind, setKind] = useState<MockCreditKind>('full');
  const [n, setN] = useState(1);
  const [months, setMonths] = useState(12);
  const [note, setNote] = useState('');
  const [tried, setTried] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const idem = useMemo(() => (open ? newIdemKey() : ''), [open]);
  useEffect(() => { if (open) { setN(1); setNote(''); setTried(false); setErr(null); } }, [open]);
  const c = credFor(d, exam);
  const e = examLabel(exam);
  const today = tashkentDay();
  const base = c.unlimitedUntil && c.unlimitedUntil.slice(0, 10) > today ? c.unlimitedUntil.slice(0, 10) : today;
  const preview = kind === 'full' ? `${e} ${c.fullMocks} → ${c.fullMocks + n} full`
    : kind === 'section' ? `${e} ${c.sections} → ${c.sections + n} bo'lim`
    : `${e} cheksiz · ${n * 10} kun (${dayLabel(base)} → ${dayLabel(addDays(base, n * 10))})`;
  const noteErr = tried && !note.trim();

  async function submit() {
    setTried(true);
    if (!note.trim()) return;
    setBusy(true);
    setErr(null);
    try {
      await adminApi.grant(d.learner.id, {
        exam, kind, qty: kind === 'unlimited' ? 1 : n, reason: note.trim(),
        ...(kind === 'unlimited' ? { unlimitedDays: n * 10 } : { validityMonths: months }),
      }, idem);
      toast({ tone: 'ok', title: `Qo'shildi · ${preview}` });
      onDone();
    } catch (e2) {
      setErr(errText(e2));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onClose={onClose} busy={busy} width={500} gap={16}
      title={<span style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>Kredit qo&apos;shish<span style={{ fontSize: 13, color: 'var(--ink2)', fontWeight: 400 }}>{d.learner.email} · audit jurnaliga yoziladi</span></span>}
      actions={<>
        <Button variant="secondary" style={{ color: 'var(--ink2)' }} onClick={onClose} disabled={busy}>Bekor qilish</Button>
        <Button onClick={submit} loading={busy}>Qo&apos;shish</Button>
      </>}>
      <div className="ma-field"><span className="ma-label">Imtihon</span>
        <Seg label="Imtihon" value={exam} onPick={setExam} options={EXAMS.map((x) => ({ v: x, t: examLabel(x) }))} />
      </div>
      <div className="ma-field"><span className="ma-label">Turi</span>
        <Seg label="Turi" value={kind} onPick={(k) => { setKind(k); setN(1); }} options={[{ v: 'full', t: 'Full mock' }, { v: 'section', t: "Bo'lim" }, { v: 'unlimited', t: 'Cheksiz N kun' }]} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <div className="ma-field"><span className="ma-label">{kind === 'unlimited' ? 'Davomiylik (×10 kun)' : 'Miqdor'}</span>
          <div className="ma-stepper" style={{ width: '100%' }} role="group" aria-label={kind === 'unlimited' ? 'Davomiylik' : 'Miqdor'}>
            <button type="button" onClick={() => setN((x) => Math.max(1, x - 1))} disabled={n <= 1} aria-label="Kamaytirish">−</button>
            <output aria-live="polite">{kind === 'unlimited' ? `${n * 10} kun` : n}</output>
            <button type="button" onClick={() => setN((x) => Math.min(10, x + 1))} disabled={n >= 10} aria-label="Ko'paytirish">+</button>
          </div>
        </div>
        <label className="ma-field"><span className="ma-label">Amal qilish muddati</span>
          <select className="ma-select" style={{ height: 46, borderRadius: 14, fontSize: 14 }} value={months} onChange={(ev) => setMonths(+ev.target.value)} disabled={kind === 'unlimited'}>
            {[12, 6, 3, 1].map((m) => <option key={m} value={m}>{m} oy</option>)}
          </select>
        </label>
      </div>
      <label className="ma-field"><span className="ma-label">Izoh (majburiy)</span>
        <textarea rows={2} className={`ma-textarea${noteErr ? ' is-error' : ''}`} value={note} maxLength={300} onChange={(ev) => setNote(ev.target.value)} placeholder="Masalan: #T-1041 bo'yicha kompensatsiya" />
        {noteErr && <span className="ma-field-error s-sm" role="alert">Izoh kiritilishi shart</span>}
      </label>
      <div style={{ padding: '14px 16px', borderRadius: 14, background: 'var(--okBg)', display: 'flex', flexDirection: 'column', gap: 2 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--ok)' }}>Yangi balans</span>
        <b style={{ fontSize: 17, color: 'var(--ink)' }}>{preview}</b>
      </div>
      {err && <span className="ma-field-error" role="alert">{err}</span>}
    </Dialog>
  );
}

function RevokeDialog({ open, d, onClose, onDone }: { open: boolean; d: LearnerDetailRes; onClose: () => void; onDone: () => void }) {
  const toast = useToast();
  const firstWith = EXAMS.find((e) => credFor(d, e).fullMocks > 0) ?? EXAMS.find((e) => credFor(d, e).sections > 0) ?? 'ielts';
  const [exam, setExam] = useState<AdminExam>(firstWith);
  const [kind, setKind] = useState<'full' | 'section'>('full');
  const [n, setN] = useState(1);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const idem = useMemo(() => (open ? newIdemKey() : ''), [open]);
  const c = credFor(d, exam);
  const have = kind === 'full' ? c.fullMocks : c.sections;
  useEffect(() => { if (open) { setExam(firstWith); setNote(''); setErr(null); } }, [open, firstWith]);
  useEffect(() => { setN(Math.max(1, have)); }, [exam, kind, have]);
  const e = examLabel(exam);
  const unit = kind === 'full' ? 'full kredit' : "bo'lim krediti";
  const after = have - n;

  async function submit() {
    if (note.trim().length < 1) { setErr('Sababni yozing.'); return; }
    setBusy(true);
    setErr(null);
    try {
      const r = await adminApi.revoke(d.learner.id, { exam, kind, qty: n, reason: note.trim() }, idem);
      toast({ tone: 'ok', title: `${r.revoked} ta ${e} ${unit} qaytarib olindi` });
      onDone();
    } catch (e2) {
      setErr(errText(e2));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onClose={onClose} busy={busy} gap={14} title="Kredit qaytarib olish"
      actions={<>
        <Button variant="secondary" size={42} style={{ color: 'var(--ink2)' }} onClick={onClose} disabled={busy}>Bekor qilish</Button>
        <Button variant="danger-solid" size={42} onClick={submit} loading={busy} disabled={have < 1}>Qaytarib olish</Button>
      </>}>
      <Seg label="Imtihon" value={exam} onPick={setExam} options={EXAMS.map((x) => ({ v: x, t: examLabel(x) }))} />
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 180 }}><Seg label="Turi" value={kind} onPick={setKind} options={[{ v: 'full', t: 'Full mock' }, { v: 'section', t: "Bo'lim" }]} /></div>
        <div className="ma-stepper" role="group" aria-label="Miqdor">
          <button type="button" onClick={() => setN((x) => Math.max(1, x - 1))} disabled={n <= 1} aria-label="Kamaytirish">−</button>
          <output aria-live="polite">{have < 1 ? 0 : n}</output>
          <button type="button" onClick={() => setN((x) => Math.min(have, x + 1))} disabled={n >= have} aria-label="Ko'paytirish">+</button>
        </div>
      </div>
      <span className="ma-dialog-effect">{have < 1 ? `${e} ${unit} yo'q` : `${n} ta ${e} ${unit} qaytarib olinadi`}</span>
      {have > 0 && (
        <span style={{ fontSize: 13, color: 'var(--ink2)', lineHeight: 1.5 }}>
          Balans {e} {have} → {after} {kind === 'full' ? 'full' : "bo'lim"} bo&apos;ladi.{after === 0 && kind === 'full' && !(c.unlimitedUntil && Date.parse(c.unlimitedUntil) > Date.now()) ? ` O'quvchi ${e} full mock boshlay olmaydi.` : ''} Avval ishlatilgan kreditlar o&apos;zgarmaydi.
        </span>
      )}
      <textarea rows={2} className={`ma-textarea${err ? ' is-error' : ''}`} placeholder="Sabab (majburiy)" value={note} maxLength={300} onChange={(ev) => { setNote(ev.target.value); setErr(null); }} aria-label="Sabab (majburiy)" />
      {err && <span className="ma-field-error" role="alert">{err}</span>}
    </Dialog>
  );
}

function BlockDialog({ open, d, onClose, onDone }: { open: boolean; d: LearnerDetailRes; onClose: () => void; onDone: () => void }) {
  const toast = useToast();
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  useEffect(() => { if (open) { setNote(''); setErr(null); } }, [open]);
  const bal = d.adminCredits.filter((c) => c.fullMocks || c.sections).map((c) => `${examLabel(c.exam)} ${c.fullMocks} full · ${c.sections} bo'lim`).join(', ') || '0';
  async function submit() {
    if (!note.trim()) { setErr('Sababni yozing.'); return; }
    setBusy(true);
    try {
      const r = await adminApi.lock(d.learner.id, note.trim());
      toast({ tone: 'ok', title: "O'quvchi bloklandi", text: r.cancelledAttempts ? `${r.cancelledAttempts} ta davom etayotgan urinish yopildi.` : undefined });
      onDone();
    } catch (e2) {
      setErr(errText(e2));
    } finally {
      setBusy(false);
    }
  }
  return (
    <Dialog open={open} onClose={onClose} busy={busy} gap={14} title="O'quvchini bloklash"
      actions={<>
        <Button variant="secondary" size={42} style={{ color: 'var(--ink2)' }} onClick={onClose} disabled={busy}>Bekor qilish</Button>
        <Button variant="danger-solid" size={42} onClick={submit} loading={busy}>Bloklash</Button>
      </>}>
      <span className="ma-dialog-effect">Hisobga kirish va testlar to&apos;xtatiladi</span>
      <span style={{ fontSize: 13, color: 'var(--ink2)', lineHeight: 1.5 }}>Balans saqlanadi ({bal}). Davom etayotgan urinish yopiladi. Blokdan chiqarish mumkin.</span>
      <textarea rows={2} className={`ma-textarea${err ? ' is-error' : ''}`} placeholder="Sabab (majburiy)" value={note} maxLength={300} onChange={(ev) => { setNote(ev.target.value); setErr(null); }} aria-label="Sabab (majburiy)" />
      {err && <span className="ma-field-error" role="alert">{err}</span>}
    </Dialog>
  );
}
