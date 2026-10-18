'use client';
/** Admin Audit.dc.html — U1 /actions (admin / group / date filters, pager), U2 CSV export. */
import Link from 'next/link';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/admin-mock/api';
import { saveBlob } from '@/lib/admin-mock/http';
import { errText, loadErrText } from '@/lib/admin-mock/errors';
import { amount, dateTime, dayLabel, tashkentDay } from '@/lib/admin-mock/format';
import type { AuditItem } from '@/lib/admin-mock/types';
import { useAdminShell } from '../shell/context';
import { Button } from '../ui/button';
import { FilterOptions, FilterPill, Pager } from '../ui/filters';
import { EmptyState, ErrorState } from '../ui/state';
import { SkeletonRows } from '../ui/table';
import { useToast } from '../ui/toast';
import { useUrlState } from './hooks';
import { shortName } from './order-detail';
import { DateRange } from './orders';

const PAGE_SIZE = 50;
const DEFAULTS = { adminId: '', group: '', from: '', to: '', page: '1' };
const GROUPS = [
  { value: '', label: 'Hammasi' }, { value: 'payments', label: "To'lovlar" }, { value: 'credits', label: 'Kreditlar' }, { value: 'learners', label: "O'quvchilar" }, { value: 'attempts', label: 'Urinishlar' },
  { value: 'catalog', label: 'Narx va promo' }, { value: 'content', label: 'Testlar' }, { value: 'tickets', label: 'Murojaatlar' }, { value: 'settings', label: 'Sozlamalar' },
  { value: 'auth', label: 'Kirish' }, { value: 'alerts', label: 'Ogohlantirishlar' },
] as const;
const ACTION_C: Record<string, [string, string]> = {
  'mark-paid': ['var(--okBg)', 'var(--ok)'], grant: ['var(--okBg)', 'var(--ok)'], unlock: ['var(--okBg)', 'var(--ok)'],
  revoke: ['var(--errBg)', 'var(--err)'], lock: ['var(--errBg)', 'var(--err)'], refund: ['var(--errBg)', 'var(--err)'],
  'price-change': ['var(--warnBg)', 'var(--warn)'], publish: ['var(--aiBg)', 'var(--ai)'], 'mark-failed': ['var(--hover)', 'var(--ink2)'],
};
const th = { padding: '14px 10px', borderBottom: '1px solid var(--line)', fontWeight: 700 } as const;
const td = { padding: '12px 10px', borderBottom: '1px solid var(--line)' } as const;

/** note, or for a price change the design's "419 000 → 395 000 so'm" from meta */
function noteOf(a: AuditItem): string | null {
  if (a.note) return a.note;
  const m = (a.meta ?? {}) as Record<string, unknown>;
  if (typeof m.from === 'number' && typeof m.to === 'number' && typeof m.currency === 'string') return `${amount(m.currency, m.from)} → ${amount(m.currency, m.to)}`;
  return null;
}

function linkOf(a: AuditItem): string | null {
  const { type, id } = a.link;
  if (!type || !id) return null;
  return {
    order: `/orders/${id}`, learner: `/learners/${id}`, product: '/prices', test: '/tests', attempt: `/attempts?open=${id}`, ticket: `/tickets?open=${id}`, admin: '/settings',
  }[type] ?? null;
}

export function AuditScreen() {
  const toast = useToast();
  const { can } = useAdminShell();
  const [f, setF] = useUrlState(DEFAULTS);
  const [exporting, setExporting] = useState(false);
  const page = Math.max(1, Number(f.page) || 1);
  const filters = { adminId: f.adminId, group: f.group, from: f.from, to: f.to };
  const query = { ...filters, page, pageSize: PAGE_SIZE };
  const q = useQuery({ queryKey: ['am', 'actions', query], queryFn: () => adminApi.actions(query), placeholderData: (p) => p });
  const admins = useQuery({ queryKey: ['am', 'admins'], queryFn: adminApi.admins, enabled: can('mock.settings') });
  const set = (patch: Partial<typeof DEFAULTS>) => setF({ page: '1', ...patch });
  const rows = q.data?.items ?? [];
  const adminOpts = [{ value: '', label: 'Hammasi' }, { value: 'system', label: 'Tizim' }, ...(admins.data?.items ?? []).map((a) => ({ value: a.id, label: a.fullName ?? a.email }))];
  const dateValue = f.from || f.to ? `${f.from ? dayLabel(f.from) : '…'} – ${f.to ? dayLabel(f.to) : '…'}` : 'Hammasi';

  async function exportCsv() {
    setExporting(true);
    try {
      const { blob, filename } = await adminApi.actionsCsv(filters);
      saveBlob(blob, filename ?? `audit-${tashkentDay()}.csv`);
    } catch (e) {
      toast({ tone: 'err', title: 'Eksport qilinmadi', text: errText(e) });
    } finally {
      setExporting(false);
    }
  }

  return (
    <>
      <div className="ma-toolbar">
        <FilterPill label="Admin" value={adminOpts.find((x) => x.value === f.adminId)?.label ?? (f.adminId ? '…' : 'Hammasi')} active={!!f.adminId}>
          {(close) => <FilterOptions options={adminOpts} value={f.adminId} onPick={(v) => { set({ adminId: v }); close(); }} />}
        </FilterPill>
        <FilterPill label="Amal" value={GROUPS.find((x) => x.value === f.group)?.label ?? 'Hammasi'} active={!!f.group}>
          {(close) => <FilterOptions options={GROUPS} value={f.group as (typeof GROUPS)[number]['value']} onPick={(v) => { set({ group: v }); close(); }} />}
        </FilterPill>
        <FilterPill label="Sana" value={dateValue} active={!!(f.from || f.to)}>
          {(close) => <DateRange from={f.from} to={f.to} onApply={(a, b) => { set({ from: a, to: b }); close(); }} />}
        </FilterPill>
        <span style={{ flex: 1 }} />
        <Button variant="secondary" size={38} style={{ color: 'var(--blue)', fontWeight: 800, padding: '0 16px' }} onClick={exportCsv} loading={exporting} disabled={!q.data}>↓ CSV eksport</Button>
      </div>
      {q.isError && !q.data ? (
        <ErrorState flat title="Yuklab bo'lmadi" text={loadErrText(q.error)} onRetry={() => q.refetch()} retrying={q.isFetching} />
      ) : q.data && rows.length === 0 ? (
        <EmptyState icon={false} title="Hali yozuv yo'q" text="Filtrlarga mos amal topilmadi." />
      ) : (
        <div style={{ borderRadius: 20, background: 'var(--paper)', overflowX: 'auto' }}>
          <table className="ma-table" style={{ minWidth: 980 }}>
            <thead>
              <tr style={{ textAlign: 'left', color: 'var(--mut)', fontSize: 12 }}>
                <th style={{ ...th, padding: '14px 10px 14px 16px' }}>Vaqt</th><th style={th}>Admin</th><th style={th}>Amal</th><th style={th}>Obyekt</th><th style={{ ...th, padding: '14px 16px 14px 10px' }}>Izoh</th>
              </tr>
            </thead>
            <tbody>
              {!q.data && <SkeletonRows cols={5} n={8} />}
              {rows.map((a) => {
                const [bg, fg] = ACTION_C[a.actionKey] ?? ['var(--hover)', 'var(--ink2)'];
                const href = linkOf(a);
                return (
                  <tr key={a.id}>
                    <td style={{ ...td, padding: '12px 10px 12px 16px', color: 'var(--ink2)', fontWeight: 600, whiteSpace: 'nowrap' }}>{dateTime(a.createdAt)}</td>
                    <td style={{ ...td, fontWeight: 700, whiteSpace: 'nowrap' }}>{a.admin.id === 'system' ? 'Tizim' : a.admin.id === 'anonymous' ? "Noma'lum" : shortName(a.admin.fullName)}</td>
                    <td style={td}><span className="ma-mono" style={{ fontWeight: 700, padding: '3px 8px', borderRadius: 8, background: bg, color: fg, whiteSpace: 'nowrap' }}>{a.actionKey}</span></td>
                    <td style={{ ...td, fontWeight: 700, whiteSpace: 'nowrap' }}>{href ? <Link href={href}>{a.entityLabel ?? '—'}</Link> : a.entityLabel ?? '—'}</td>
                    <td style={{ ...td, padding: '12px 16px 12px 10px', color: 'var(--ink2)' }}>{noteOf(a) ?? '—'}</td>
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
