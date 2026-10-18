'use client';
/** Admin Prices.dc.html — P1 products per exam, P2 price change dialog (optimistic lock), P3 active toggle. */
import { useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/admin-mock/api';
import { AdminApiError, newIdemKey } from '@/lib/admin-mock/http';
import { errText } from '@/lib/admin-mock/errors';
import { amount, examLabel, groupNum, toMajor, toMinor } from '@/lib/admin-mock/format';
import type { AdminExam, ProductItem } from '@/lib/admin-mock/types';
import { Button } from '../ui/button';
import { Dialog } from '../ui/dialog';
import { ErrorState } from '../ui/state';
import { SkeletonRows } from '../ui/table';
import { useToast } from '../ui/toast';
import { useUrlState } from './hooks';

type Cur = 'UZS' | 'USD' | 'EUR';
const CURS: Cur[] = ['UZS', 'USD', 'EUR'];
const RANGE: Record<Cur, [number, number]> = { UZS: [1000, 100_000_000], USD: [50, 1_000_000], EUR: [50, 1_000_000] };
const th = { padding: '14px 10px', borderBottom: '1px solid var(--line)', fontWeight: 700 } as const;
const td = { padding: '12px 10px', borderBottom: '1px solid var(--line)' } as const;
const UNAVAILABLE: Record<string, string> = { INACTIVE: 'Mavjud emas', COMING_SOON: 'Tez kunda', NOT_ENOUGH_TESTS: 'Test yetarli emas' };

export function productTitle(p: Pick<ProductItem, 'kind' | 'qty' | 'grants'>) {
  if (p.kind === 'section') return `Bo'lim ×${p.qty}`;
  if (p.kind === 'unlimited') return `Cheksiz ${p.grants.unlimitedDays || 30} kun`;
  return p.qty === 1 ? 'Full ×1' : `Paket ${p.qty}`;
}
function grantsText(p: ProductItem) {
  const m = p.validityMonths ? ` · ${p.validityMonths} oy` : '';
  if (p.kind === 'unlimited') return `Cheksiz full + bo'lim · ${p.grants.unlimitedDays || 30} kun`;
  if (p.kind === 'section') return `${p.grants.sections || p.qty} ta bo'lim kredit${m}`;
  return `${p.grants.fullMocks || p.qty} ta full kredit${m}`;
}

export function PricesScreen() {
  const toast = useToast();
  const qc = useQueryClient();
  const [f, setF] = useUrlState({ exam: 'ielts' });
  const exam = f.exam as AdminExam;
  const q = useQuery({ queryKey: ['am', 'products', exam], queryFn: () => adminApi.products(exam) });
  const [edit, setEdit] = useState<{ p: ProductItem; cur: Cur } | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const items = useMemo(() => [...(q.data?.items ?? [])].sort((a, b) => a.sortOrder - b.sortOrder), [q.data]);

  async function toggle(p: ProductItem) {
    setBusy(p.sku);
    try {
      await adminApi.setProductActive(p.sku, !p.isActive);
      toast({ tone: 'ok', title: p.isActive ? "Mahsulot o'chirildi" : 'Mahsulot yoqildi', text: `${examLabel(p.exam)} · ${productTitle(p)}` });
      void qc.invalidateQueries({ queryKey: ['am', 'products', exam] });
    } catch (e) {
      toast({ tone: 'err', title: 'Saqlanmadi', text: errText(e) });
    } finally {
      setBusy(null);
    }
  }

  return (
    <>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <div className="ma-tabs" role="tablist" aria-label="Imtihon" style={{ alignSelf: 'auto' }}>
          {(['ielts', 'sat', 'cefr'] as const).map((e) => (
            <button key={e} type="button" role="tab" aria-selected={e === exam} style={{ padding: '0 16px' }} onClick={() => setF({ exam: e })}>{examLabel(e)}</button>
          ))}
        </div>
        <span style={{ fontSize: 13, color: 'var(--ink2)', fontWeight: 600 }}>
          Narx o&apos;zgarishi faqat yangi buyurtmalarga ta&apos;sir qiladi. {q.data?.paddleState === 'not_configured' ? "Paddle sozlanmagan — narxlar faqat bazada." : "Paddle narxlari sinxronlanadi."}
        </span>
      </div>
      {q.isError && !q.data ? (
        <ErrorState flat title="Yuklab bo'lmadi" text={errText(q.error)} onRetry={() => q.refetch()} retrying={q.isFetching} />
      ) : (
        <div style={{ borderRadius: 20, background: 'var(--paper)', overflowX: 'auto' }}>
          <table className="ma-table" style={{ minWidth: 1120 }}>
            <thead>
              <tr style={{ textAlign: 'left', color: 'var(--mut)', fontSize: 12 }}>
                <th style={{ ...th, padding: '14px 10px 14px 16px' }}>Mahsulot (SKU)</th><th style={th}>Beradi</th><th style={th}>UZS</th><th style={th}>USD</th><th style={th}>EUR</th><th style={th}>Paddle price ID</th><th style={{ ...th, padding: '14px 16px 14px 10px' }}>Faol</th>
              </tr>
            </thead>
            <tbody>
              {!q.data && <SkeletonRows cols={7} n={6} />}
              {q.data && items.length === 0 && <tr><td colSpan={7} style={{ padding: '14px 16px', color: 'var(--ink2)' }}>Bu imtihon uchun mahsulot yo&apos;q.</td></tr>}
              {items.map((p) => (
                <tr key={p.sku} style={{ opacity: p.isActive ? 1 : 0.6 }}>
                  <td style={{ ...td, padding: '12px 10px 12px 16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}><b>{productTitle(p)}</b><span className="ma-mono" style={{ fontSize: 11, color: 'var(--mut)' }}>{p.sku}</span></div>
                  </td>
                  <td style={{ ...td, color: 'var(--ink2)', fontWeight: 600 }}>{grantsText(p)}</td>
                  {CURS.map((c) => (
                    <td key={c} style={{ padding: 10, borderBottom: '1px solid var(--line)' }}>
                      <button type="button" className="ma-price-btn" disabled={!p.isActive} onClick={() => setEdit({ p, cur: c })} aria-label={`${productTitle(p)} · ${c} narxini o'zgartirish`}>{amount(c, p.prices[c])}</button>
                    </td>
                  ))}
                  <td style={{ ...td, fontSize: 11, color: 'var(--ink2)' }} className="ma-mono">{p.paddle.priceId ?? 'Mavjud emas'}</td>
                  <td style={{ ...td, padding: '12px 16px 12px 10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <button type="button" role="switch" aria-checked={p.isActive} aria-label={`${productTitle(p)} faol`} className="ma-toggle ma-toggle-sm" disabled={busy === p.sku} onClick={() => toggle(p)}><span /></button>
                      {!p.available && <span className="ma-chip s-sm t-muted">{UNAVAILABLE[p.unavailableReason ?? 'INACTIVE'] ?? 'Mavjud emas'}</span>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <PriceDialog edit={edit} onClose={() => setEdit(null)} onSaved={() => { setEdit(null); void qc.invalidateQueries({ queryKey: ['am', 'products', exam] }); }} />
    </>
  );
}

function PriceDialog({ edit, onClose, onSaved }: { edit: { p: ProductItem; cur: Cur } | null; onClose: () => void; onSaved: () => void }) {
  const toast = useToast();
  const [v, setV] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const idem = useMemo(() => (edit ? newIdemKey() : ''), [edit]);
  const cur = edit?.cur ?? 'UZS';
  const old = edit ? edit.p.prices[cur] : null;
  useEffect(() => {
    if (!edit) return;
    setErr(null);
    setV(old === null ? '' : cur === 'UZS' ? groupNum(toMajor(cur, old)) : toMajor(cur, old).toFixed(2));
  }, [edit, old, cur]);
  const minor = toMinor(cur, v);
  const [lo, hi] = RANGE[cur];
  const bad = minor === null || minor < lo || minor > hi;

  async function save() {
    if (!edit || bad || minor === null) { setErr(`Narx ${amount(cur, lo)} – ${amount(cur, hi)} oralig'ida bo'lsin.`); return; }
    if (minor === old) { onClose(); return; }
    setBusy(true);
    setErr(null);
    try {
      const r = await adminApi.setPrice(edit.p.sku, { currency: cur, amountMinor: minor, expectedAmountMinor: old }, idem);
      if (!r.paddle.synced && r.paddle.reason === 'NOT_CONFIGURED') toast({ tone: 'warn', title: 'Narx saqlandi', text: "Paddle sozlanmagan — narx faqat bazada o'zgardi." });
      else toast({ tone: 'ok', title: 'Narx saqlandi', text: `${examLabel(edit.p.exam)} · ${productTitle(edit.p)} · ${amount(cur, old)} → ${amount(cur, minor)}` });
      onSaved();
    } catch (e) {
      setErr(errText(e));
      if (e instanceof AdminApiError && e.code === 'PRICE_CHANGED') onSaved();
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={!!edit} onClose={onClose} busy={busy} title="Narxni o'zgartirish"
      actions={<>
        <Button variant="secondary" size={42} style={{ color: 'var(--ink2)' }} onClick={onClose} disabled={busy}>Bekor qilish</Button>
        <Button size={42} onClick={save} loading={busy}>Saqlash</Button>
      </>}>
      {edit && (
        <>
          <span style={{ fontSize: 13, color: 'var(--ink2)', fontWeight: 600, marginTop: -6 }}>{examLabel(edit.p.exam)} · {productTitle(edit.p)} · {cur}</span>
          <label className="ma-field">
            <span className="ma-label">Yangi narx</span>
            <input className={`ma-input s-48${err ? ' is-error' : ''}`} style={{ fontSize: 18, fontWeight: 800 }} value={v} onChange={(e) => { setV(e.target.value); setErr(null); }} inputMode="decimal" autoFocus />
            {err && <span className="ma-field-error" role="alert">{err}</span>}
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderRadius: 14, background: 'var(--paper)', flexWrap: 'wrap' }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--mut)', textDecoration: old === null ? 'none' : 'line-through' }}>{amount(cur, old)}</span>
            <span style={{ color: 'var(--mut)' }}>→</span>
            <b style={{ fontSize: 18 }}>{minor === null ? '—' : amount(cur, minor)}</b>
          </div>
          <span style={{ fontSize: 12, color: 'var(--ink2)', lineHeight: 1.5 }}>Kutilayotgan (PENDING) buyurtmalar eski narxda qoladi. Paddle&apos;da yangi price yaratiladi va eski arxivlanadi.</span>
        </>
      )}
    </Dialog>
  );
}
