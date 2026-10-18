'use client';
/**
 * Admin Orders.dc.html — O1 /orders (tabs + filters + page/pageSize), O8 CSV export (filters or
 * selected ids). Desktop table / phone cards; loading, empty, error. No bulk confirm (design).
 */
import Link from 'next/link';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/admin-mock/api';
import { saveBlob } from '@/lib/admin-mock/http';
import { errText } from '@/lib/admin-mock/errors';
import { dateTime, dayLabel, flag, money, productName, tashkentDay } from '@/lib/admin-mock/format';
import type { OrderTab } from '@/lib/admin-mock/types';
import { Button } from '../ui/button';
import { StatusChip } from '../ui/chip';
import { FilterOptions, FilterPill, Pager, Tabs } from '../ui/filters';
import { EmptyState, ErrorState } from '../ui/state';
import { SkeletonRows } from '../ui/table';
import { useToast } from '../ui/toast';
import { useIsMobile, useNow, useUrlState } from './hooks';
import { methodOf, orderAge, statusOf } from './order-shared';

const PAGE_SIZE = 25;
const DEFAULTS = { tab: 'pending_manual', methodGroup: '', currency: '', exam: '', from: '', to: '', promo: '', page: '1' };
const METHODS = [{ value: '', label: 'Hammasi' }, { value: 'card', label: 'Karta / Paddle' }, { value: 'wallet', label: 'Hamyon' }, { value: 'local', label: "Mahalliy o'tkazma" }] as const;
const CURRENCIES = [{ value: '', label: 'Hammasi' }, { value: 'UZS', label: "UZS · so'm" }, { value: 'USD', label: 'USD · $' }, { value: 'EUR', label: 'EUR · €' }] as const;
const EXAMS = [{ value: '', label: 'Hammasi' }, { value: 'ielts', label: 'IELTS' }, { value: 'sat', label: 'SAT' }, { value: 'cefr', label: 'CEFR' }] as const;
const AGE_FG = { mut: 'var(--mut)', warn: 'var(--warn)', err: 'var(--err)' };
const th = { padding: '14px 10px', borderBottom: '1px solid var(--line)', fontWeight: 700 } as const;
const td = { padding: '12px 10px', borderBottom: '1px solid var(--line)' } as const;

export function OrdersScreen() {
  const mob = useIsMobile();
  const now = useNow();
  const toast = useToast();
  const [f, setF] = useUrlState(DEFAULTS);
  const [sel, setSel] = useState<Record<string, boolean>>({});
  const [exporting, setExporting] = useState(false);
  const page = Math.max(1, Number(f.page) || 1);
  const filters = { methodGroup: f.methodGroup, currency: f.currency, exam: f.exam, from: f.from, to: f.to, promo: f.promo };
  const query = { tab: f.tab, ...filters, page, pageSize: PAGE_SIZE };
  const q = useQuery({ queryKey: ['am', 'orders', query], queryFn: () => adminApi.orders(query), placeholderData: (p) => p });
  const set = (patch: Partial<typeof DEFAULTS>) => { setSel({}); setF({ page: '1', ...patch }); };

  const rows = q.data?.items ?? [];
  const c = q.data?.counts;
  const selIds = Object.keys(sel).filter((k) => sel[k]);
  const anyFilter = Object.values(filters).some(Boolean);

  async function exportCsv(ids?: string[]) {
    setExporting(true);
    try {
      const { blob, filename } = await adminApi.ordersCsv(ids?.length ? { ids } : { tab: f.tab, ...filters });
      saveBlob(blob, filename ?? `orders-${tashkentDay()}.csv`);
    } catch (e) {
      toast({ tone: 'err', title: 'Eksport qilinmadi', text: errText(e) });
    } finally {
      setExporting(false);
    }
  }

  const dateValue = f.from || f.to ? `${f.from ? dayLabel(f.from) : '…'} – ${f.to ? dayLabel(f.to) : '…'}` : 'Hammasi';

  return (
    <>
      <Tabs
        label="Buyurtma holati"
        value={f.tab as OrderTab}
        onPick={(v) => set({ tab: v })}
        tabs={[
          { value: 'pending_manual', label: 'Tasdiq kutmoqda', count: c?.pendingManual ?? null, warn: true },
          { value: 'all', label: 'Hammasi', count: c?.all ?? null },
          { value: 'paid', label: "To'langan", count: c?.paid ?? null },
          { value: 'failed', label: 'Bekor/Muvaffaqiyatsiz', count: c?.failed ?? null },
          { value: 'refunded', label: 'Qaytarilgan', count: c?.refunded ?? null },
        ]}
      />

      <div className="ma-toolbar">
        <FilterPill label="Usul" value={METHODS.find((m) => m.value === f.methodGroup)?.label ?? 'Hammasi'} active={!!f.methodGroup}>
          {(close) => <FilterOptions options={METHODS} value={f.methodGroup as (typeof METHODS)[number]['value']} onPick={(v) => { set({ methodGroup: v }); close(); }} />}
        </FilterPill>
        <FilterPill label="Valyuta" value={f.currency || 'Hammasi'} active={!!f.currency}>
          {(close) => <FilterOptions options={CURRENCIES} value={f.currency as (typeof CURRENCIES)[number]['value']} onPick={(v) => { set({ currency: v }); close(); }} />}
        </FilterPill>
        <FilterPill label="Imtihon" value={EXAMS.find((m) => m.value === f.exam)?.label ?? 'Hammasi'} active={!!f.exam}>
          {(close) => <FilterOptions options={EXAMS} value={f.exam as (typeof EXAMS)[number]['value']} onPick={(v) => { set({ exam: v }); close(); }} />}
        </FilterPill>
        <FilterPill label="Sana" value={dateValue} active={!!(f.from || f.to)}>
          {(close) => <DateRange from={f.from} to={f.to} onApply={(from, to) => { set({ from, to }); close(); }} />}
        </FilterPill>
        <FilterPill label="Promo" value={f.promo || '—'} active={!!f.promo}>
          {(close) => <PromoInput value={f.promo} onApply={(v) => { set({ promo: v }); close(); }} />}
        </FilterPill>
        <button type="button" className="ma-btn v-text s-38" disabled={!anyFilter} onClick={() => set({ methodGroup: '', currency: '', exam: '', from: '', to: '', promo: '' })}>Tozalash</button>
        <span style={{ flex: 1 }} />
        <Button variant="secondary" size={38} style={{ color: 'var(--ink2)' }} onClick={() => exportCsv()} loading={exporting && !selIds.length} disabled={!q.data}>CSV eksport</Button>
      </div>

      {selIds.length > 0 && (
        <div className="ma-sel-bar">
          <b style={{ fontSize: 13 }}>{selIds.length} ta tanlandi</b>
          <Button variant="secondary" style={{ color: 'var(--ink2)' }} onClick={() => exportCsv(selIds)} loading={exporting}>CSV eksport</Button>
          <Button variant="secondary" disabled title="Har bir to'lov alohida tasdiqlanadi">Tasdiqlash</Button>
          <span style={{ fontSize: 12, color: 'var(--mut)', fontWeight: 600 }}>Ommaviy tasdiqlash o&apos;chirilgan — har bir to&apos;lov tushganini alohida tekshiring.</span>
        </div>
      )}

      {q.isError && !q.data ? (
        <ErrorState flat title="Buyurtmalarni yuklab bo'lmadi" text={errText(q.error, "So'rov vaqti tugadi. Qayta urinib ko'ring.")} onRetry={() => q.refetch()} retrying={q.isFetching} />
      ) : q.data && rows.length === 0 ? (
        <EmptyState title="Hali buyurtma yo'q" text="Filtrlarga mos buyurtma topilmadi." />
      ) : mob ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {!q.data && [1, 2, 3].map((i) => <div key={i} className="ma-skel" style={{ height: 140, borderRadius: 18 }} />)}
          {rows.map((o) => {
            const s = statusOf(o.status);
            const age = orderAge(o, now);
            return (
              <Link key={o.id} href={`/orders/${o.id}`} className="ma-ocard">
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center' }}>
                  <b style={{ fontSize: 13, color: 'var(--mut)' }}>{o.reference}</b>
                  <span className={`ma-chip s-sm t-${s.tone}`} style={{ padding: '3px 9px' }}>{s.t}</span>
                </div>
                <span style={{ fontSize: 14, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{flag(o.learner.country)} {o.learner.email ?? '—'}</span>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 10 }}>
                  <span style={{ fontSize: 13, color: 'var(--ink2)', fontWeight: 600 }}>{productName(o.quote.product)}</span>
                  <b style={{ fontSize: 16, whiteSpace: 'nowrap' }}>{money(o.quote.total)}</b>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: AGE_FG[age.tone] }}>{age.text}</span>
                  {o.status === 'PENDING' && <span className="ma-btn v-primary s-36">Tekshirish →</span>}
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div style={{ borderRadius: 20, background: 'var(--paper)', overflowX: 'auto' }}>
          <table className="ma-table" style={{ minWidth: 1100 }}>
            <thead>
              <tr style={{ textAlign: 'left', color: 'var(--mut)', fontSize: 12 }}>
                <th style={{ ...th, padding: '14px 8px 14px 16px', width: 36 }}>
                  <input type="checkbox" className="ma-check" aria-label="Hammasini tanlash" checked={rows.length > 0 && rows.every((r) => sel[r.id])}
                    onChange={(e) => setSel(e.target.checked ? Object.fromEntries(rows.map((r) => [r.id, true])) : {})} />
                </th>
                <th style={th}>Buyurtma №</th>
                <th style={th}>Kvitansiya №</th>
                <th style={th}>O&apos;quvchi</th>
                <th style={th}>Mahsulot</th>
                <th style={{ ...th, textAlign: 'right' }}>Summa</th>
                <th style={th}>Usul</th>
                <th style={th}>Holat</th>
                <th style={th}>Yaratildi</th>
                <th style={{ ...th, padding: '14px 16px 14px 10px', textAlign: 'right' }}>Amal</th>
              </tr>
            </thead>
            <tbody>
              {!q.data && <SkeletonRows cols={10} n={8} />}
              {rows.map((o) => {
                const s = statusOf(o.status);
                const age = orderAge(o, now);
                const on = !!sel[o.id];
                return (
                  <tr key={o.id} className={on ? 'is-selected' : undefined}>
                    <td style={{ ...td, padding: '12px 8px 12px 16px' }}>
                      <input type="checkbox" className="ma-check" aria-label={`${o.reference} tanlash`} checked={on} onChange={() => setSel((x) => ({ ...x, [o.id]: !x[o.id] }))} />
                    </td>
                    <td style={{ ...td, fontWeight: 800, whiteSpace: 'nowrap' }}><Link href={`/orders/${o.id}`}>{o.reference}</Link></td>
                    <td style={{ ...td, color: 'var(--ink2)', whiteSpace: 'nowrap' }} className="ma-mono">{o.receiptNo ?? '—'}</td>
                    <td style={{ ...td, maxWidth: 230 }}>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center', minWidth: 0 }}>
                        <span>{flag(o.learner.country)}</span>
                        <span title={o.learner.email ?? ''} style={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{o.learner.email ?? '—'}</span>
                      </div>
                    </td>
                    <td style={{ ...td, color: 'var(--ink2)', fontWeight: 600, whiteSpace: 'nowrap' }}>{productName(o.quote.product)}</td>
                    <td style={{ ...td, textAlign: 'right', fontWeight: 800, whiteSpace: 'nowrap' }}>{money(o.quote.total)}</td>
                    <td style={{ ...td, color: 'var(--ink2)', fontWeight: 600, whiteSpace: 'nowrap' }}>{methodOf(o)}</td>
                    <td style={td}><StatusChip tone={s.tone}>{s.t}</StatusChip></td>
                    <td style={{ ...td, whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 600 }}>{dateTime(o.createdAt)}</span>
                        {age.text && <span style={{ fontSize: 11, fontWeight: 700, color: AGE_FG[age.tone] }}>{age.text}</span>}
                      </div>
                    </td>
                    <td style={{ ...td, padding: '12px 16px 12px 10px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                      {o.status === 'PENDING'
                        ? <Link href={`/orders/${o.id}`} className="ma-btn v-primary s-32">Tekshirish</Link>
                        : <Link href={`/orders/${o.id}`} style={{ fontWeight: 700, fontSize: 13 }}>Ochish</Link>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      {q.data && rows.length > 0 && (
        <Pager page={page} pageSize={PAGE_SIZE} total={q.data.total} shown={rows.length} onPage={(p) => { setSel({}); setF({ page: String(p) }); }} />
      )}
    </>
  );
}

export function DateRange({ from, to, onApply }: { from: string; to: string; onApply: (from: string, to: string) => void }) {
  const [a, setA] = useState(from);
  const [b, setB] = useState(to);
  const today = tashkentDay();
  return (
    <form style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 4 }} onSubmit={(e) => { e.preventDefault(); onApply(a, b); }}>
      <label className="ma-field" style={{ gap: 4 }}><span className="ma-label">Dan</span><input type="date" className="ma-select" value={a} max={b || today} onChange={(e) => setA(e.target.value)} /></label>
      <label className="ma-field" style={{ gap: 4 }}><span className="ma-label">Gacha</span><input type="date" className="ma-select" value={b} min={a || undefined} max={today} onChange={(e) => setB(e.target.value)} /></label>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button type="button" className="ma-btn v-text s-32" onClick={() => onApply('', '')}>Tozalash</button>
        <button type="submit" className="ma-btn v-primary s-32">Qo&apos;llash</button>
      </div>
    </form>
  );
}

function PromoInput({ value, onApply }: { value: string; onApply: (v: string) => void }) {
  const [v, setV] = useState(value);
  return (
    <form style={{ display: 'flex', gap: 8, padding: 4 }} onSubmit={(e) => { e.preventDefault(); onApply(v.trim().toUpperCase()); }}>
      <input className="ma-input" style={{ height: 38, width: 160 }} value={v} onChange={(e) => setV(e.target.value)} placeholder="Kod" aria-label="Promo-kod" autoFocus maxLength={40} />
      <button type="submit" className="ma-btn v-primary s-38">OK</button>
    </form>
  );
}
