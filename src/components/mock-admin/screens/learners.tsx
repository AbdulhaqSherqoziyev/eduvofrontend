'use client';
/** Admin Learners.dc.html — L1 /learners: search (email/name), filters, table, pager; loading/empty/error. */
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/admin-mock/api';
import { AdminApiError } from '@/lib/admin-mock/http';
import { ago, dayMonth, examLabel, flag, groupNum, moneyList } from '@/lib/admin-mock/format';
import type { AdminLearnerRow } from '@/lib/admin-mock/types';
import { StatusChip, type Tone } from '../ui/chip';
import { FilterOptions, FilterPill, Pager } from '../ui/filters';
import { EmptyState, ErrorState } from '../ui/state';
import { SkeletonRows } from '../ui/table';
import { useUrlState } from './hooks';
import { LB_STATE } from './learner-leaderboard';

const PAGE_SIZE = 25;
const DEFAULTS = { q: '', status: '', country: '', balance: '', verified: '', lb: '', page: '1' };
export const LEARNER_STATUS: Record<string, { t: string; tone: Tone }> = {
  ACTIVE: { t: 'Faol', tone: 'ok' },
  LOCKED: { t: 'Bloklangan', tone: 'err' },
  DELETION_PENDING: { t: "O'chirish kutilmoqda", tone: 'warn' },
  DELETED: { t: "O'chirilgan", tone: 'neutral' },
};
const STATUSES = [{ value: '', label: 'Hammasi' }, { value: 'ACTIVE', label: 'Faol' }, { value: 'LOCKED', label: 'Bloklangan' }, { value: 'DELETION_PENDING', label: "O'chirish kutilmoqda" }, { value: 'DELETED', label: "O'chirilgan" }] as const;
const BALANCES = [{ value: '', label: 'Hammasi' }, { value: 'has_credits', label: 'Krediti bor' }, { value: 'zero', label: 'Balans 0' }, { value: 'unlimited', label: 'Cheksiz' }] as const;
const VERIFIED = [{ value: '', label: 'Hammasi' }, { value: 'true', label: 'Tasdiqlangan' }, { value: 'false', label: 'Tasdiqlanmagan' }] as const;
const th = { padding: '14px 10px', borderBottom: '1px solid var(--line)', fontWeight: 700 } as const;
const td = { padding: '12px 10px', borderBottom: '1px solid var(--line)' } as const;

export function balanceChips(b: AdminLearnerRow['balances']) {
  return b.map((x) => {
    const e = examLabel(x.exam);
    if (x.unlimitedUntil && Date.parse(x.unlimitedUntil) > Date.now()) return { t: `${e} cheksiz · ${dayMonth(x.unlimitedUntil)}`, tone: 'ai' as const };
    if (!x.fullMocks && !x.sections) return { t: `${e} 0`, tone: 'muted' as const };
    return { t: `${e} ${[x.fullMocks ? `${x.fullMocks} full` : null, x.sections ? `${x.sections} bo'lim` : null].filter(Boolean).join(' · ')}`, tone: 'ok' as const };
  });
}

export const goalText = (g: AdminLearnerRow['goal']) =>
  g ? `${examLabel(g.exam)} ${g.target !== null && g.target !== undefined ? (g.exam === 'ielts' ? g.target.toFixed(1) : g.target) : '—'} · ${g.examDate ? g.examDate.slice(0, 10) : '—'}` : '—';

export function LearnersScreen() {
  const [f, setF] = useUrlState(DEFAULTS);
  const [text, setText] = useState(f.q);
  const page = Math.max(1, Number(f.page) || 1);
  useEffect(() => {
    const t = window.setTimeout(() => { if (text.trim() !== f.q) setF({ q: text.trim(), page: '1' }); }, 350);
    return () => window.clearTimeout(t);
  }, [text, f.q, setF]);
  const query = { q: f.q, status: f.status, country: f.country, balance: f.balance, verified: f.verified, lb: f.lb || undefined, page, pageSize: PAGE_SIZE };
  // leaderboard §9.2: "Ism tekshiruvda" filter shows its count
  const flagged = useQuery({ queryKey: ['am', 'learners', 'lb-counts'], queryFn: () => adminApi.lbCounts(), staleTime: 60_000, retry: false });
  const flaggedN = flagged.data?.nameFlagged;
  const LB_OPTS = [{ value: '', label: 'Hammasi' }, { value: 'name_flagged', label: flaggedN != null ? `Ism tekshiruvda (${groupNum(flaggedN)})` : 'Ism tekshiruvda' }] as const;
  const q = useQuery({ queryKey: ['am', 'learners', query], queryFn: () => adminApi.learners(query), placeholderData: (p) => p });
  const set = (patch: Partial<typeof DEFAULTS>) => setF({ page: '1', ...patch });
  const rows = q.data?.items ?? [];
  const st = q.error instanceof AdminApiError ? q.error.status : 0;

  return (
    <>
      <div className="ma-toolbar">
        <label className="ma-search" style={{ height: 40, width: 'min(320px,100%)' }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M11 18a7 7 0 100-14 7 7 0 000 14M21 21l-5-5" /></svg>
          <input placeholder="Email yoki ism" value={text} onChange={(e) => setText(e.target.value)} aria-label="O'quvchi qidirish" maxLength={254} />
        </label>
        <FilterPill label="Holat" value={STATUSES.find((x) => x.value === f.status)?.label ?? 'Hammasi'} active={!!f.status}>
          {(close) => <FilterOptions options={STATUSES} value={f.status as (typeof STATUSES)[number]['value']} onPick={(v) => { set({ status: v }); close(); }} />}
        </FilterPill>
        <FilterPill label="Mamlakat" value={f.country ? `${flag(f.country)} ${f.country}` : 'Hammasi'} active={!!f.country}>
          {(close) => <CountryInput value={f.country} onApply={(v) => { set({ country: v }); close(); }} />}
        </FilterPill>
        <FilterPill label="Balans" value={BALANCES.find((x) => x.value === f.balance)?.label ?? 'Hammasi'} active={!!f.balance}>
          {(close) => <FilterOptions options={BALANCES} value={f.balance as (typeof BALANCES)[number]['value']} onPick={(v) => { set({ balance: v }); close(); }} />}
        </FilterPill>
        <FilterPill label="Email" value={VERIFIED.find((x) => x.value === f.verified)?.label ?? 'Hammasi'} active={!!f.verified}>
          {(close) => <FilterOptions options={VERIFIED} value={f.verified as (typeof VERIFIED)[number]['value']} onPick={(v) => { set({ verified: v }); close(); }} />}
        </FilterPill>
        <FilterPill label="Reyting" value={LB_OPTS.find((x) => x.value === f.lb)?.label ?? 'Hammasi'} active={!!f.lb}>
          {(close) => <FilterOptions options={LB_OPTS} value={f.lb as (typeof LB_OPTS)[number]['value']} onPick={(v) => { set({ lb: v }); close(); }} />}
        </FilterPill>
        <span style={{ flex: 1 }} />
        {q.data && <span style={{ fontSize: 13, color: 'var(--ink2)', fontWeight: 600 }}>{groupNum(q.data.total)} o&apos;quvchi</span>}
      </div>

      {q.isError && !q.data ? (
        <ErrorState flat title="Ro'yxatni yuklab bo'lmadi" text={st >= 500 ? `Server xatosi (${st}).` : "Tarmoq xatosi. Qayta urinib ko'ring."} onRetry={() => q.refetch()} retrying={q.isFetching} />
      ) : q.data && rows.length === 0 ? (
        <EmptyState icon={false} title="O'quvchi topilmadi" text={f.q ? `"${f.q}" bo'yicha hech kim yo'q. Qidiruvni o'zgartiring.` : "Filtrlarga mos o'quvchi yo'q."} />
      ) : (
        <div style={{ borderRadius: 20, background: 'var(--paper)', overflowX: 'auto' }}>
          <table className="ma-table" style={{ minWidth: 1180 }}>
            <thead>
              <tr style={{ textAlign: 'left', color: 'var(--mut)', fontSize: 12 }}>
                <th style={{ ...th, padding: '14px 10px 14px 16px' }}>O&apos;quvchi</th>
                <th style={th}>Mamlakat · til</th>
                <th style={th}>Maqsad</th>
                <th style={th}>Email</th>
                <th style={th}>Balans</th>
                <th style={{ ...th, textAlign: 'right' }}>Jami to&apos;lov</th>
                <th style={th}>Oxirgi faollik</th>
                <th style={{ ...th, padding: '14px 16px 14px 10px' }}>Holat</th>
              </tr>
            </thead>
            <tbody>
              {!q.data && <SkeletonRows cols={8} n={7} />}
              {rows.map((l) => {
                const s = LEARNER_STATUS[l.status] ?? { t: l.status, tone: 'neutral' as Tone };
                return (
                  <tr key={l.id}>
                    <td style={{ ...td, padding: '12px 10px 12px 16px', maxWidth: 260 }}>
                      <Link href={`/learners/${l.id}`} style={{ display: 'flex', flexDirection: 'column', minWidth: 0, color: 'var(--ink)' }}>
                        <b style={{ fontSize: 13 }}>{l.displayName ?? '—'}</b>
                        <span title={l.email ?? ''} style={{ color: 'var(--ink2)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.email ?? '—'}</span>
                      </Link>
                    </td>
                    <td style={{ ...td, whiteSpace: 'nowrap', fontWeight: 600 }}>{l.country ? `${flag(l.country)} ${l.country}` : '—'} <span style={{ color: 'var(--mut)' }}>· {l.locale}</span></td>
                    <td style={{ ...td, whiteSpace: 'nowrap', color: 'var(--ink2)', fontWeight: 600 }}>{goalText(l.goal)}</td>
                    <td style={{ ...td, fontWeight: 800, color: l.emailVerified ? 'var(--ok)' : 'var(--err)' }} aria-label={l.emailVerified ? 'Tasdiqlangan' : 'Tasdiqlanmagan'}>{l.emailVerified ? '✓' : '✗'}</td>
                    <td style={td}>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {balanceChips(l.balances).map((b) => <span key={b.t} className={`ma-chip s-sm t-${b.tone}`}>{b.t}</span>)}
                      </div>
                    </td>
                    <td style={{ ...td, textAlign: 'right', fontWeight: 800, whiteSpace: 'nowrap' }}>{l.paidTotal.length ? moneyList(l.paidTotal) : "0 so'm"}</td>
                    <td style={{ ...td, color: 'var(--ink2)', fontWeight: 600, whiteSpace: 'nowrap' }}>{ago(l.lastActiveAt)}</td>
                    <td style={{ ...td, padding: '12px 16px 12px 10px' }}>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        <StatusChip tone={s.tone}>{s.t}</StatusChip>
                        {(l.lbState === 'name_flagged' || l.lbState === 'removed') && <StatusChip tone={LB_STATE[l.lbState].tone}>{LB_STATE[l.lbState].t}</StatusChip>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      {q.data && rows.length > 0 && <Pager page={page} pageSize={PAGE_SIZE} total={q.data.total} shown={rows.length} onPage={(p) => setF({ page: String(p) })} />}
    </>
  );
}

function CountryInput({ value, onApply }: { value: string; onApply: (v: string) => void }) {
  const [v, setV] = useState(value);
  const ok = v === '' || /^[A-Za-z]{2}$/.test(v);
  return (
    <form style={{ display: 'flex', gap: 8, padding: 4 }} onSubmit={(e) => { e.preventDefault(); if (ok) onApply(v.toUpperCase()); }}>
      <input className={`ma-input${ok ? '' : ' is-error'}`} style={{ height: 38, width: 120 }} value={v} onChange={(e) => setV(e.target.value)} placeholder="UZ" aria-label="Mamlakat kodi (2 harf)" autoFocus maxLength={2} />
      <button type="submit" className="ma-btn v-primary s-38" disabled={!ok}>OK</button>
    </form>
  );
}
