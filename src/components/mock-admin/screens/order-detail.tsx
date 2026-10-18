'use client';
/**
 * Admin Order Detail.dc.html — O2 (detail), O3 (receipt file, Bearer → blob), O4 (confirm with the
 * received amount; mismatch blocks the button), O5 (fail dialog), O6 (refund dialog, numbers from
 * refundPreview). Variants: manual pending, mismatch, success, refund dialog, Paddle (read-only).
 */
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/admin-mock/api';
import { AdminApiError } from '@/lib/admin-mock/http';
import { errText, loadErrText, isNotFound } from '@/lib/admin-mock/errors';
import { amount, dateTime, dotDate, examLabel, flag, money, moneyList, productName, toMajor, toMinor, groupNum } from '@/lib/admin-mock/format';
import type { AdminExamCredits, MarkPaidRes, OrderDetailRes, TimelineItem, TransferClaim } from '@/lib/admin-mock/types';
import { AdminPage } from '../shell/admin-page';
import { ROOT_CRUMB } from '../shell/nav';
import { Button } from '../ui/button';
import { Dialog } from '../ui/dialog';
import { ErrorState, NotFoundState } from '../ui/state';
import { Skeleton } from '../ui/table';
import { useToast } from '../ui/toast';
import { methodOf, statusOf } from './order-shared';
import { creditResult } from './dashboard';

const CRUMBS = [ROOT_CRUMB, { label: "To'lovlar", href: '/orders' }];
const card = { borderRadius: 24, boxShadow: 'var(--raise)', padding: 20, display: 'flex', flexDirection: 'column', minWidth: 0 } as const;
const h3 = { margin: 0, fontSize: 15, fontWeight: 800 } as const;
const paperBox = { padding: '12px 14px', borderRadius: 14, background: 'var(--paper)', display: 'flex', flexDirection: 'column', gap: 2 } as const;
const lab = { fontSize: 11, fontWeight: 700, color: 'var(--mut)' } as const;
const SECTION_NAME: Record<string, string> = { listening: 'Listening', reading: 'Reading', writing: 'Writing', speaking: 'Speaking', math: 'Math', rw: 'Reading & Writing' };

/** "Azizbek K." */
export const shortName = (n: string | null | undefined) => {
  if (!n) return '—';
  const [a, b] = n.trim().split(/\s+/);
  return b ? `${a} ${b[0]}.` : a;
};
/** "dilnoza.r…" */
const shortEmail = (e: string | null) => (e && e.length > 10 ? `${e.slice(0, 9)}…` : e ?? '—');
export const initialsOf = (name: string | null | undefined, email?: string | null) => {
  const src = (name || email || '?').trim();
  const w = src.split(/[\s._@-]+/).filter(Boolean);
  return ((w[0]?.[0] ?? '?') + (w[1]?.[0] ?? '')).toUpperCase();
};

export function OrderDetailScreen({ id }: { id: string }) {
  const q = useQuery({ queryKey: ['am', 'order', id], queryFn: () => adminApi.order(id), retry: (n, e) => !isNotFound(e) && n < 1 });
  const [paid, setPaid] = useState<MarkPaidRes | null>(null);
  const title = q.data?.order.reference ?? (q.isError ? 'Buyurtma' : '…');
  return (
    <AdminPage active="orders" title={title} crumbs={CRUMBS}>
      {isNotFound(q.error) ? (
        <NotFoundState title="Buyurtma topilmadi" text="Bu ID bo'yicha buyurtma yo'q." backHref="/orders" backLabel="← Ro'yxatga qaytish" />
      ) : q.isError && !q.data ? (
        <ErrorState title="Ma'lumotlarni yuklab bo'lmadi" text={loadErrText(q.error, "Internet aloqasini tekshiring yoki qayta urinib ko'ring.")} onRetry={() => q.refetch()} retrying={q.isFetching} />
      ) : !q.data ? (
        <><Skeleton height={110} /><div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,380px),1fr))', gap: 20 }}><Skeleton height={420} /><Skeleton height={320} /></div></>
      ) : (
        <Detail d={q.data} paid={paid} onPaid={setPaid} refetch={() => q.refetch()} />
      )}
    </AdminPage>
  );
}

function Detail({ d, paid, onPaid, refetch }: { d: OrderDetailRes; paid: MarkPaidRes | null; onPaid: (r: MarkPaidRes) => void; refetch: () => void }) {
  const o = d.order;
  const s = statusOf(o.status);
  const manual = o.provider === 'manual';
  const paddle = o.provider === 'paddle';
  return (
    <>
      <section style={{ ...card, padding: 'clamp(16px,2vw,24px)', flexDirection: 'row', flexWrap: 'wrap', gap: '20px 32px', alignItems: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1, minWidth: 220 }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em' }}>{o.reference}</span>
            <span className={`ma-chip t-${s.tone}`}>{s.t}</span>
          </div>
          <span style={{ fontSize: 13, color: 'var(--ink2)', fontWeight: 600 }}>{methodOf(o)} · Kvitansiya <span className="ma-mono" style={{ fontSize: 13 }}>{o.receiptNo ?? '—'}</span></span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--mut)' }}>Summa</span>
          <span style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>{money(o.quote.total)}</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,auto)', gap: '4px 24px', fontSize: 12 }}>
          <span style={{ color: 'var(--mut)', fontWeight: 700 }}>Yaratildi</span><span style={{ color: 'var(--mut)', fontWeight: 700 }}>To&apos;landi</span><span style={{ color: 'var(--mut)', fontWeight: 700 }}>Muddati</span>
          <b style={{ fontWeight: 700 }}>{dateTime(o.createdAt)}</b>
          <b style={{ fontWeight: 700 }}>{o.paidAt ? dateTime(o.paidAt) : '—'}</b>
          <b style={{ fontWeight: 700 }}>{o.status === 'PENDING' && o.expiresAt ? dateTime(o.expiresAt) : '—'}</b>
        </div>
      </section>

      {paid && <SuccessBanner r={paid} d={d} />}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,380px),1fr))', gap: 20, alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, minWidth: 0 }}>
          <Grants d={d} />
          {manual && <ManualSection d={d} paid={paid} onPaid={onPaid} refetch={refetch} />}
          {paddle && <PaddleSection d={d} />}
          <Timeline items={d.timeline} />
        </div>
        <LearnerCard d={d} />
      </div>
    </>
  );
}

function SuccessBanner({ r, d }: { r: MarkPaidRes; d: OrderDetailRes }) {
  const e = examLabel(r.credits.exam);
  const a = r.credits.after, b = r.credits.before;
  const big = a.unlimitedUntil && a.unlimitedUntil !== b.unlimitedUntil
    ? `${e}: cheksiz · ${dotDate(a.unlimitedUntil)} gacha`
    : a.fullMocks !== b.fullMocks ? `${e}: ${b.fullMocks} → ${a.fullMocks} full mock` : `${e}: ${b.sections} → ${a.sections} bo'lim`;
  const exp = r.lots[0]?.expiresAt;
  const email = d.learnerCard?.email ?? d.learner?.email;
  const what = a.fullMocks > 0 || a.unlimitedUntil ? 'full mock' : "bo'lim";
  return (
    <section style={{ borderRadius: 24, padding: 24, background: 'var(--okBg)', display: 'flex', gap: 18, alignItems: 'flex-start', flexWrap: 'wrap' }} role="status">
      <div style={{ width: 44, height: 44, borderRadius: 14, background: 'var(--ok)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 800, flexShrink: 0 }} aria-hidden="true">✓</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1, minWidth: 240 }}>
        <b style={{ fontSize: 17, color: 'var(--ok)' }}>To&apos;lov tasdiqlandi va balansga qo&apos;shildi</b>
        <span style={{ fontSize: 22, fontWeight: 800, color: 'var(--ink)' }}>{big}</span>
        <span style={{ fontSize: 13, color: 'var(--ink2)', fontWeight: 600 }}>
          Endi o&apos;quvchi {what} boshlay oladi.{exp ? ` Kreditlar ${dotDate(exp)} gacha amal qiladi.` : ''}
          {r.receiptMailQueued && email ? ` Kvitansiya emaili ${email} manziliga yuborildi.` : ''}
        </span>
      </div>
      <Link href={`/learners/${d.order.learnerId}`} className="ma-state-link" style={{ marginTop: 0 }}>Profilni ochish</Link>
    </section>
  );
}

function Grants({ d }: { d: OrderDetailRes }) {
  const g = d.grants;
  const e = examLabel(g.exam);
  const p = d.order.quote.product;
  const [title, badge] = g.unlimitedDays > 0
    ? [`${e} cheksiz · ${g.unlimitedDays} kun`, '∞']
    : g.fullMocks > 0
      ? [`${e} full kredit × ${g.fullMocks}`, `×${g.fullMocks}`]
      : [`${e} bo'lim krediti × ${g.sections}`, `×${g.sections}`];
  const sub = [g.validityMonths ? `${g.validityMonths} oy amal qiladi` : null, `${productName(p)} paketi`].filter(Boolean).join(' · ');
  return (
    <section style={{ ...card, gap: 12 }}>
      <h3 style={h3}>Bu buyurtma nima beradi</h3>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 16, borderRadius: 16, boxShadow: 'var(--inset)' }}>
        <span style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--grad)', color: '#fff', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flexShrink: 0 }}>{badge}</span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}><b style={{ fontSize: 15 }}>{title}</b><span style={{ fontSize: 13, color: 'var(--ink2)', fontWeight: 600 }}>{sub}</span></div>
      </div>
    </section>
  );
}

const CHANNEL: Record<string, string> = { card_transfer: 'Qabul kartasi', telegram: 'Kanal', click_invoice: 'Kanal' };
const channelValue = (c: { type: string; valueMasked: string }) =>
  c.type === 'telegram' ? `Telegram · ${c.valueMasked}` : c.type === 'click_invoice' ? `Click · ${c.valueMasked}` : c.valueMasked;

function ManualSection({ d, paid, onPaid, refetch }: { d: OrderDetailRes; paid: MarkPaidRes | null; onPaid: (r: MarkPaidRes) => void; refetch: () => void }) {
  const qc = useQueryClient();
  const toast = useToast();
  const o = d.order;
  const cur = o.quote.total.currency;
  const expected = o.quote.total.amountMinor;
  const fmtInput = (minor: number) => (cur === 'UZS' ? groupNum(toMajor(cur, minor)) : toMajor(cur, minor).toFixed(2));
  const [got, setGot] = useState(() => fmtInput(expected));
  const [serverExpected, setServerExpected] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [dialog, setDialog] = useState<'fail' | 'refund' | null>(null);
  const gotMinor = toMinor(cur, got);
  const want = serverExpected ?? expected;
  const mismatch = gotMinor !== want;
  const suffix = cur === 'UZS' ? "so'm" : cur === 'USD' ? '$' : cur === 'EUR' ? '€' : cur;
  const channels = o.payInstructions?.channels ?? [];
  const card0 = channels.find((c) => c.type === 'card_transfer');
  const chan = channels.find((c) => c.type !== 'card_transfer');

  async function confirm() {
    if (mismatch || busy || gotMinor === null) return;
    setBusy(true);
    try {
      const r = await adminApi.markPaid(o.id, { amountMinor: gotMinor });
      onPaid(r);
      toast({ tone: 'ok', title: "To'lov tasdiqlandi", text: `${o.reference} · ${creditResult(r)}.${r.receiptMailQueued ? ' Kvitansiya emaili yuborildi.' : ''}` });
      void qc.invalidateQueries({ queryKey: ['am', 'badges'] });
      void qc.invalidateQueries({ queryKey: ['am', 'orders'] });
      refetch();
    } catch (e) {
      if (e instanceof AdminApiError && e.code === 'AMOUNT_MISMATCH' && typeof e.data.expected === 'number') setServerExpected(e.data.expected);
      else toast({ tone: 'err', title: 'Saqlanmadi', text: errText(e) });
      if (e instanceof AdminApiError && e.code === 'ORDER_NOT_PENDING') refetch();
    } finally {
      setBusy(false);
    }
  }

  const claims = d.claims;
  return (
    <section style={{ ...card, gap: 16 }}>
      <h3 style={h3}>Mahalliy o&apos;tkazma</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 10 }}>
        <div style={paperBox}><span style={lab}>{CHANNEL.card_transfer}</span><b className="ma-mono" style={{ fontSize: 14 }}>{card0?.valueMasked ?? '—'}</b></div>
        <div style={paperBox}><span style={lab}>Kanal</span><b style={{ fontSize: 14 }}>{chan ? channelValue(chan) : '—'}</b></div>
      </div>
      {claims.length === 0 ? (
        <div style={{ ...paperBox, padding: 14, fontSize: 13, color: 'var(--ink2)', fontWeight: 600 }}>O&apos;quvchi hali izoh yoki chek qoldirmagan.</div>
      ) : claims.map((c) => <ClaimRow key={c.id} c={c} />)}

      {d.can.markPaid && !paid && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink2)' }}>Tushgan summa</span>
            <div style={{ display: 'flex', alignItems: 'center', height: 50, padding: '0 16px', borderRadius: 14, boxShadow: mismatch ? 'var(--inset),0 0 0 2px var(--err)' : 'var(--inset)' }}>
              <input value={got} onChange={(e) => setGot(e.target.value)} inputMode="decimal" aria-invalid={mismatch || undefined} aria-describedby={mismatch ? 'ma-amt-err' : undefined}
                style={{ flex: 1, minWidth: 0, border: 0, background: 'transparent', outline: 'none', color: 'var(--ink)', fontSize: 18, fontWeight: 800 }} />
              <span style={{ fontWeight: 700, color: 'var(--mut)' }}>{suffix}</span>
            </div>
            {mismatch && <span id="ma-amt-err" style={{ fontSize: 13, fontWeight: 700, color: 'var(--err)' }}>Summa mos emas: kutilgan {amount(cur, want)}</span>}
          </label>
          <button type="button" onClick={confirm} disabled={mismatch || busy} aria-busy={busy || undefined}
            style={{ height: 52, border: 0, borderRadius: 14, background: mismatch ? 'var(--mut)' : 'var(--grad)', color: '#fff', fontWeight: 800, fontSize: 15, cursor: mismatch ? 'not-allowed' : busy ? 'progress' : 'pointer', boxShadow: '0 10px 22px -10px rgba(46,107,230,.9)', opacity: busy ? 0.85 : 1 }}>
            Tasdiqlash va balansga qo&apos;shish
          </button>
          {d.can.markFailed && (
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <Button variant="danger" size={40} onClick={() => setDialog('fail')}>Muvaffaqiyatsiz deb belgilash</Button>
            </div>
          )}
        </div>
      )}
      {(o.status === 'PAID' || paid) && (
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: 13, color: 'var(--ink2)', fontWeight: 600, flex: 1 }}>
            Tushgan summa: <b style={{ color: 'var(--ink)' }}>{money(o.receivedAmount ?? o.quote.total)}</b>
            {o.decidedBy ? ` · ${shortName(o.decidedBy.fullName)} tasdiqladi` : ''}
          </span>
          {d.can.refund && d.refundPreview && <Button variant="danger" size={40} onClick={() => setDialog('refund')}>Qaytarish (refund)</Button>}
        </div>
      )}
      <ReasonDialog kind={dialog} d={d} onClose={() => setDialog(null)} onDone={() => { setDialog(null); refetch(); void qc.invalidateQueries({ queryKey: ['am', 'orders'] }); void qc.invalidateQueries({ queryKey: ['am', 'badges'] }); }} />
    </section>
  );
}

function ClaimRow({ c }: { c: TransferClaim }) {
  const [url, setUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const [zoom, setZoom] = useState(false);
  const image = !!c.file && c.file.mime.startsWith('image/');
  useEffect(() => {
    if (!c.file) return;
    let u: string | null = null;
    let alive = true;
    adminApi.claimFile(c.file.url).then(
      ({ blob }) => { if (!alive) return; u = URL.createObjectURL(blob); setUrl(u); },
      () => alive && setFailed(true),
    );
    return () => { alive = false; if (u) URL.revokeObjectURL(u); };
  }, [c.file]);
  const name = c.file ? (c.file.mime === 'application/pdf' ? 'chek.pdf' : 'chek.jpg') : null;
  return (
    <div style={{ display: 'flex', gap: 12, padding: 14, borderRadius: 14, background: 'var(--paper)', flexWrap: 'wrap' }}>
      {c.file && (
        <button type="button" onClick={() => (image ? setZoom(true) : url && window.open(url, '_blank', 'noopener'))} disabled={!url} aria-label="Chekni ochish"
          style={{ width: 88, height: 112, padding: 0, border: 0, borderRadius: 10, overflow: 'hidden', flexShrink: 0, background: 'repeating-linear-gradient(135deg,var(--hover) 0 8px,var(--paper) 8px 16px)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: 'var(--mut)', cursor: url ? 'zoom-in' : 'default' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {url && image ? <img src={url} alt="Chek" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : failed ? 'Yuklanmadi' : name}
        </button>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1, minWidth: 180 }}>
        <span style={lab}>O&apos;quvchi izohi · {dateTime(c.createdAt)}</span>
        <span style={{ fontSize: 14, lineHeight: 1.5 }}>{c.note ? `"${c.note}"` : '—'}</span>
        {c.file && url && (image
          ? <button type="button" className="ma-linkbtn" onClick={() => setZoom(true)}>Skrinshotni kattalashtirish</button>
          : <a href={url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, fontWeight: 700 }}>Faylni ochish</a>)}
      </div>
      {zoom && url && (
        <Dialog open onClose={() => setZoom(false)} title="Chek" width={600}
          actions={<Button variant="secondary" size={42} onClick={() => setZoom(false)}>Yopish</Button>}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt="Chek" style={{ width: '100%', maxHeight: '70vh', objectFit: 'contain', borderRadius: 12, background: 'var(--paper)' }} />
        </Dialog>
      )}
    </div>
  );
}

function ReasonDialog({ kind, d, onClose, onDone }: { kind: 'fail' | 'refund' | null; d: OrderDetailRes; onClose: () => void; onDone: () => void }) {
  const toast = useToast();
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  useEffect(() => { if (kind) { setNote(''); setErr(null); } }, [kind]);
  const rp = d.refundPreview;
  const e = examLabel(d.grants.exam);
  const unit = d.grants.fullMocks > 0 ? 'full kredit' : "bo'lim krediti";
  const cfg = kind === 'refund'
    ? {
        title: 'Buyurtmani qaytarish',
        body: `${rp?.willRevoke ?? 0} ta ${e} ${unit} qaytarib olinadi. ${rp?.used ?? 0} tasi allaqachon ishlatilgan va qaytarilmaydi. O'quvchiga pulni o'zingiz qaytarasiz; holat "Qaytarilgan"ga o'tadi.`,
        ph: "Masalan: o'quvchi talabi, ikki marta to'lagan",
        cta: `${rp?.willRevoke ?? 0} kreditni qaytarib olish`,
      }
    : {
        title: 'Muvaffaqiyatsiz deb belgilash',
        body: "Buyurtma yopiladi, balansga hech narsa qo'shilmaydi. O'quvchiga \"to'lov topilmadi\" emaili yuboriladi.",
        ph: 'Masalan: kartaga pul tushmadi',
        cta: 'Muvaffaqiyatsiz deb belgilash',
      };

  async function submit() {
    const n = note.trim();
    if (n.length < 3) { setErr('Sababni yozing (kamida 3 belgi).'); return; }
    setBusy(true);
    try {
      if (kind === 'refund') {
        const r = await adminApi.refund(d.order.id, n);
        toast({ tone: 'ok', title: 'Buyurtma qaytarildi', text: `${d.order.reference} · ${r.revoked} kredit qaytarib olindi.` });
      } else {
        const r = await adminApi.markFailed(d.order.id, { failureCode: 'DECLINED', note: n });
        toast({ tone: 'ok', title: 'Muvaffaqiyatsiz deb belgilandi', text: `${d.order.reference}${r.mailQueued ? " · O'quvchiga email yuborildi." : ''}` });
      }
      onDone();
    } catch (e2) {
      setErr(errText(e2));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={!!kind} onClose={onClose} busy={busy} title={cfg.title} width={460}
      actions={<>
        <Button variant="secondary" size={42} style={{ color: 'var(--ink2)' }} onClick={onClose} disabled={busy}>Bekor qilish</Button>
        <Button variant="danger-solid" size={42} onClick={submit} loading={busy}>{cfg.cta}</Button>
      </>}>
      {kind === 'refund' && rp && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
          <div style={{ padding: 12, borderRadius: 14, boxShadow: 'var(--inset)', display: 'flex', flexDirection: 'column', gap: 2 }}><span style={lab}>Berilgan</span><b style={{ fontSize: 20 }}>{rp.granted}</b></div>
          <div style={{ padding: 12, borderRadius: 14, boxShadow: 'var(--inset)', display: 'flex', flexDirection: 'column', gap: 2 }}><span style={lab}>Ishlatilgan</span><b style={{ fontSize: 20 }}>{rp.used}</b></div>
          <div style={{ padding: 12, borderRadius: 14, background: 'var(--errBg)', display: 'flex', flexDirection: 'column', gap: 2 }}><span style={{ ...lab, color: 'var(--err)' }}>Qaytariladi</span><b style={{ fontSize: 20, color: 'var(--err)' }}>{rp.willRevoke}</b></div>
        </div>
      )}
      <span style={{ fontSize: 14, color: 'var(--ink2)', lineHeight: 1.5 }}>{cfg.body}</span>
      <label style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <span className="ma-label">Sabab (majburiy)</span>
        <textarea rows={3} className={`ma-textarea${err ? ' is-error' : ''}`} placeholder={cfg.ph} value={note} maxLength={500} onChange={(ev) => { setNote(ev.target.value); setErr(null); }} />
        {err && <span className="ma-field-error" role="alert">{err}</span>}
      </label>
    </Dialog>
  );
}

function PaddleSection({ d }: { d: OrderDetailRes }) {
  const txn = d.paddle?.transactionId ?? d.order.providerRef;
  const events = d.paddle?.events ?? [];
  return (
    <section style={{ ...card, gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <h3 style={{ ...h3, flex: 1 }}>Paddle to&apos;lovi</h3>
        <span className="ma-chip t-neutral" style={{ padding: '3px 9px' }}>Faqat o&apos;qish</span>
      </div>
      <div style={paperBox}><span style={lab}>Transaction ID</span><b className="ma-mono" style={{ fontSize: 13, wordBreak: 'break-all' }}>{txn ?? '—'}</b></div>
      <div style={{ padding: '12px 14px', borderRadius: 14, boxShadow: 'var(--inset)', fontSize: 13, color: 'var(--ink2)', lineHeight: 1.5 }}>
        Karta to&apos;lovlari Paddle webhook orqali avtomatik tasdiqlanadi va balans o&apos;zi to&apos;ldiriladi. Qo&apos;lda tasdiqlash tugmasi yo&apos;q — pul tushmagan bo&apos;lsa ham kredit berib yuborilishining oldini olish uchun. Qaytarish faqat Paddle panelidan.
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {events.map((h, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '110px minmax(0,1fr) auto', gap: 10, padding: '10px 0', borderBottom: '1px solid var(--line)', fontSize: 13, alignItems: 'center' }}>
            <span style={{ color: 'var(--mut)', fontWeight: 600 }}>{new Date(h.at).toLocaleTimeString('en-GB', { timeZone: 'Asia/Tashkent', hourCycle: 'h23' })}</span>
            <span className="ma-mono" style={{ fontWeight: 600 }}>{h.eventType}</span>
            <span className="ma-chip s-sm t-ok">{h.httpStatus}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

const TL_COLOR: Record<string, string> = {
  created: 'var(--blue)', transfer_claimed: 'var(--warn)', marked_paid: 'var(--ok)', paddle_paid: 'var(--ok)', marked_failed: 'var(--err)', paddle_failed: 'var(--err)',
  refunded: 'var(--err)', paddle_refunded: 'var(--err)', amount_mismatch: 'var(--err)', expired: 'var(--mut)', cancelled_by_learner: 'var(--mut)',
};

function tlText(t: TimelineItem): string {
  const m = t.meta as Record<string, unknown>;
  switch (t.kind) {
    case 'created': return 'Buyurtma yaratildi';
    case 'transfer_claimed': return m.hasFile ? "O'quvchi o'tkazma qildim deb belgiladi, chek biriktirdi" : "O'quvchi o'tkazma qildim deb belgiladi";
    case 'marked_paid': {
      const g = m.granted as { fullMocks?: number; sections?: number; unlimitedDays?: number; exam?: string } | undefined;
      const e = examLabel((g?.exam as string) ?? (m.exam as string) ?? '');
      const part = g?.unlimitedDays ? `${e} cheksiz ${g.unlimitedDays} kun` : g?.fullMocks ? `${e} +${g.fullMocks} full` : g?.sections ? `${e} +${g.sections} bo'lim` : null;
      return ['Tasdiqlandi', part, m.receiptNo ? 'kvitansiya yuborildi' : null].filter(Boolean).join(' · ');
    }
    case 'marked_failed': return `Muvaffaqiyatsiz deb belgilandi${m.note ? ` · "${m.note}"` : ''}`;
    case 'refunded': return `Qaytarildi · ${m.revoked ?? 0} kredit qaytarib olindi${m.note ? ` · "${m.note}"` : ''}`;
    case 'expired': return "Muddati o'tdi — buyurtma bekor bo'ldi";
    case 'cancelled_by_learner': return "O'quvchi buyurtmani bekor qildi";
    case 'paddle_paid': return "Paddle orqali to'landi, balansga avtomatik qo'shildi";
    case 'paddle_failed': return "Paddle to'lovi muvaffaqiyatsiz";
    case 'paddle_refunded': return 'Paddle orqali qaytarildi';
    case 'amount_mismatch': return 'Summa mos emas';
    default: return 'Hodisa';
  }
}

function tlWho(t: TimelineItem) {
  const who = t.actor.type === 'system' ? 'Tizim' : t.actor.type === 'provider' ? 'Paddle' : t.actor.type === 'learner' ? shortEmail(t.actor.name) : t.actor.name ?? '—';
  const when = Date.now() - Date.parse(t.at) < 60_000 ? 'hozir' : dateTime(t.at);
  return `${who} · ${when}`;
}

function Timeline({ items }: { items: TimelineItem[] }) {
  return (
    <section style={{ ...card, gap: 12 }}>
      <h3 style={h3}>Faollik</h3>
      {items.length === 0 && <span style={{ fontSize: 13, color: 'var(--ink2)' }}>—</span>}
      {items.map((t, i) => (
        <div key={i} style={{ display: 'flex', gap: 12 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: TL_COLOR[t.kind] ?? 'var(--blue)', marginTop: 5 }} />
            <span style={{ flex: 1, width: 2, background: 'var(--line)', marginTop: 4 }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, paddingBottom: 12 }}>
            <b style={{ fontSize: 13 }}>{tlText(t)}</b>
            <span style={{ fontSize: 12, color: 'var(--mut)', fontWeight: 600 }}>{tlWho(t)}</span>
          </div>
        </div>
      ))}
    </section>
  );
}

export function balanceText(c: Pick<AdminExamCredits, 'fullMocks' | 'sections' | 'unlimitedUntil'>, full = true) {
  if (c.unlimitedUntil && Date.parse(c.unlimitedUntil) > Date.now()) return `cheksiz · ${dotDate(c.unlimitedUntil)} gacha`;
  if (!c.fullMocks && !c.sections) return full ? "0 full · 0 bo'lim" : '0';
  return `${c.fullMocks} full · ${c.sections} bo'lim`;
}

export function blockedNote(c: AdminExamCredits): string | null {
  if (c.canStartFull || !c.blockedReason) return null;
  const e = examLabel(c.exam);
  if (c.blockedReason === 'NO_CREDIT') {
    const free = c.freeSection.used ? ` Bepul ${SECTION_NAME[c.freeSection.sectionKey ?? ''] ?? ''} bo'limidan foydalangan.`.replace('  ', ' ') : '';
    return `Full mock boshlay olmaydi — ${e} balans 0.${free}`;
  }
  if (c.blockedReason === 'NO_FRESH_TEST') return `Full mock boshlay olmaydi — ${e} bo'yicha yangi test qolmagan.`;
  return `Full mock boshlay olmaydi — ${e} saytda "Tez kunda".`;
}

function LearnerCard({ d }: { d: OrderDetailRes }) {
  const l = d.learnerCard;
  const exam = d.grants.exam;
  const credits = useMemo(() => l?.credits ?? [], [l]);
  const own = credits.find((c) => c.exam === exam);
  if (!l) {
    return (
      <section style={{ ...card, gap: 14 }}>
        <b style={{ fontSize: 15 }}>O&apos;quvchi</b>
        <span style={{ fontSize: 13, color: 'var(--ink2)' }}>O&apos;quvchi hisobi o&apos;chirilgan.</span>
      </section>
    );
  }
  const note = own ? blockedNote(own) : null;
  return (
    <section style={{ ...card, gap: 14 }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--hover)', color: 'var(--blue)', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }} aria-hidden="true">{initialsOf(l.displayName, l.email)}</div>
        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1 }}>
          <b style={{ fontSize: 15 }}>{l.displayName ?? '—'}</b>
          <span title={l.email ?? ''} style={{ fontSize: 13, color: 'var(--ink2)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{flag(l.country)} {l.email ?? '—'}</span>
        </div>
        <Link href={`/learners/${l.id}`} style={{ fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap' }}>Profil →</Link>
      </div>
      <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--mut)' }}>Joriy balans</span>
      {credits.map((c) => {
        const has = c.fullMocks > 0 || c.sections > 0 || !!c.unlimitedUntil;
        return (
          <div key={c.exam} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', borderRadius: 14, boxShadow: 'var(--inset)' }}>
            <b style={{ fontSize: 14 }}>{examLabel(c.exam)}</b>
            <span style={{ fontSize: 13, fontWeight: 700, color: has ? 'var(--ok)' : 'var(--mut)' }}>{balanceText(c, c.exam === exam)}</span>
          </div>
        );
      })}
      {note && <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--warn)', padding: '10px 12px', borderRadius: 12, background: 'var(--warnBg)' }}>{note}</span>}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: 12 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}><span style={{ color: 'var(--mut)', fontWeight: 700 }}>Jami to&apos;lov</span><b style={{ fontSize: 14 }}>{moneyList(l.paidTotal)}</b></div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}><span style={{ color: 'var(--mut)', fontWeight: 700 }}>Maqsad</span><b style={{ fontSize: 14 }}>{l.goal ? `${examLabel(l.goal.exam)}${l.goal.target ? ` ${l.goal.target.toFixed(l.goal.exam === 'ielts' ? 1 : 0)}` : ''}${l.goal.examDate ? ` · ${dotDate(l.goal.examDate)}` : ''}` : '—'}</b></div>
      </div>
    </section>
  );
}
