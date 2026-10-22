'use client';
/**
 * §10 "Imtihonlar" (database only): per-exam table (Boshlandi / Tugatdi / Tugatmadi / Jarayonda) and
 * "Qaysi bo'limda to'xtashdi" for ONE exam — aggregate only, no links to attempts, no "why" (T3, T4, M4).
 */
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/admin-mock/api';
import { examLabel, groupNum, ratioView } from '@/lib/admin-mock/format';
import type { AnExamsRes } from '@/lib/admin-mock/types';
import { Segmented } from '../../ui/controls';
import { FilterOptions, FilterPill } from '../../ui/filters';
import { ErrorState, InlineEmpty } from '../../ui/state';
import { Skeleton, SkeletonRows, Table, TableWrap } from '../../ui/table';
import { Card, DesktopOnly, Dim, mutedText, Note, QueryError, TextButton } from './blocks';
import { AnalyticsFooter } from './footer';
import { shorterThan, type Period } from './period';
import { T } from './texts';

type ExType = 'full' | 'section';
type ExPay = 'all' | 'free' | 'paid';
const asType = (v: string): ExType => (v === 'section' ? 'section' : 'full');
const asPay = (v: string): ExPay => (v === 'free' || v === 'paid' ? v : 'all');
const BASE_EXAMS = ['ielts', 'sat'];

export function ExamFilters({ data, exam, type, pay, mob, set }: {
  data: AnExamsRes | undefined; exam: string; type: string; pay: string; mob: boolean;
  set: (p: { exam?: string; type?: string; pay?: string }) => void;
}) {
  const rows = data?.exams ?? [];
  const exams = rows.length ? rows.map((e) => e.exam) : BASE_EXAMS;
  const labelOf = (e: string) => rows.find((r) => r.exam === e)?.label || examLabel(e);
  const selected = exam || data?.selected || 'ielts';
  const p = asPay(pay);
  const wrap = mob ? 'ma-an-seg-full' : undefined;
  return (
    <>
      <div className={wrap}>
        <Segmented small label={T.ex.exam} value={selected} onChange={(v) => set({ exam: v })} options={exams.map((e) => ({ value: e, label: labelOf(e) }))} />
      </div>
      <div className={wrap}>
        <Segmented small label={T.ex.type} value={asType(type)} onChange={(v) => set({ type: v === 'full' ? '' : v })}
          options={[{ value: 'full', label: T.ex.full }, { value: 'section', label: T.ex.section }]} />
      </div>
      {mob ? <DesktopOnly>{T.ex.mobilePay}</DesktopOnly> : (
        <FilterPill label={T.ex.pay} value={p === 'all' ? T.ex.payAll : p === 'free' ? T.ex.free : T.ex.paid} active={p !== 'all'} align="right">
          {(close) => (
            <FilterOptions value={p} onPick={(v) => { set({ pay: v === 'all' ? '' : v }); close(); }}
              options={[{ value: 'all', label: T.ex.payAll }, { value: 'free', label: T.ex.free }, { value: 'paid', label: T.ex.paid }]} />
          )}
        </FilterPill>
      )}
    </>
  );
}

export function useExams(period: Period, exam: string, type: string, pay: string, mob: boolean, enabled: boolean) {
  const query = period.query ? { ...period.query, exam: exam || undefined, type: asType(type), pay: mob ? 'all' : asPay(pay) } : null;
  return useQuery({
    queryKey: ['am', 'an', 'exams', query],
    queryFn: () => adminApi.anExams(query!),
    enabled: enabled && !!query,
    placeholderData: (p) => p,
  });
}

export function TabExams({ q, period, mob, type, setExam, show90 }: {
  q: ReturnType<typeof useExams>; period: Period; mob: boolean; type: string; setExam: (e: string) => void; show90: () => void;
}) {
  if (q.isError && !q.data) return <QueryError q={q} />;
  if (!q.data) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }} aria-busy="true">
        <TableWrap><Table><tbody><SkeletonRows cols={5} n={3} /></tbody></Table></TableWrap>
        <Skeleton height={280} />
      </div>
    );
  }
  const d = q.data;
  const s = d.stops;
  const sel = d.selected ?? s?.exam ?? 'ielts';
  const selLabel = s?.label || d.exams.find((e) => e.exam === sel)?.label || examLabel(sel);
  const t = asType(type);
  return (
    <Dim on={q.isFetching && q.isPlaceholderData}>
      <Card title={T.ex.tableTitle}>
        {mob ? <ExamCards d={d} sel={sel} onPick={setExam} /> : <ExamTable d={d} sel={sel} onPick={setExam} />}
      </Card>
      <Card title={T.ex.stopsTitle(selLabel, t === 'full' ? T.ex.full : T.ex.section)}>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink2)' }}>{T.ex.whereNotWhy}</span>
        {d.dbError || !s ? <ErrorState flat title={T.state.loadErr} text={T.state.loadErrText} onRetry={() => void q.refetch()} retrying={q.isFetching} />
        : s.completed + s.notCompleted + s.inProgress === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <InlineEmpty title={T.ex.none(selLabel)} />
            {shorterThan(period, 90) && <TextButton onClick={show90}>{T.state.show90}</TextButton>}
          </div>
        ) : (
          <>
            {s.notCompleted === 0 ? <InlineEmpty title={T.ex.noStops} /> : <StageBars s={s} section={t === 'section'} mob={mob} />}
            <span style={{ ...mutedText, fontSize: 12 }}>{T.ex.summary(groupNum(s.notCompleted), groupNum(s.completed), groupNum(s.inProgress))}</span>
          </>
        )}
      </Card>
      <Note>{T.ex.dbNote}</Note>
      <AnalyticsFooter kind="db" />
    </Dim>
  );
}

/** "Tugatdi"/"Tugatmadi" share of finished + unfinished (in progress excluded) */
function Share({ n, den }: { n: number; den: number }) {
  if (!den) return null;
  const r = ratioView(n, den);
  return <span style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--mut)' }}>{r.pct ?? r.frac}</span>;
}

function ExamTable({ d, sel, onPick }: { d: AnExamsRes; sel: string; onPick: (e: string) => void }) {
  const num = { textAlign: 'right', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' } as const;
  return (
    <TableWrap radius={20}>
      <Table minWidth={560}>
        <thead>
          <tr>
            <th scope="col">{T.ex.exam}</th>
            <th scope="col" style={{ textAlign: 'right' }}>{T.ex.started}</th>
            <th scope="col" style={{ textAlign: 'right' }}>{T.ex.completed}</th>
            <th scope="col" style={{ textAlign: 'right' }}>{T.ex.notCompleted}</th>
            <th scope="col" style={{ textAlign: 'right' }}>{T.ex.inProgress}</th>
          </tr>
        </thead>
        <tbody>
          {d.exams.map((e) => {
            const den = e.completed + e.notCompleted;
            return (
              <tr key={e.exam} className={e.exam === sel ? 'is-selected' : undefined} onClick={() => onPick(e.exam)} style={{ cursor: 'pointer' }}>
                <td>
                  <button type="button" onClick={(ev) => { ev.stopPropagation(); onPick(e.exam); }} aria-pressed={e.exam === sel}
                    style={{ border: 0, background: 'transparent', padding: 0, font: 'inherit', fontWeight: 700, color: 'var(--ink)', cursor: 'pointer' }}>
                    {e.label || examLabel(e.exam)}
                  </button>
                </td>
                <td style={num}>{groupNum(e.started)}</td>
                <td style={num}>{groupNum(e.completed)}<Share n={e.completed} den={den} /></td>
                <td style={num}>{groupNum(e.notCompleted)}<Share n={e.notCompleted} den={den} /></td>
                <td style={num}>{groupNum(e.inProgress)}</td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </TableWrap>
  );
}

function ExamCards({ d, sel, onPick }: { d: AnExamsRes; sel: string; onPick: (e: string) => void }) {
  const kv = (k: string, v: number, share?: React.ReactNode) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
      <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--mut)' }}>{k}</span>
      <b style={{ fontSize: 16, fontWeight: 800 }}>{groupNum(v)}</b>
      {share}
    </div>
  );
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {d.exams.map((e) => {
        const den = e.completed + e.notCompleted;
        const on = e.exam === sel;
        return (
          <button key={e.exam} type="button" onClick={() => onPick(e.exam)} aria-pressed={on}
            style={{ textAlign: 'left', border: 0, font: 'inherit', color: 'var(--ink)', borderRadius: 16, padding: '12px 14px', background: on ? 'var(--bg)' : 'var(--paper)', boxShadow: on ? 'var(--inset)' : 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <b style={{ fontSize: 14, fontWeight: 800 }}>{e.label || examLabel(e.exam)}</b>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 10 }}>
              {kv(T.ex.started, e.started)}
              {kv(T.ex.completed, e.completed, <Share n={e.completed} den={den} />)}
              {kv(T.ex.notCompleted, e.notCompleted, <Share n={e.notCompleted} den={den} />)}
              {kv(T.ex.inProgress, e.inProgress)}
            </div>
          </button>
        );
      })}
    </div>
  );
}

/** §10.4 bars in stage order; width = row / largest row; percent of "Tugatmadi" only when ≥ 20 (§18.6) */
function StageBars({ s, section, mob }: { s: NonNullable<AnExamsRes['stops']>; section: boolean; mob: boolean }) {
  const rows = [
    { key: '_none', label: section ? T.ex.notStartedSection : T.ex.notStarted, n: s.notStarted },
    ...[...s.stages].sort((a, b) => a.order - b.order).map((g) => ({ key: g.key, label: section ? T.ex.stoppedIn(g.label) : g.label, n: g.n })),
  ];
  const max = Math.max(1, ...rows.map((r) => r.n));
  const line = (label: string, n: number, withPct: boolean, key: string) => {
    const r = ratioView(n, s.notCompleted);
    const text = withPct ? (r.pct ? <>{groupNum(n)} <span style={{ color: 'var(--mut)', fontWeight: 600 }}>· {r.pct}</span></> : r.frac) : groupNum(n);
    const bar = (
      <div style={{ height: 10, borderRadius: 999, background: 'var(--hover)', overflow: 'hidden', minWidth: 0 }} aria-hidden="true">
        {n > 0 && <div style={{ height: '100%', width: `${Math.max(2, (n / max) * 100)}%`, borderRadius: 999, background: n === max ? 'var(--blue)' : 'color-mix(in oklab, var(--blue) 55%, var(--paper))' }} />}
      </div>
    );
    if (mob) {
      return (
        <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontSize: 13, fontWeight: 700 }}>{label}</span>
          {bar}
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink2)' }}>{text}</span>
        </div>
      );
    }
    return (
      <div key={key} style={{ display: 'grid', gridTemplateColumns: 'minmax(160px,240px) minmax(0,1fr) 120px', gap: 14, alignItems: 'center' }}>
        <span style={{ fontSize: 13, fontWeight: 700 }}>{label}</span>
        {bar}
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink2)', textAlign: 'right', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>{text}</span>
      </div>
    );
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: mob ? 14 : 12 }}>
      {rows.map((r) => line(r.label, r.n, true, r.key))}
      {s.separateMissed.filter((m) => m.n > 0).map((m) => line(`${m.label} · ${T.ex.speakingExpired}`, m.n, false, `_missed_${m.key}`))}
    </div>
  );
}
