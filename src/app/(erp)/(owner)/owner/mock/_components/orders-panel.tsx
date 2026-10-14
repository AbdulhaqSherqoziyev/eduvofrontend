'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { NmInput } from '@/components/ui/nm-input';
import { NmSelect } from '@/components/ui/nm-select';
import { StatusPill } from '@/components/shared/status-pill';
import { useMockOrders } from '@/lib/hooks/use-owner-mock';
import { ORDER_STATUS, PROVIDER, fmtDateTime, fmtMoney, productLabel } from './format';
import { KeysetList, TableCard, rowCls } from './ui';

const COLS = 'grid-cols-[150px_minmax(0,1.4fr)_minmax(0,1fr)_120px_110px_130px]';

/** Orders: search (reference / receipt / email / Paddle txn), status + provider filters, keyset pages. */
export function OrdersPanel({ learnerId }: { learnerId?: string }) {
  const [q, setQ] = useState('');
  const [debounced, setDebounced] = useState('');
  const [status, setStatus] = useState('');
  const [provider, setProvider] = useState('');
  useEffect(() => { const t = window.setTimeout(() => setDebounced(q.trim()), 300); return () => window.clearTimeout(t); }, [q]);
  const query = useMockOrders({ q: debounced || undefined, status: status || undefined, provider: provider || undefined, learnerId, limit: 50 });

  return (
    <div className="flex flex-col gap-4">
      {!learnerId && (
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="flex-1">
            <NmInput icon={<Search className="size-[18px]" />} placeholder="EM-P-…, kvitansiya, email yoki txn_…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Qidirish" />
          </div>
          <div className="w-full sm:w-[190px]">
            <NmSelect value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Holat">
              <option value="">Barcha holatlar</option>
              {Object.entries(ORDER_STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </NmSelect>
          </div>
          <div className="w-full sm:w-[190px]">
            <NmSelect value={provider} onChange={(e) => setProvider(e.target.value)} aria-label="To'lov usuli">
              <option value="">Barcha usullar</option>
              {Object.entries(PROVIDER).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </NmSelect>
          </div>
        </div>
      )}
      <KeysetList query={query} empty="Buyurtma yo'q" emptyHint={debounced || status || provider ? "Filtrni o'zgartirib ko'ring." : undefined}>
        {(items) => (
          <TableCard cols={COLS} head={['Kod', "O'quvchi", 'Mahsulot', 'Summa', 'Holat', 'Sana']}>
            {items.map((o) => {
              const st = ORDER_STATUS[o.status] ?? { label: o.status, tone: 'muted' as const };
              return (
                <Link key={o.id} href={`/owner/mock/orders/${o.id}`} className={rowCls(COLS)}>
                  <span className="font-bold text-foreground"><bdi dir="ltr">{o.reference}</bdi></span>
                  <span className="min-w-0 truncate text-foreground">{o.learner.email ?? '—'}{o.learner.displayName ? <span className="text-muted"> · {o.learner.displayName}</span> : null}</span>
                  <span className="min-w-0 truncate text-muted">{productLabel(o.quote.product)} · {PROVIDER[o.provider] ?? o.provider}</span>
                  <span className="font-bold text-foreground"><bdi dir="ltr">{fmtMoney(o.quote.total)}</bdi></span>
                  <span><StatusPill label={st.label} tone={st.tone} /></span>
                  <span className="text-muted">{fmtDateTime(o.createdAt)}</span>
                </Link>
              );
            })}
          </TableCard>
        )}
      </KeysetList>
    </div>
  );
}
