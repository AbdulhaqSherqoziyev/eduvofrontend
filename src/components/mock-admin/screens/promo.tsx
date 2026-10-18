'use client';
/** Admin Promo.dc.html — §8 promo codes: list (state, usage bar), create/edit dialog (scope → skus/exams, Tashkent days). */
import { useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/admin-mock/api';
import { AdminApiError } from '@/lib/admin-mock/http';
import { errText, loadErrText } from '@/lib/admin-mock/errors';
import { examLabel, groupNum, tashkentDay } from '@/lib/admin-mock/format';
import type { AdminExam, AdminPromo, AdminPromoInput, ProductItem } from '@/lib/admin-mock/types';
import { Button } from '../ui/button';
import { Toggle } from '../ui/controls';
import { Dialog } from '../ui/dialog';
import { EmptyState, ErrorState } from '../ui/state';
import { SkeletonRows } from '../ui/table';
import { useToast } from '../ui/toast';
import { productTitle } from './prices';

const STATE: Record<AdminPromo['state'], { t: string; bg: string; fg: string; bar: string }> = {
  active: { t: 'Faol', bg: 'var(--okBg)', fg: 'var(--ok)', bar: 'var(--blue)' },
  scheduled: { t: 'Rejalashtirilgan', bg: 'var(--warnBg)', fg: 'var(--warn)', bar: 'var(--warn)' },
  ended: { t: 'Tugagan', bg: 'var(--hover)', fg: 'var(--ink2)', bar: 'var(--mut)' },
  exhausted: { t: 'Limit tugadi', bg: 'var(--errBg)', fg: 'var(--err)', bar: 'var(--err)' },
  disabled: { t: "O'chirilgan", bg: 'var(--hover)', fg: 'var(--mut)', bar: 'var(--mut)' },
};
const th = { padding: '14px 10px', borderBottom: '1px solid var(--line)', fontWeight: 700 } as const;
const td = { padding: '12px 10px', borderBottom: '1px solid var(--line)' } as const;
type Scope = 'all' | 'ielts' | 'sat' | 'cefr' | 'custom';
const SCOPES: Array<{ v: Scope; t: string }> = [
  { v: 'ielts', t: 'Barcha IELTS paketlari' }, { v: 'all', t: 'Barcha mahsulotlar' }, { v: 'sat', t: 'Faqat SAT' }, { v: 'cefr', t: 'Faqat CEFR' },
];

const dm = (iso: string) => { const d = tashkentDay(new Date(iso)); return `${d.slice(8, 10)}.${d.slice(5, 7)}`; };
const dmy = (iso: string) => { const d = tashkentDay(new Date(iso)); return `${d.slice(8, 10)}.${d.slice(5, 7)}.${d.slice(0, 4)}`; };
function rangeText(p: AdminPromo) {
  if (!p.validFrom && !p.validTo) return 'Muddatsiz';
  if (!p.validFrom) return `… – ${dmy(p.validTo!)}`;
  if (!p.validTo) return `${dmy(p.validFrom)} – …`;
  const sameYear = tashkentDay(new Date(p.validFrom)).slice(0, 4) === tashkentDay(new Date(p.validTo)).slice(0, 4);
  return `${sameYear ? dm(p.validFrom) : dmy(p.validFrom)} – ${dmy(p.validTo)}`;
}
function scopeOf(p: Pick<AdminPromo, 'skus' | 'exams'>): Scope {
  if (p.skus.length) return 'custom';
  if (!p.exams.length) return 'all';
  return p.exams.length === 1 ? (p.exams[0] as Scope) : 'custom';
}
function scopeText(p: AdminPromo, products: ProductItem[]) {
  const s = scopeOf(p);
  if (s !== 'custom') return SCOPES.find((x) => x.v === s)!.t;
  if (!p.skus.length) return p.exams.map(examLabel).join(', ');
  const by: Record<string, string[]> = {};
  for (const sku of p.skus) {
    const pr = products.find((x) => x.sku === sku);
    const e = pr ? examLabel(pr.exam) : '';
    (by[e] ??= []).push(pr ? productTitle(pr) : sku);
  }
  return Object.entries(by).map(([e, ts]) => {
    const paks = ts.filter((t) => t.startsWith('Paket ')).map((t) => t.slice(6));
    const rest = ts.filter((t) => !t.startsWith('Paket '));
    return `${e ? `${e} · ` : ''}${[...rest, paks.length ? `Paket ${paks.join(', ')}` : null].filter(Boolean).join(', ')}`;
  }).join('; ');
}

export function PromoScreen() {
  const q = useQuery({ queryKey: ['am', 'promos'], queryFn: adminApi.promos });
  const products = useQuery({ queryKey: ['am', 'products', 'all'], queryFn: () => adminApi.products() });
  const [dlg, setDlg] = useState<AdminPromo | 'new' | null>(null);
  const items = q.data?.items ?? [];
  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 13, color: 'var(--ink2)', fontWeight: 600 }}>Chegirma buyurtma summasiga qo&apos;llanadi. Paddle&apos;da kupon sifatida sinxronlanadi.</span>
        <Button size={40} onClick={() => setDlg('new')}>+ Yangi promo-kod</Button>
      </div>
      {q.isError && !q.data ? (
        <ErrorState flat title="Yuklab bo'lmadi" text={loadErrText(q.error)} onRetry={() => q.refetch()} retrying={q.isFetching} />
      ) : q.data && items.length === 0 ? (
        <EmptyState title="Hali promo-kod yo'q" text="“+ Yangi promo-kod” bilan birinchisini yarating." />
      ) : (
        <div style={{ borderRadius: 20, background: 'var(--paper)', overflowX: 'auto' }}>
          <table className="ma-table" style={{ minWidth: 900 }}>
            <thead>
              <tr style={{ textAlign: 'left', color: 'var(--mut)', fontSize: 12 }}>
                <th style={{ ...th, padding: '14px 10px 14px 16px' }}>Kod</th><th style={{ ...th, textAlign: 'right' }}>Chegirma</th><th style={th}>Mahsulotlar</th><th style={th}>Amal qilish</th><th style={th}>Ishlatildi / limit</th><th style={th}>Holat</th><th style={{ ...th, padding: '14px 16px 14px 10px' }} aria-label="Amal" />
              </tr>
            </thead>
            <tbody>
              {!q.data && <SkeletonRows cols={7} n={5} />}
              {items.map((p) => {
                const s = STATE[p.state] ?? STATE.disabled;
                const w = p.maxRedemptions ? Math.min(100, (p.redemptions / p.maxRedemptions) * 100) : 0;
                return (
                  <tr key={p.id}>
                    <td style={{ ...td, padding: '12px 10px 12px 16px', fontWeight: 800, fontSize: 13 }} className="ma-mono">
                      {p.code}
                      {!p.paddle.synced && products.data?.paddleState !== 'not_configured' && <span style={{ display: 'block', fontFamily: 'var(--ma-font)', fontSize: 11, fontWeight: 700, color: 'var(--warn)' }}>Paddle sinxronlanmagan</span>}
                    </td>
                    <td style={{ ...td, textAlign: 'right', fontWeight: 800 }}>{p.percentOff}%</td>
                    <td style={{ ...td, color: 'var(--ink2)', fontWeight: 600 }}>{scopeText(p, products.data?.items ?? [])}</td>
                    <td style={{ ...td, fontWeight: 600, whiteSpace: 'nowrap' }}>{rangeText(p)}</td>
                    <td style={{ ...td, minWidth: 160 }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                        <span style={{ fontWeight: 700 }}>{groupNum(p.redemptions)} / {p.maxRedemptions ? groupNum(p.maxRedemptions) : '∞'}</span>
                        <div style={{ height: 6, borderRadius: 999, background: 'var(--hover)' }}><div style={{ height: '100%', width: `${w}%`, borderRadius: 999, background: s.bar }} /></div>
                      </div>
                    </td>
                    <td style={td}><span style={{ fontSize: 12, fontWeight: 800, padding: '4px 10px', borderRadius: 999, background: s.bg, color: s.fg, whiteSpace: 'nowrap' }}>{s.t}</span></td>
                    <td style={{ ...td, padding: '12px 16px 12px 10px', textAlign: 'right' }}><button type="button" className="ma-linkbtn" onClick={() => setDlg(p)}>Tahrirlash</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <PromoDialog value={dlg} onClose={() => setDlg(null)} />
    </>
  );
}

const isoDay = (iso: string | null) => (iso ? tashkentDay(new Date(iso)) : '');

function PromoDialog({ value, onClose }: { value: AdminPromo | 'new' | null; onClose: () => void }) {
  const qc = useQueryClient();
  const toast = useToast();
  const edit = value && value !== 'new' ? value : null;
  const [code, setCode] = useState('');
  const [pct, setPct] = useState('');
  const [limit, setLimit] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [scope, setScope] = useState<Scope>('all');
  const [active, setActive] = useState(true);
  const [errs, setErrs] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (!value) return;
    setErrs({});
    setCode(edit?.code ?? '');
    setPct(edit ? String(edit.percentOff) : '');
    setLimit(edit?.maxRedemptions ? String(edit.maxRedemptions) : '');
    setFrom(isoDay(edit?.validFrom ?? null));
    setTo(isoDay(edit?.validTo ?? null));
    setScope(edit ? scopeOf(edit) : 'all');
    setActive(edit ? edit.isActive : true);
  }, [value, edit]);
  const options = useMemo(() => (scope === 'custom' && edit ? [...SCOPES, { v: 'custom' as Scope, t: `Tanlangan mahsulotlar (${edit.skus.length || edit.exams.length})` }] : SCOPES), [scope, edit]);

  async function save() {
    const e: Record<string, string> = {};
    const c = code.trim().toUpperCase();
    if (!edit && !/^[A-Z0-9_-]{3,32}$/.test(c)) e.code = 'Kod 3–32 belgi: lotin harf, raqam, - yoki _.';
    const p = Number(pct);
    if (!Number.isInteger(p) || p < 1 || p > 100) e.pct = '1 dan 100 gacha butun son.';
    const lim = limit.trim() ? Number(limit) : null;
    if (lim !== null && (!Number.isInteger(lim) || lim < 1)) e.limit = "Musbat butun son yoki bo'sh (cheksiz).";
    if (from && to && to < from) e.to = 'Tugash boshlanishdan oldin.';
    setErrs(e);
    if (Object.keys(e).length) return;
    const scoped: Pick<AdminPromoInput, 'skus' | 'exams'> = scope === 'custom' && edit
      ? { skus: edit.skus, exams: edit.exams as AdminExam[] }
      : { skus: [], exams: scope === 'all' ? [] : [scope as AdminExam] };
    const body: AdminPromoInput = {
      percentOff: p, maxRedemptions: lim, perLearnerLimit: edit?.perLearnerLimit ?? 1,
      validFrom: from ? `${from}T00:00:00+05:00` : null, validTo: to ? `${to}T23:59:59+05:00` : null,
      isActive: active, providerDiscountId: edit?.providerDiscountId ?? null, ...scoped,
    };
    setBusy(true);
    try {
      if (edit) await adminApi.updatePromo(edit.id, body);
      else await adminApi.createPromo({ ...body, code: c });
      toast({ tone: 'ok', title: 'Saqlandi', text: edit?.code ?? c });
      void qc.invalidateQueries({ queryKey: ['am', 'promos'] });
      onClose();
    } catch (err) {
      if (err instanceof AdminApiError && err.code === 'PROMO_CODE_TAKEN') setErrs({ code: 'Bu kod band.' });
      else setErrs({ form: errText(err) });
    } finally {
      setBusy(false);
    }
  }

  const inp = { fontSize: 15, fontWeight: 800 } as const;
  return (
    <Dialog open={!!value} onClose={onClose} busy={busy} width={480} title={edit ? 'Promo-kodni tahrirlash' : 'Yangi promo-kod'}
      actions={<>
        <Button variant="secondary" size={42} style={{ color: 'var(--ink2)' }} onClick={onClose} disabled={busy}>Bekor qilish</Button>
        <Button size={42} onClick={save} loading={busy}>Saqlash</Button>
      </>}>
      <label className="ma-field"><span className="ma-label">Kod</span>
        <input className={`ma-input${errs.code ? ' is-error' : ''}`} style={{ ...inp, fontFamily: 'ui-monospace,Menlo,monospace', letterSpacing: '.04em', textTransform: 'uppercase' }} value={code} disabled={!!edit} maxLength={32} onChange={(e) => setCode(e.target.value)} placeholder="BLACKFRIDAY30" autoFocus={!edit} />
        {errs.code && <span className="ma-field-error s-sm">{errs.code}</span>}
      </label>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <label className="ma-field"><span className="ma-label">Chegirma, %</span>
          <input className={`ma-input${errs.pct ? ' is-error' : ''}`} style={inp} value={pct} inputMode="numeric" onChange={(e) => setPct(e.target.value.replace(/\D/g, ''))} />
          {errs.pct && <span className="ma-field-error s-sm">{errs.pct}</span>}
        </label>
        <label className="ma-field"><span className="ma-label">Limit</span>
          <input className={`ma-input${errs.limit ? ' is-error' : ''}`} style={inp} value={limit} inputMode="numeric" placeholder="∞" onChange={(e) => setLimit(e.target.value.replace(/\D/g, ''))} />
          {errs.limit && <span className="ma-field-error s-sm">{errs.limit}</span>}
        </label>
        <label className="ma-field"><span className="ma-label">Boshlanish</span>
          <input type="date" className="ma-input" style={{ fontWeight: 700 }} value={from} onChange={(e) => setFrom(e.target.value)} />
        </label>
        <label className="ma-field"><span className="ma-label">Tugash</span>
          <input type="date" className={`ma-input${errs.to ? ' is-error' : ''}`} style={{ fontWeight: 700 }} value={to} min={from || undefined} onChange={(e) => setTo(e.target.value)} />
          {errs.to && <span className="ma-field-error s-sm">{errs.to}</span>}
        </label>
      </div>
      <label className="ma-field"><span className="ma-label">Mahsulotlar</span>
        <select className="ma-select" style={{ height: 46, borderRadius: 14, fontSize: 14 }} value={scope} onChange={(e) => setScope(e.target.value as Scope)}>
          {options.map((o) => <option key={o.v} value={o.v}>{o.t}</option>)}
        </select>
      </label>
      {edit && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Toggle label="Faol" checked={active} onChange={setActive} />
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink2)' }}>{active ? 'Faol' : "O'chirilgan — kod qabul qilinmaydi"}</span>
        </div>
      )}
      {errs.form && <span className="ma-field-error" role="alert">{errs.form}</span>}
    </Dialog>
  );
}
