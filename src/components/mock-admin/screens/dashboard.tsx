'use client';
/**
 * Admin Dashboard.dc.html — D1 /dashboard + O1 `tab=pending_manual` (pending transfers) + O4
 * inline "Tasdiqlash" (amount = order total). States: loading (shimmer), error, empty pending.
 */
import Link from 'next/link';
import { useState } from 'react';
import { useQuery, useQueryClient, type UseQueryResult } from '@tanstack/react-query';
import { adminApi } from '@/lib/admin-mock/api';
import { AdminApiError } from '@/lib/admin-mock/http';
import { errText, loadErrText } from '@/lib/admin-mock/errors';
import {
  addDays, ago, dayLabel, deltaPct, deltaPp, examLabel, flag, groupNum, money, pct, productName, tashkentDay, ticketNo,
} from '@/lib/admin-mock/format';
import type { AdminOrderRow, DashboardRes, MarkPaidRes, OrdersRes } from '@/lib/admin-mock/types';
import { Button } from '../ui/button';
import { axisLabels, linePath, niceMax } from '../ui/chart';
import { ErrorState, InlineEmpty } from '../ui/state';
import { useToast } from '../ui/toast';
import { useIsMobile } from './hooks';

type PeriodKey = 'today' | '7d' | '30d' | 'custom';
const PERIODS: Array<{ key: PeriodKey; label: string }> = [
  { key: 'today', label: 'Bugun' }, { key: '7d', label: '7 kun' }, { key: '30d', label: '30 kun' }, { key: 'custom', label: 'Oraliq' },
];
const SHIMMER = { background: 'linear-gradient(90deg,var(--hover) 0%,var(--paper) 50%,var(--hover) 100%)', backgroundSize: '1200px 100%', animation: 'shimmer 1.4s linear infinite' } as const;
const card = { borderRadius: 24, boxShadow: 'var(--raise)', padding: 20, display: 'flex', flexDirection: 'column', minWidth: 0 } as const;
const h3 = { margin: 0, fontSize: 15, fontWeight: 800 } as const;

/** "6 daq oldin" / "27 soat oldin · 21 s qoldi" (design: hours, not days; warn after 24 h) */
function pendingAge(o: AdminOrderRow, now: number) {
  const mins = Math.max(0, Math.floor((now - Date.parse(o.createdAt)) / 60000));
  const h = Math.floor(mins / 60);
  let text = h < 1 ? `${mins} daq oldin` : `${h} soat oldin`;
  const late = h >= 24;
  if (late && o.expiresAt) text += ` · ${Math.max(0, Math.floor((Date.parse(o.expiresAt) - now) / 3600000))} s qoldi`;
  return { text, late };
}

/** "IELTS 0 → 5 full" / "IELTS cheksiz · 17 noy" */
export function creditResult(r: MarkPaidRes) {
  const e = examLabel(r.credits.exam);
  const a = r.credits.after, b = r.credits.before;
  if (a.unlimitedUntil && a.unlimitedUntil !== b.unlimitedUntil) return `${e} cheksiz · ${dayLabel(a.unlimitedUntil.slice(0, 10))}`;
  if (a.fullMocks !== b.fullMocks) return `${e} ${b.fullMocks} → ${a.fullMocks} full`;
  return `${e} ${b.sections} → ${a.sections} bo'lim`;
}

export function DashboardScreen() {
  const mob = useIsMobile();
  const [period, setPeriod] = useState<PeriodKey>('7d');
  const today = tashkentDay();
  const [range, setRange] = useState({ from: addDays(today, -29), to: today });
  const q = period === 'custom' ? { period, from: range.from, to: range.to } : { period };
  const dash = useQuery({ queryKey: ['am', 'dashboard', q], queryFn: () => adminApi.dashboard(q), placeholderData: (p) => p });
  const pending = useQuery({ queryKey: ['am', 'orders', { tab: 'pending_manual', page: 1, pageSize: 10 }], queryFn: () => adminApi.orders({ tab: 'pending_manual', page: 1, pageSize: 10 }) });

  if (dash.isError && !dash.data) {
    const st = dash.error instanceof AdminApiError ? dash.error.status : 0;
    return (
      <ErrorState
        title="Ma'lumotlarni yuklab bo'lmadi"
        text={`${st >= 500 ? `Server javob bermadi (${st}). ` : ''}Internet aloqasini tekshiring yoki qayta urinib ko'ring.`}
        onRetry={() => { void dash.refetch(); void pending.refetch(); }}
        retrying={dash.isFetching}
      />
    );
  }
  if (!dash.data) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }} aria-busy="true" aria-label="Yuklanmoqda">
        <div style={{ height: 260, borderRadius: 24, ...SHIMMER }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 20 }}>
          {[1, 2, 3, 4, 5].map((i) => <div key={i} style={{ height: 120, borderRadius: 20, ...SHIMMER }} />)}
        </div>
        <div style={{ height: 320, borderRadius: 24, ...SHIMMER }} />
      </div>
    );
  }
  const d = dash.data;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <PendingSection q={pending} mob={mob} />

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <h2 style={{ margin: 0, fontSize: 16, fontWeight: 800, flex: 1 }}>Ko&apos;rsatkichlar</h2>
        {period === 'custom' && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <input type="date" className="ma-select" style={{ width: 'auto', height: 40 }} value={range.from} max={range.to} aria-label="Boshlanish"
              onChange={(e) => e.target.value && setRange((r) => ({ ...r, from: e.target.value }))} />
            <span style={{ color: 'var(--mut)', fontWeight: 700 }}>–</span>
            <input type="date" className="ma-select" style={{ width: 'auto', height: 40 }} value={range.to} min={range.from} max={today} aria-label="Tugash"
              onChange={(e) => e.target.value && setRange((r) => ({ ...r, to: e.target.value }))} />
          </div>
        )}
        <div className="ma-seg s-32" role="group" aria-label="Davr">
          {PERIODS.map((p) => (
            <button key={p.key} type="button" aria-pressed={p.key === period} onClick={() => setPeriod(p.key)}>{p.label}</button>
          ))}
        </div>
      </div>
      <Kpis d={d} period={period} range={range} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,420px),1fr))', gap: 20 }}>
        <RevenueChart d={d} />
        <Funnel d={d} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,300px),1fr))', gap: 20 }}>
        <TopProducts d={d} />
        <AiQueue d={d} />
        <OpenTickets d={d} />
      </div>
    </div>
  );
}

function PendingSection({ q, mob }: { q: UseQueryResult<OrdersRes>; mob: boolean }) {
  const qc = useQueryClient();
  const toast = useToast();
  const [done, setDone] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const items = q.data?.items ?? [];
  const left = q.data ? Math.max(0, q.data.total - Object.keys(done).length) : null;
  const now = Date.now();

  async function confirm(o: AdminOrderRow) {
    if (busy) return;
    setBusy(o.id);
    try {
      const r = await adminApi.markPaid(o.id, { amountMinor: o.quote.total.amountMinor });
      const res = creditResult(r);
      setDone((s) => ({ ...s, [o.id]: res }));
      toast({ tone: 'ok', title: "To'lov tasdiqlandi", text: `${o.reference} · ${res}.${r.receiptMailQueued ? ' Kvitansiya emaili yuborildi.' : ''}` });
      void qc.invalidateQueries({ queryKey: ['am', 'badges'] });
    } catch (e) {
      toast({ tone: 'err', title: 'Tasdiqlanmadi', text: errText(e) });
      if (e instanceof AdminApiError && e.code === 'ORDER_NOT_PENDING') void q.refetch();
    } finally {
      setBusy(null);
    }
  }

  return (
    <section style={{ ...card, padding: 'clamp(16px,2vw,24px)', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1, minWidth: 220 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>Tasdiq kutayotgan to&apos;lovlar</h2>
            {left !== null && <span style={{ fontSize: 12, fontWeight: 800, padding: '3px 9px', borderRadius: 999, background: 'var(--warnBg)', color: 'var(--warn)' }}>{left}</span>}
          </div>
          <span style={{ fontSize: 13, color: 'var(--ink2)' }}>Mahalliy o&apos;tkazma. Kartaga tushganini tekshiring, so&apos;ng tasdiqlang. 48 soatdan keyin buyurtma bekor bo&apos;ladi.</span>
        </div>
        <Link href="/orders" style={{ fontSize: 13, fontWeight: 700 }}>Hammasi →</Link>
      </div>
      {q.isError && !q.data ? (
        <ErrorState flat title="Buyurtmalarni yuklab bo'lmadi" text={loadErrText(q.error, "So'rov vaqti tugadi. Qayta urinib ko'ring.")} onRetry={() => q.refetch()} retrying={q.isFetching} />
      ) : !q.data ? (
        <div style={{ borderRadius: 16, background: 'var(--paper)', overflow: 'hidden' }}>
          {[70, 55, 82].map((w, i) => <div key={i} style={{ padding: '14px 16px', borderBottom: '1px solid var(--line)' }}><span className="ma-skel" style={{ width: `${w}%` }} /></div>)}
        </div>
      ) : items.length === 0 ? (
        <InlineEmpty title="Hammasi tasdiqlangan" text="Hozircha kutayotgan o'tkazma yo'q." />
      ) : (
        <div style={{ borderRadius: 16, background: 'var(--paper)', overflow: 'hidden' }}>
          {items.map((o) => {
            const res = done[o.id];
            const age = pendingAge(o, now);
            return (
              <div key={o.id} style={{ display: 'grid', gridTemplateColumns: mob ? 'minmax(0,1fr) auto' : 'minmax(0,2.2fr) minmax(0,1.4fr) 140px 170px 130px', gap: '12px 16px', alignItems: 'center', padding: '14px 16px', borderBottom: '1px solid var(--line)', background: res ? 'var(--okBg)' : 'transparent' }}>
                <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, gap: 2 }}>
                  <Link href={`/orders/${o.id}`} style={{ fontSize: 12, fontWeight: 700, color: 'var(--mut)' }}>{o.reference}</Link>
                  <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{flag(o.learner.country)} {o.learner.email ?? '—'}</span>
                </div>
                <span style={{ fontSize: 13, color: 'var(--ink2)', fontWeight: 600 }}>{productName(o.quote.product)}</span>
                <span style={{ fontSize: 15, fontWeight: 800, textAlign: 'right', whiteSpace: 'nowrap' }}>{money(o.quote.total)}</span>
                <span style={{ justifySelf: 'start', fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: 999, background: age.late ? 'var(--warnBg)' : 'var(--hover)', color: age.late ? 'var(--warn)' : 'var(--ink2)', whiteSpace: 'nowrap' }}>{age.text}</span>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                  {res ? (
                    <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--ok)', whiteSpace: 'nowrap' }}>✓ {res}</span>
                  ) : (
                    <Button size={36} onClick={() => confirm(o)} loading={busy === o.id} disabled={!!busy && busy !== o.id}>Tasdiqlash</Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function Kpis({ d, period, range }: { d: DashboardRes; period: PeriodKey; range: { from: string; to: string } }) {
  const k = d.kpis;
  const uzs = k.revenue.current.find((m) => m.currency === 'UZS') ?? { currency: 'UZS', amountMinor: 0 };
  const other = k.revenue.current.filter((m) => m.currency !== 'UZS').map((m) => `+ ${money(m)}`).join(' ');
  const rev = deltaPct(k.revenue.currentUzsEq, k.revenue.previousUzsEq);
  const paidD = period === 'today'
    ? (() => { const x = k.paidOrders.current - k.paidOrders.previous; return { text: `${x > 0 ? '+' : x < 0 ? '−' : ''}${Math.abs(x)}`, trend: x < 0 ? 'down' as const : 'up' as const }; })()
    : deltaPct(k.paidOrders.current, k.paidOrders.previous);
  const periodSub = period === 'today' ? 'bugun' : period === '7d' ? '7 kun' : period === '30d' ? '30 kun' : `${dayLabel(range.from)} – ${dayLabel(range.to)}`;
  const by = k.fullMocksStarted.byExam;
  const bySub = (['ielts', 'sat', 'cefr'] as const).filter((e) => e !== 'cefr' || by.cefr > 0).map((e) => `${examLabel(e)} ${groupNum(by[e] ?? 0)}`).join(' · ');
  const items = [
    { label: 'Daromad', value: money(uzs), delta: rev, sub: other },
    { label: "To'langan buyurtmalar", value: groupNum(k.paidOrders.current), delta: paidD, sub: periodSub },
    { label: "Yangi o'quvchilar", value: groupNum(k.newLearners.current), delta: deltaPct(k.newLearners.current, k.newLearners.previous), sub: 'email tasdiqlagan' },
    { label: 'Boshlangan full mocklar', value: groupNum(k.fullMocksStarted.current), delta: deltaPct(k.fullMocksStarted.current, k.fullMocksStarted.previous), sub: bySub },
    { label: "Bepul → to'lov", value: pct(k.freeToPaid.current.rate), delta: deltaPp(k.freeToPaid.current.rate, k.freeToPaid.previous.rate), sub: "bepul bo'limdan" },
  ];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,200px),1fr))', gap: 20 }}>
      {items.map((it) => (
        <div key={it.label} style={{ borderRadius: 20, boxShadow: 'var(--raise)', padding: 18, display: 'flex', flexDirection: 'column', gap: 8, minWidth: 0 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--mut)' }}>{it.label}</span>
          <span style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.02em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{it.value}</span>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: it.delta.trend === 'down' ? 'var(--err)' : 'var(--ok)' }}>{it.delta.text}</span>
            {it.sub && <span style={{ fontSize: 12, color: 'var(--mut)', fontWeight: 600 }}>{it.sub}</span>}
          </div>
        </div>
      ))}
    </div>
  );
}

function RevenueChart({ d }: { d: DashboardRes }) {
  const days = d.revenueDaily.days;
  const a = days.map((x) => x.byExam.ielts?.uzsEq ?? 0);
  const b = days.map((x) => x.byExam.sat?.uzsEq ?? 0);
  const max = niceMax(Math.max(1, ...a, ...b));
  const empty = days.every((x) => !(x.byExam.ielts?.uzsEq || x.byExam.sat?.uzsEq));
  return (
    <section style={{ ...card, gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <h3 style={{ ...h3, flex: 1 }}>Daromad · kunlar bo&apos;yicha</h3>
        <div style={{ display: 'flex', gap: 12, fontSize: 12, fontWeight: 700, color: 'var(--ink2)' }}>
          <span style={{ display: 'flex', gap: 6, alignItems: 'center' }}><i style={{ width: 10, height: 3, borderRadius: 2, background: 'var(--blue)' }} />IELTS</span>
          <span style={{ display: 'flex', gap: 6, alignItems: 'center' }}><i style={{ width: 10, height: 3, borderRadius: 2, background: 'var(--ai)' }} />SAT</span>
        </div>
      </div>
      <svg viewBox="0 0 600 220" preserveAspectRatio="none" style={{ width: '100%', height: 220, display: 'block' }} role="img"
        aria-label={empty ? "Oxirgi 30 kunda to'lov yo'q" : `Daromad, oxirgi 30 kun. Eng yuqori kun: ${groupNum(Math.max(...a, ...b))} so'm ekv.`}>
        <path d="M0 55H600M0 110H600M0 165H600" stroke="var(--line)" strokeWidth="1" />
        <path d={linePath(a, max, true)} fill="var(--blue)" opacity="0.10" />
        <path d={linePath(a, max)} fill="none" stroke="var(--blue)" strokeWidth="2.5" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        <path d={linePath(b, max)} fill="none" stroke="var(--ai)" strokeWidth="2.5" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      </svg>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 700, color: 'var(--mut)' }}>
        {axisLabels(days, (x) => dayLabel(x.date)).map((l, i) => <span key={i}>{l}</span>)}
      </div>
    </section>
  );
}

const FUNNEL_LABEL: Record<string, string> = {
  signed_up: "Ro'yxatdan o'tdi", email_verified: 'Email tasdiqladi', free_section: "Bepul bo'lim", first_payment: "Birinchi to'lov", repeat_payment: "Takroriy to'lov",
};

function Funnel({ d }: { d: DashboardRes }) {
  const top = d.funnel.steps[0]?.n ?? 0;
  return (
    <section style={{ ...card, gap: 12 }}>
      <h3 style={h3}>Voronka · 30 kun</h3>
      {d.funnel.steps.map((s) => {
        const r = top ? s.n / top : 0;
        return (
          <div key={s.key} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 700 }}>
              <span>{FUNNEL_LABEL[s.key] ?? s.key}</span>
              <span style={{ color: 'var(--ink2)' }}>{groupNum(s.n)} <span style={{ color: 'var(--mut)', fontWeight: 600 }}>· {Math.round(r * 1000) / 10}%</span></span>
            </div>
            <div style={{ height: 10, borderRadius: 999, boxShadow: 'var(--inset)', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${Math.max(3, r * 100)}%`, borderRadius: 999, background: 'linear-gradient(135deg,#5B8DEF,#2E6BE6)' }} />
            </div>
          </div>
        );
      })}
    </section>
  );
}

function TopProducts({ d }: { d: DashboardRes }) {
  const max = Math.max(1, ...d.topProducts.map((t) => t.paidOrders));
  return (
    <section style={{ ...card, gap: 12 }}>
      <h3 style={h3}>Top mahsulotlar</h3>
      {d.topProducts.length === 0 && <span style={{ fontSize: 13, color: 'var(--ink2)' }}>Oxirgi 30 kunda to&apos;lov yo&apos;q.</span>}
      {d.topProducts.map((t) => (
        <div key={t.sku} style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) auto', gap: '4px 10px' }}>
          <span style={{ fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {t.kind === 'section' ? `${examLabel(t.exam)} · Bo'lim ×${t.qty}` : productName(t)}
          </span>
          <span style={{ fontSize: 13, fontWeight: 800 }}>{groupNum(t.paidOrders)}</span>
          <div style={{ gridColumn: '1/-1', height: 8, borderRadius: 999, background: 'var(--hover)' }}>
            <div style={{ height: '100%', width: `${(t.paidOrders / max) * 100}%`, borderRadius: 999, background: 'var(--blue)' }} />
          </div>
        </div>
      ))}
    </section>
  );
}

const AI_STATE: Record<DashboardRes['aiQueue']['state'], { t: string; bg: string; fg: string }> = {
  running: { t: 'Ishlamoqda', bg: 'var(--aiBg)', fg: 'var(--ai)' },
  idle: { t: "Bo'sh", bg: 'var(--hover)', fg: 'var(--ink2)' },
  paused_budget: { t: 'Byudjet tufayli pauza', bg: 'var(--warnBg)', fg: 'var(--warn)' },
  stalled: { t: 'Navbat to\'xtab qolgan', bg: 'var(--errBg)', fg: 'var(--err)' },
};

function AiQueue({ d }: { d: DashboardRes }) {
  const a = d.aiQueue;
  const s = AI_STATE[a.state] ?? AI_STATE.idle;
  const box = { padding: 12, borderRadius: 14, boxShadow: 'var(--inset)', display: 'flex', flexDirection: 'column', gap: 4 } as const;
  const lab = { fontSize: 11, fontWeight: 700, color: 'var(--mut)' } as const;
  return (
    <section style={{ ...card, gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <h3 style={{ ...h3, flex: 1 }}>AI baholash navbati</h3>
        <span style={{ fontSize: 12, fontWeight: 800, padding: '3px 9px', borderRadius: 999, background: s.bg, color: s.fg }}>{s.t}</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
        <div style={box}><span style={lab}>Navbatda</span><b style={{ fontSize: 20 }}>{groupNum(a.queued)}</b></div>
        <div style={box}><span style={lab}>O&apos;rt. vaqt</span><b style={{ fontSize: 20 }}>{a.avgSec24h === null ? '—' : `${Math.round(a.avgSec24h)} s`}</b></div>
        <div style={box}><span style={lab}>Xato · 24s</span><b style={{ fontSize: 20, color: a.failed24h ? 'var(--err)' : undefined }}>{groupNum(a.failed24h)}</b></div>
      </div>
      <Link href="/attempts?status=ai_failed" style={{ fontSize: 13, fontWeight: 700 }}>Xato bergan urinishlar →</Link>
    </section>
  );
}

function OpenTickets({ d }: { d: DashboardRes }) {
  const t = d.openTickets;
  return (
    <section style={{ ...card, gap: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <h3 style={{ ...h3, flex: 1 }}>Ochiq murojaatlar</h3>
        <Link href="/tickets" style={{ fontSize: 13, fontWeight: 700 }}>{groupNum(t.count)} ta →</Link>
      </div>
      {t.latest.length === 0 && <span style={{ fontSize: 13, color: 'var(--ink2)' }}>Ochiq murojaat yo&apos;q.</span>}
      {t.latest.map((x) => (
        <Link key={x.id} href={`/tickets?open=${x.id}`} className="ma-hover-row" style={{ display: 'flex', flexDirection: 'column', gap: 2, padding: '10px 12px', borderRadius: 12, color: 'var(--ink)' }}>
          <span style={{ fontSize: 13, fontWeight: 700 }}>{x.subject}</span>
          <span style={{ fontSize: 12, color: 'var(--mut)', fontWeight: 600 }}>{ticketNo(x.no)} · {x.email} · {ago(x.createdAt).replace(/ oldin$/, '')}</span>
        </Link>
      ))}
    </section>
  );
}
