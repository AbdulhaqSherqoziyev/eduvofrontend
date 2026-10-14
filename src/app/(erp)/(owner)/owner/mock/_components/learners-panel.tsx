'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { NmInput } from '@/components/ui/nm-input';
import { NmSelect } from '@/components/ui/nm-select';
import { StatusPill } from '@/components/shared/status-pill';
import { useMockLearners } from '@/lib/hooks/use-owner-mock';
import { LEARNER_STATUS, fmtDate, fmtMoneyList } from './format';
import { KeysetList, TableCard, rowCls } from './ui';

const COLS = 'grid-cols-[minmax(0,1.6fr)_70px_100px_100px_80px_minmax(0,1fr)_120px]';

/** Learners: email / id search, status filter, keyset pages. */
export function LearnersPanel() {
  const [q, setQ] = useState('');
  const [debounced, setDebounced] = useState('');
  const [status, setStatus] = useState('');
  useEffect(() => { const t = window.setTimeout(() => setDebounced(q.trim()), 300); return () => window.clearTimeout(t); }, [q]);
  const query = useMockLearners({ q: debounced || undefined, status: status || undefined, limit: 50 });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex-1"><NmInput icon={<Search className="size-[18px]" />} placeholder="Email yoki ID" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Qidirish" /></div>
        <div className="w-full sm:w-[200px]">
          <NmSelect value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Holat">
            <option value="">Barcha holatlar</option>
            {Object.entries(LEARNER_STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </NmSelect>
        </div>
      </div>
      <KeysetList query={query} empty="O'quvchi topilmadi" emptyHint={debounced || status ? "Filtrni o'zgartirib ko'ring." : undefined}>
        {(items) => (
          <TableCard cols={COLS} head={["O'quvchi", 'Mamlakat', "Ro'yxatdan", 'Oxirgi kirish', 'Urinish', "To'lagan", 'Holat']}>
            {items.map((l) => {
              const st = LEARNER_STATUS[l.status] ?? { label: l.status, tone: 'muted' as const };
              return (
                <Link key={l.id} href={`/owner/mock/learners/${l.id}`} className={rowCls(COLS)}>
                  <span className="flex min-w-0 flex-col">
                    <span className="truncate font-bold text-foreground">{l.email ?? '—'}</span>
                    <span className="truncate text-[12px] text-muted">{l.displayName ?? '—'}{l.emailVerified ? '' : ' · email tasdiqlanmagan'}</span>
                  </span>
                  <span className="text-muted">{l.country ?? '—'}</span>
                  <span className="text-muted">{fmtDate(l.createdAt)}</span>
                  <span className="text-muted">{fmtDate(l.lastLoginAt)}</span>
                  <span className="font-bold text-foreground">{l.attempts}</span>
                  <span className="truncate text-foreground"><bdi dir="ltr">{fmtMoneyList(l.paidTotal)}</bdi></span>
                  <span><StatusPill label={st.label} tone={st.tone} /></span>
                </Link>
              );
            })}
          </TableCard>
        )}
      </KeysetList>
    </div>
  );
}
