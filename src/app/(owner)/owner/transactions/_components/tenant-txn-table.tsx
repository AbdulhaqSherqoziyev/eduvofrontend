'use client';

import { useEffect, useState } from 'react';
import { NmCard } from '@/components/ui/nm-card';
import { QueryBoundary } from '@/components/shared/query-boundary';
import { EmptyState } from '@/components/shared/empty-state';
import { RowsSkeleton } from '@/components/shared/skeleton';
import { Pagination } from '@/components/shared/pagination';
import { TxnVoidButton } from '@/components/owner/txn-void-button';
import { cn } from '@/lib/utils/cn';
import { formatSom } from '@/lib/utils/format';
import { formatDate } from '@/lib/utils/date';
import { useTenantTxns, useVoidTenantTxn } from '@/lib/hooks/use-owner-finance';

const COLS = 'grid grid-cols-[100px_1.3fr_1.6fr_1fr_0.9fr_1fr_48px] items-center gap-4';

/** Center↔student money feed — every center's income/expense ledger. */
export function TenantTxnTable({ tenantId }: { tenantId: string }) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  useEffect(() => setPage(1), [tenantId]);
  const query = useTenantTxns({ tenantId: tenantId || undefined, page, limit: pageSize });
  const voidTxn = useVoidTenantTxn();

  return (
    <NmCard className="px-4 py-3.5">
      <div className={`${COLS} px-4 pb-3.5 pt-2 text-[10.5px] font-bold uppercase tracking-[0.8px] text-[#9aa6b8]`}>
        <div>SANA</div><div>MARKAZ</div><div>TAFSILOT</div><div>TOIFA</div>
        <div>USUL</div><div className="text-right">SUMMA</div><div></div>
      </div>
      <QueryBoundary
        query={query}
        loading={<RowsSkeleton rows={6} />}
        isEmpty={(d) => d.items.length === 0}
        empty={<EmptyState title="Tranzaksiya yo'q" hint="Bu filtrda markaz↔o'quvchi harakati topilmadi." />}
      >
        {(data) => (
          <div>
            {data.items.map((t) => {
              const income = t.type === 'INCOME';
              return (
                <div key={t.id} className={cn(COLS, 'rounded-[16px] px-4 py-[13px] transition-shadow hover:shadow-nm-inset-sm')}>
                  <div className="text-[12.5px] font-semibold text-muted">{formatDate(t.date)}</div>
                  <div className="truncate text-[13.5px] font-bold text-foreground">{t.centerName}</div>
                  <div className="min-w-0">
                    <div className="truncate text-[13px] font-bold text-foreground">{t.party || '—'}</div>
                    <div className="truncate text-[12px] font-semibold text-[#9aa6b8]">{t.note}</div>
                  </div>
                  <div className="truncate text-[12.5px] font-semibold text-[#5b6b82]">{t.category}</div>
                  <div className="text-[12.5px] font-semibold text-muted">{t.method}</div>
                  <div className={cn('text-right text-[13.5px] font-extrabold', income ? 'text-success' : 'text-danger')}>
                    {(income ? '+ ' : '− ') + formatSom(t.amount)}
                  </div>
                  <TxnVoidButton onVoid={() => voidTxn.mutate(t.id)} pending={voidTxn.isPending} />
                </div>
              );
            })}
            <Pagination page={page} pageSize={pageSize} total={data.total} onPageChange={setPage}
              onPageSizeChange={(s) => { setPageSize(s); setPage(1); }} />
          </div>
        )}
      </QueryBoundary>
    </NmCard>
  );
}
