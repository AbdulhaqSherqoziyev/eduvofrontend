'use client';
/** Admin Stats.dc.html — S1 /stats/insights: weekly revenue by exam, currency/method split, cohorts, score histogram, AI cost vs budget. */
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/admin-mock/api';
import { errText, loadErrText } from '@/lib/admin-mock/errors';
import { dayLabel, groupNum } from '@/lib/admin-mock/format';
import type { InsightsRes } from '@/lib/admin-mock/types';
import { niceMax } from '../ui/chart';
import { ErrorState } from '../ui/state';

const card = { borderRadius: 24, boxShadow: 'var(--raise)', padding: 20, display: 'flex', flexDirection: 'column', gap: 14, minWidth: 0 } as const;
const h3 = { margin: 0, fontSize: 15, fontWeight: 800 } as const;
const MONTH_FULL = ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'];
const CUR_C: Record<string, string> = { UZS: 'var(--blue)', USD: 'var(--ai)', EUR: 'var(--ok)' };
const METHOD: Record<string, { l: string; c: string }> = { local: { l: "Mahalliy o'tkazma", c: 'var(--warn)' }, card: { l: 'Karta / Paddle', c: 'var(--blue)' }, wallet: { l: 'Hamyon', c: 'var(--ok)' } };
const pct0 = (x: number) => `${Math.round(x * 100)}%`;

export function StatsScreen() {
  const [scoreExam, setScoreExam] = useState<'ielts' | 'sat'>('ielts');
  const q = useQuery({ queryKey: ['am', 'insights', scoreExam], queryFn: () => adminApi.insights(scoreExam), placeholderData: (p) => p });
  if (q.isError && !q.data) return <ErrorState title="Ma'lumotlarni yuklab bo'lmadi" text={loadErrText(q.error, "Internet aloqasini tekshiring yoki qayta urinib ko'ring.")} onRetry={() => q.refetch()} retrying={q.isFetching} />;
  const grid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,460px),1fr))', gap: 20 } as const;
  if (!q.data) return <div style={grid} aria-busy="true">{[260, 260, 240, 260].map((h, i) => <span key={i} className="ma-skel on-bg" style={{ height: h, borderRadius: 24 }} />)}<span className="ma-skel on-bg" style={{ height: 240, borderRadius: 24, gridColumn: '1/-1' }} /></div>;
  const d = q.data;
  return (
    <div style={grid}>
      <Weekly d={d} />
      <Splits d={d} />
      <Cohorts d={d} />
      <Scores d={d} exam={scoreExam} onExam={setScoreExam} />
      <AiCost d={d} />
    </div>
  );
}

function Legend({ items }: { items: Array<{ l: string; c: string }> }) {
  return (
    <div style={{ display: 'flex', gap: 12, fontSize: 12, fontWeight: 700, color: 'var(--ink2)', flexWrap: 'wrap' }}>
      {items.map((x) => <span key={x.l} style={{ display: 'flex', gap: 6, alignItems: 'center' }}><i style={{ width: 10, height: 10, borderRadius: 3, background: x.c }} />{x.l}</span>)}
    </div>
  );
}

function Weekly({ d }: { d: InsightsRes }) {
  const weeks = d.weeklyRevenue.weeks;
  const cefr = weeks.some((w) => (w.byExam.cefr ?? 0) > 0);
  const max = niceMax(Math.max(1, ...weeks.map((w) => (w.byExam.ielts ?? 0) + (w.byExam.sat ?? 0) + (w.byExam.cefr ?? 0))));
  const pctH = (v: number) => `${(v / max) * 100}%`;
  return (
    <section style={card}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <h3 style={{ ...h3, flex: 1 }}>Daromad · imtihon bo&apos;yicha (haftalar, mln so&apos;m ekv.)</h3>
        <Legend items={[{ l: 'IELTS', c: 'var(--blue)' }, { l: 'SAT', c: 'var(--ai)' }, ...(cefr ? [{ l: 'CEFR', c: 'var(--ok)' }] : [])]} />
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 200, paddingTop: 10, borderBottom: '1px solid var(--line)' }} role="img"
        aria-label={`Haftalik daromad: ${weeks.map((w) => `H${w.isoWeek} ${((w.byExam.ielts + w.byExam.sat + (w.byExam.cefr ?? 0)) / 1e6).toFixed(1)} mln`).join(', ')}`}>
        {weeks.map((w) => (
          <div key={w.isoWeek} style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', height: '100%', gap: 2 }} title={`H${w.isoWeek}: IELTS ${groupNum(w.byExam.ielts)} · SAT ${groupNum(w.byExam.sat)} so'm ekv.`}>
            {cefr && <div style={{ height: pctH(w.byExam.cefr ?? 0), background: 'var(--ok)', borderRadius: '6px 6px 2px 2px' }} />}
            <div style={{ height: pctH(w.byExam.sat ?? 0), background: 'var(--ai)', borderRadius: cefr ? 2 : '6px 6px 2px 2px' }} />
            <div style={{ height: pctH(w.byExam.ielts ?? 0), background: 'var(--blue)', borderRadius: 2 }} />
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 10, fontSize: 11, fontWeight: 700, color: 'var(--mut)' }}>
        {weeks.map((w) => <span key={w.isoWeek} style={{ flex: 1, textAlign: 'center' }}>H{w.isoWeek}</span>)}
      </div>
    </section>
  );
}

function Splits({ d }: { d: InsightsRes }) {
  const rows = [
    { t: 'Valyuta', parts: d.splits30d.currency.map((x) => ({ l: x.currency, v: x.share, c: CUR_C[x.currency] ?? 'var(--mut)' })) },
    { t: 'Usul', parts: d.splits30d.method.map((x) => ({ l: METHOD[x.methodGroup]?.l ?? x.methodGroup, v: x.share, c: METHOD[x.methodGroup]?.c ?? 'var(--mut)' })) },
  ];
  return (
    <section style={{ ...card, gap: 16 }}>
      <h3 style={h3}>Valyuta va to&apos;lov usuli · 30 kun</h3>
      {rows.map((s) => (
        <div key={s.t} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--mut)' }}>{s.t}</span>
          {s.parts.length === 0 ? <span style={{ fontSize: 13, color: 'var(--ink2)' }}>To&apos;lov yo&apos;q.</span> : (
            <>
              <div style={{ display: 'flex', height: 14, borderRadius: 999, overflow: 'hidden', gap: 2 }}>{s.parts.map((p) => <div key={p.l} style={{ width: pct0(p.v), background: p.c }} />)}</div>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 12, fontWeight: 700 }}>
                {s.parts.map((p) => <span key={p.l} style={{ display: 'flex', gap: 6, alignItems: 'center' }}><i style={{ width: 10, height: 10, borderRadius: 3, background: p.c }} />{p.l} <span style={{ color: 'var(--mut)' }}>{pct0(p.v)}</span></span>)}
              </div>
            </>
          )}
        </div>
      ))}
    </section>
  );
}

function Cohorts({ d }: { d: InsightsRes }) {
  const months = d.cohorts.months;
  const cols = Math.max(1, ...months.map((m) => m.retention.length));
  return (
    <section style={{ ...card, gap: 12 }}>
      <h3 style={h3}>Kogorta: takroriy to&apos;lov (oylar)</h3>
      <div style={{ overflowX: 'auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: `90px repeat(${cols},minmax(52px,1fr))`, gap: 4, fontSize: 12, minWidth: 380 }}>
          <span />
          {Array.from({ length: cols }, (_, i) => <span key={i} style={{ textAlign: 'center', color: 'var(--mut)', fontWeight: 700 }}>M{i}</span>)}
          {months.map((m) => (
            <Row key={m.month} label={MONTH_FULL[Number(m.month.slice(5, 7)) - 1] ?? m.month} size={m.size} cells={Array.from({ length: cols }, (_, i) => m.retention[i] ?? null)} />
          ))}
        </div>
      </div>
    </section>
  );
}
function Row({ label, size, cells }: { label: string; size: number; cells: Array<number | null> }) {
  return (
    <>
      <span style={{ fontWeight: 700, color: 'var(--ink2)', display: 'flex', alignItems: 'center' }} title={`${groupNum(size)} o'quvchi`}>{label}</span>
      {cells.map((v, i) => (
        <span key={i} style={{
          height: 34, borderRadius: 8, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: v === null ? 'transparent' : v >= 100 ? 'var(--blue)' : `color-mix(in oklab, var(--blue) ${Math.round(v * 2.2 + 8)}%, var(--paper))`,
          color: v === null ? 'var(--mut)' : v > 20 ? '#fff' : 'var(--ink)',
        }}>{v === null ? '' : `${Math.round(v)}%`}</span>
      ))}
    </>
  );
}

function Scores({ d, exam, onExam }: { d: InsightsRes; exam: 'ielts' | 'sat'; onExam: (e: 'ielts' | 'sat') => void }) {
  const s = d.scoreDistribution;
  const max = Math.max(1, ...s.bins.map((b) => b.n));
  const medIdx = s.median === null ? -1 : s.bins.findIndex((b) => s.median! >= b.from && s.median! < b.to + (b === s.bins[s.bins.length - 1] ? 1e9 : 0));
  return (
    <section style={{ ...card, gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <h3 style={{ ...h3, flex: 1 }}>Ball taqsimoti · {exam === 'ielts' ? 'IELTS overall band' : 'SAT total score'}</h3>
        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--mut)' }}>n = {groupNum(s.n)}{s.median !== null ? ` · median ${exam === 'ielts' ? s.median.toFixed(1) : s.median}` : ''}</span>
        <div className="ma-seg s-32" role="group" aria-label="Imtihon" style={{ padding: 3 }}>
          <button type="button" style={{ height: 28 }} aria-pressed={exam === 'ielts'} onClick={() => onExam('ielts')}>IELTS</button>
          <button type="button" style={{ height: 28 }} aria-pressed={exam === 'sat'} onClick={() => onExam('sat')}>SAT</button>
        </div>
      </div>
      {s.n === 0 ? <span style={{ fontSize: 13, color: 'var(--ink2)', padding: '40px 0', textAlign: 'center' }}>Hali yakunlangan full mock yo&apos;q.</span> : (
        <>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 180, borderBottom: '1px solid var(--line)' }}>
            {s.bins.map((b, i) => <div key={b.label} title={`${b.label}: ${groupNum(b.n)}`} style={{ flex: 1, height: `${(b.n / max) * 100}%`, background: i === medIdx ? 'var(--blue)' : 'color-mix(in oklab, var(--blue) 55%, var(--paper))', borderRadius: '6px 6px 0 0' }} />)}
          </div>
          <div style={{ display: 'flex', gap: 6, fontSize: 11, fontWeight: 700, color: 'var(--mut)' }}>
            {s.bins.map((b) => <span key={b.label} style={{ flex: 1, textAlign: 'center' }}>{b.label}</span>)}
          </div>
        </>
      )}
    </section>
  );
}

function AiCost({ d }: { d: InsightsRes }) {
  const days = d.aiCost.days;
  const budget = d.aiCost.budgetUsdPerDay;
  const top = Math.max(1, ...days.map((x) => x.usd), budget ?? 0) * 1.5;
  const H = 180, W = 900;
  const step = days.length ? W / days.length : W;
  const bw = Math.max(4, step - 8);
  const y = (v: number) => H - (v / top) * H;
  const labels = days.length ? [days[0], days[Math.floor(days.length / 2)], days[days.length - 1]] : [];
  return (
    <section style={{ ...card, gap: 12, gridColumn: '1/-1' }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <h3 style={{ ...h3, flex: 1 }}>AI baholash xarajati · kunlik{budget !== null ? ` vs byudjet ($${budget}/kun)` : ''}</h3>
        {d.aiCost.overBudgetDays > 0 && <span style={{ fontSize: 12, fontWeight: 800, padding: '3px 9px', borderRadius: 999, background: 'var(--warnBg)', color: 'var(--warn)' }}>{d.aiCost.overBudgetDays} kun byudjetdan oshdi</span>}
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ width: '100%', height: 180, display: 'block' }} role="img"
        aria-label={`AI xarajati, oxirgi ${days.length} kun. Jami $${days.reduce((a, x) => a + x.usd, 0).toFixed(2)}.`}>
        <path d={`M0 45H${W}M0 90H${W}M0 135H${W}`} stroke="var(--line)" />
        {days.map((x, i) => (
          <rect key={x.date} x={i * step + 4} y={y(x.usd)} width={bw} height={H - y(x.usd)} rx={4} fill={budget !== null && x.usd > budget ? 'var(--err)' : 'var(--ai)'}>
            <title>{`${dayLabel(x.date)}: $${x.usd.toFixed(2)}`}</title>
          </rect>
        ))}
        {budget !== null && <path d={`M0 ${y(budget)}H${W}`} stroke="var(--err)" strokeWidth="2" strokeDasharray="6 6" vectorEffect="non-scaling-stroke" />}
      </svg>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 700, color: 'var(--mut)' }}>
        {labels.map((x, i) => <span key={i}>{dayLabel(x.date)}</span>)}
      </div>
    </section>
  );
}
