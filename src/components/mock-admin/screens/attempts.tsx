'use client';
/**
 * Admin Attempts.dc.html — T1 list (filters, default last 7 days), T2 drawer (sections, AI tasks),
 * T3 regrade (DONE → disabled with the H3 reason), T4 credit refund (reason required).
 */
import { useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { adminApi } from '@/lib/admin-mock/api';
import { newIdemKey } from '@/lib/admin-mock/http';
import { errText, isNotFound } from '@/lib/admin-mock/errors';
import { addDays, attemptNo, dayLabel, duration, examLabel, tashkentDay } from '@/lib/admin-mock/format';
import type { AdminAttemptRow, AttemptDetailRes } from '@/lib/admin-mock/types';
import { Button } from '../ui/button';
import { Drawer } from '../ui/drawer';
import { FilterOptions, FilterPill, Pager } from '../ui/filters';
import { EmptyState, ErrorState } from '../ui/state';
import { SkeletonRows } from '../ui/table';
import { useToast } from '../ui/toast';
import { attemptStatus, sectionLabel } from './attempt-shared';
import { useUrlState } from './hooks';
import { DateRange } from './orders';

const PAGE_SIZE = 25;
const today = () => tashkentDay();
const DEFAULTS = { exam: '', type: '', status: '', from: '', to: '', learnerId: '', page: '1', open: '' };
const EXAMS = [{ value: '', label: 'Hammasi' }, { value: 'ielts', label: 'IELTS' }, { value: 'sat', label: 'SAT' }, { value: 'cefr', label: 'CEFR' }] as const;
const TYPES = [{ value: '', label: 'Hammasi' }, { value: 'full', label: 'Full' }, { value: 'section', label: "Bo'lim" }, { value: 'free_section', label: "Bepul bo'lim" }] as const;
const STATUSES = [{ value: '', label: 'Hammasi' }, { value: 'in_progress', label: 'Davom etmoqda' }, { value: 'grading', label: 'AI baholamoqda' }, { value: 'completed', label: 'Yakunlandi' }, { value: 'ai_failed', label: 'AI xatosi' }, { value: 'expired', label: "Muddati o'tdi" }, { value: 'cancelled', label: 'Bekor qilingan' }] as const;
const TYPE_LABEL: Record<string, string> = { full: 'Full', section: "Bo'lim", free_section: "Bepul bo'lim" };
const th = { padding: '14px 10px', borderBottom: '1px solid var(--line)', fontWeight: 700 } as const;
const td = { padding: '12px 10px', borderBottom: '1px solid var(--line)' } as const;

export function chargeLabel(a: AdminAttemptRow) {
  const c = a.charge;
  const base = c.source === 'free' ? 'Bepul' : c.source === 'unlimited' ? 'Cheksiz' : c.source === 'order' ? c.orderReference ?? 'Buyurtma' : c.source === 'admin' ? 'Admin' : c.source === 'promo' ? 'Promo' : '—';
  return c.refunded ? `${base} · qaytarilgan` : base;
}
const testText = (a: AdminAttemptRow) => { const t = a.testTitle ?? a.testCode ?? '—'; return a.type !== 'full' && a.sectionKey ? `${t} · ${sectionLabel(a.sectionKey)}` : t; };

export function AttemptsScreen() {
  const [f, setF] = useUrlState(DEFAULTS);
  // default "Oxirgi 7 kun" unless the URL says otherwise (?from= empty means the default)
  const from = f.from || addDays(today(), -6);
  const to = f.to || today();
  const page = Math.max(1, Number(f.page) || 1);
  const query = { exam: f.exam, type: f.type, status: f.status, from: f.learnerId ? f.from : from, to: f.learnerId ? f.to : to, learnerId: f.learnerId, page, pageSize: PAGE_SIZE };
  const q = useQuery({ queryKey: ['am', 'attempts', query], queryFn: () => adminApi.attempts(query), placeholderData: (p) => p });
  const set = (patch: Partial<typeof DEFAULTS>) => setF({ page: '1', ...patch });
  const rows = q.data?.items ?? [];
  const dateValue = !f.from && !f.to ? 'Oxirgi 7 kun' : `${dayLabel(from)} – ${dayLabel(to)}`;

  return (
    <>
      <div className="ma-toolbar">
        <FilterPill label="Imtihon" value={EXAMS.find((x) => x.value === f.exam)?.label ?? 'Hammasi'} active={!!f.exam}>
          {(close) => <FilterOptions options={EXAMS} value={f.exam as (typeof EXAMS)[number]['value']} onPick={(v) => { set({ exam: v }); close(); }} />}
        </FilterPill>
        <FilterPill label="Turi" value={TYPES.find((x) => x.value === f.type)?.label ?? 'Hammasi'} active={!!f.type}>
          {(close) => <FilterOptions options={TYPES} value={f.type as (typeof TYPES)[number]['value']} onPick={(v) => { set({ type: v }); close(); }} />}
        </FilterPill>
        <FilterPill label="Holat" value={STATUSES.find((x) => x.value === f.status)?.label ?? 'Hammasi'} active={!!f.status}>
          {(close) => <FilterOptions options={STATUSES} value={f.status as (typeof STATUSES)[number]['value']} onPick={(v) => { set({ status: v }); close(); }} />}
        </FilterPill>
        <FilterPill label="Sana" value={dateValue} active={!!(f.from || f.to)}>
          {(close) => <DateRange from={from} to={to} onApply={(a, b) => { set({ from: a, to: b }); close(); }} />}
        </FilterPill>
        {f.learnerId && <button type="button" className="ma-btn v-text s-38" onClick={() => set({ learnerId: '' })}>Bitta o&apos;quvchi · tozalash</button>}
      </div>

      {q.isError && !q.data ? (
        <ErrorState flat title="Yuklab bo'lmadi" onRetry={() => q.refetch()} retrying={q.isFetching} />
      ) : q.data && rows.length === 0 ? (
        <EmptyState icon={false} title="Hali urinish yo'q" text="Filtrlarga mos urinish topilmadi." />
      ) : (
        <div style={{ borderRadius: 20, background: 'var(--paper)', overflowX: 'auto' }}>
          <table className="ma-table" style={{ minWidth: 1100 }}>
            <thead>
              <tr style={{ textAlign: 'left', color: 'var(--mut)', fontSize: 12 }}>
                <th style={{ ...th, padding: '14px 10px 14px 16px' }}>ID</th><th style={th}>O&apos;quvchi</th><th style={th}>Imtihon · test</th><th style={th}>Turi</th><th style={th}>Holat</th>
                <th style={{ ...th, textAlign: 'right' }}>Ball / band</th><th style={th}>Davomiylik</th><th style={{ ...th, padding: '14px 16px 14px 10px' }}>Kredit manbai</th>
              </tr>
            </thead>
            <tbody>
              {!q.data && <SkeletonRows cols={8} n={6} />}
              {rows.map((a) => {
                const s = attemptStatus(a.status);
                const on = f.open === a.id;
                return (
                  <tr key={a.id} className={on ? 'is-selected' : undefined} style={{ cursor: 'pointer' }} onClick={() => setF({ open: a.id })}>
                    <td style={{ ...td, padding: '12px 10px 12px 16px', fontWeight: 700, color: 'var(--blue)' }} className="ma-mono">
                      <button type="button" className="ma-linkbtn ma-mono" style={{ fontSize: 12 }} onClick={(e) => { e.stopPropagation(); setF({ open: a.id }); }}>{attemptNo(a.shortId)}</button>
                    </td>
                    <td style={{ ...td, fontWeight: 600, maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.learner.email ?? '—'}</td>
                    <td style={{ ...td, fontWeight: 600, whiteSpace: 'nowrap' }}>{testText(a)}</td>
                    <td style={{ ...td, color: 'var(--ink2)', fontWeight: 600, whiteSpace: 'nowrap' }}>{TYPE_LABEL[a.type] ?? a.type}</td>
                    <td style={td}><span className={`ma-chip t-${s.tone}`}>{s.t}</span></td>
                    <td style={{ ...td, textAlign: 'right', fontWeight: 800 }}>{a.score ? a.score.label ?? String(a.score.value) : '—'}</td>
                    <td style={{ ...td, color: 'var(--ink2)', fontWeight: 600 }}>{duration(a.durationSec)}</td>
                    <td style={{ ...td, padding: '12px 16px 12px 10px', color: 'var(--ink2)', fontWeight: 600, whiteSpace: 'nowrap' }}>{chargeLabel(a)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      {q.data && rows.length > 0 && <Pager page={page} pageSize={PAGE_SIZE} total={q.data.total} shown={rows.length} onPage={(p) => setF({ page: String(p) })} />}
      <AttemptDrawer id={f.open || null} onClose={() => setF({ open: '' })} />
    </>
  );
}

const ERR: Record<string, string> = {
  TIMEOUT: 'model javob bermadi (timeout)', QUOTA: 'provayder limiti tugadi', AUTH: 'provayder kaliti ishlamadi', PROVIDER: 'provayder xatosi',
  NO_AUDIO: 'audio yozilmagan', REFUSAL: 'model baholashdan bosh tortdi', OTHER: "noma'lum xato",
};
const taskDur = (s: number | null) => (s === null ? '' : s < 60 ? `${Math.round(s)} s` : `${Math.floor(s / 60)} daq ${Math.round(s % 60)} s`);

function taskLine(t: AttemptDetailRes['aiTasks'][number]): { t: string; fg: string } {
  if (t.status === 'DONE') return { t: ['Baholandi', t.score !== null ? String(t.score) : null, taskDur(t.durationSec) || null].filter(Boolean).join(' · '), fg: 'var(--ok)' };
  if (t.status === 'FAILED' || t.status === 'NEEDS_HUMAN') return { t: `Xato: ${ERR[t.errorCode ?? 'OTHER'] ?? ERR.OTHER} · ${t.tries} urinish`, fg: 'var(--err)' };
  if (t.status === 'RUNNING') return { t: 'Baholanmoqda', fg: 'var(--ai)' };
  return { t: 'Navbatda kutmoqda', fg: 'var(--warn)' };
}

function AttemptDrawer({ id, onClose }: { id: string | null; onClose: () => void }) {
  const qc = useQueryClient();
  const toast = useToast();
  const q = useQuery({ queryKey: ['am', 'attempt', id], queryFn: () => adminApi.attempt(id!), enabled: !!id, retry: (n, e) => !isNotFound(e) && n < 1 });
  const [reason, setReason] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const idemRefund = useMemo(() => (id ? newIdemKey() : ''), [id]);
  useEffect(() => { setReason(''); setErr(null); }, [id]);
  const d = q.data;
  const a = d?.attempt;
  const refresh = () => { void q.refetch(); void qc.invalidateQueries({ queryKey: ['am', 'attempts'] }); };

  async function regrade(taskKey: string, label: string) {
    setBusy(taskKey);
    try {
      await adminApi.regrade(id!, taskKey, newIdemKey());
      toast({ tone: 'ok', title: `${label} qayta baholash navbatiga qo'shildi` });
      refresh();
    } catch (e) {
      toast({ tone: 'err', title: "Navbatga qo'shilmadi", text: errText(e) });
    } finally {
      setBusy(null);
    }
  }
  async function refund() {
    if (reason.trim().length < 3) { setErr('Sababni yozing (kamida 3 belgi).'); return; }
    setBusy('refund');
    try {
      const r = await adminApi.refundCredit(id!, reason.trim(), idemRefund);
      const what = r.refunded === 'full' ? 'full kredit' : r.refunded === 'section' ? "bo'lim krediti" : "bepul bo'lim";
      toast({ tone: 'ok', title: `1 ta ${what} balansga qaytarildi` });
      onClose();
      void qc.invalidateQueries({ queryKey: ['am', 'attempts'] });
    } catch (e) {
      setErr(errText(e));
    } finally {
      setBusy(null);
    }
  }

  const s = a ? attemptStatus(a.status) : null;
  const unit = d?.refund.what === 'section' ? "bo'lim krediti" : d?.refund.what === 'free' ? "bepul bo'lim" : 'full kredit';
  return (
    <Drawer open={!!id} onClose={onClose}
      eyebrow={a ? attemptNo(a.shortId) : undefined}
      title={a ? testText(a) : isNotFound(q.error) ? 'Urinish topilmadi' : q.isError ? "Yuklab bo'lmadi" : '…'}
      sub={a ? <>{a.learner.email ?? '—'} · {TYPE_LABEL[a.type] ?? a.type}{a.learner.id && <> · <Link href={`/learners/${a.learner.id}`}>profil</Link></>}</> : undefined}>
      {q.isError && !d && !isNotFound(q.error) && <ErrorState flat title="Yuklab bo'lmadi" onRetry={() => q.refetch()} retrying={q.isFetching} />}
      {!d && !q.isError && <><span className="ma-skel" style={{ height: 24, width: '50%' }} /><span className="ma-skel" style={{ height: 70 }} /><span className="ma-skel" style={{ height: 160 }} /></>}
      {d && a && s && (
        <>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <span className={`ma-chip t-${s.tone}`}>{s.t}</span>
            <span className="ma-chip t-neutral" style={{ fontWeight: 700 }}>{chargeLabel(a)}</span>
          </div>
          {d.sections.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(4, d.sections.length)},1fr)`, gap: 8 }}>
              {d.sections.map((x) => (
                <div key={x.key} style={{ padding: '12px 10px', borderRadius: 14, boxShadow: 'var(--inset)', display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--mut)' }}>{x.label}</span>
                  <b style={{ fontSize: 20, color: x.score === null ? 'var(--mut)' : 'var(--ink)' }}>{x.score === null ? '—' : x.score}</b>
                </div>
              ))}
            </div>
          )}
          {d.aiTasks.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <b style={{ fontSize: 14 }}>AI baholash</b>
              {d.aiTasks.map((t) => {
                const line = taskLine(t);
                const done = t.status === 'DONE';
                const can = !done && t.regradable;
                return (
                  <div key={t.taskKey} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderRadius: 14, background: 'var(--paper)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1, minWidth: 0 }}>
                      <b style={{ fontSize: 13 }}>{t.label}</b>
                      <span style={{ fontSize: 12, color: line.fg, fontWeight: 700 }}>{line.t}</span>
                    </div>
                    <span title={done ? 'Baholangan — qayta baholash bir xil natija beradi' : undefined}>
                      <button type="button" className="ma-regrade" disabled={!can || busy === t.taskKey} aria-busy={busy === t.taskKey || undefined} onClick={() => regrade(t.taskKey, t.label)}>Qayta baholash</button>
                    </span>
                  </div>
                );
              })}
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: 16, borderRadius: 16, boxShadow: 'var(--inset)' }}>
            <b style={{ fontSize: 14 }}>Kreditni qaytarish</b>
            {d.refund.allowed ? (
              <>
                <span style={{ fontSize: 13, color: 'var(--ink2)', lineHeight: 1.5 }}>Texnik nosozlik bo&apos;lsa, sarflangan 1 ta {examLabel(a.exam)} {unit} balansga qaytariladi. Urinish &quot;Bekor qilingan&quot; deb belgilanadi.</span>
                <textarea rows={2} className={`ma-textarea${err ? ' is-error' : ''}`} style={{ borderRadius: 12, fontSize: 13 }} placeholder="Sabab (majburiy): masalan, Listening audio yuklanmadi" value={reason} maxLength={300} onChange={(e) => { setReason(e.target.value); setErr(null); }} aria-label="Sabab (majburiy)" />
                {err && <span className="ma-field-error s-sm" role="alert">{err}</span>}
                <Button variant="danger" size={40} style={{ fontWeight: 800 }} onClick={refund} loading={busy === 'refund'}>1 ta kreditni qaytarish</Button>
              </>
            ) : (
              <span style={{ fontSize: 13, color: 'var(--ink2)', lineHeight: 1.5 }}>
                {d.refund.reason === 'ALREADY_REFUNDED' ? 'Kredit allaqachon qaytarilgan.' : d.refund.reason === 'UNLIMITED' ? "Cheksiz paket bilan boshlangan — qaytariladigan kredit yo'q." : "Bu urinish uchun kreditni qaytarib bo'lmaydi."}
              </span>
            )}
          </div>
        </>
      )}
    </Drawer>
  );
}
