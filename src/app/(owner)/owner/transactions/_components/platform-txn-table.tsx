'use client';

import { useEffect, useState } from 'react';
import { NmCard } from '@/components/ui/nm-card';
import { QueryBoundary } from '@/components/shared/query-boundary';
import { EmptyState } from '@/components/shared/empty-state';
import { RowsSkeleton } from '@/components/shared/skeleton';
import { StatusPill } from '@/components/shared/status-pill';
import { Pagination } from '@/components/shared/pagination';
import { RowIndex } from '@/components/shared/row-index';
import { TxnVoidButton } from '@/components/owner/txn-void-button';
import { cn } from '@/lib/utils/cn';
import { formatSom } from '@/lib/utils/format';
import { formatDate } from '@/lib/utils/date';
import { usePlatformTxns, useVoidPlatformTxn } from '@/lib/hooks/use-owner-finance';
import { PLATFORM_TXN_META } from '@/lib/types/owner-finance';

const COLS = 'grid min-w-[700px] grid-cols-[40px_100px_1.4fr_1fr_1.5fr_1fr_1fr_48px] items-center gap-4';

/** Owner↔center money feed — top-ups, fees and adjustments across all centers. */
export function PlatformTxnTable({ tenantId }: { tenantId: string }) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  useEffect(() => setPage(1), [tenantId]);
  const query = usePlatformTxns({ tenantId: tenantId || undefined, page, limit: pageSize });
  const voidTxn = useVoidPlatformTxn();

  return (
    <NmCard className="px-4 py-3.5 overflow-x-auto">
      <div className={`${COLS} px-4 pb-3.5 pt-2 text-[10.5px] font-bold uppercase tracking-[0.8px] text-[#9aa6b8]`}>
        <div>#</div><div>SANA</div><div>MARKAZ</div><div>TUR</div><div>IZOH</div>
        <div className="text-right">SUMMA</div><div className="text-right">BALANS</div><div></div>
      </div>
      <QueryBoundary
        query={query}
        loading={<RowsSkeleton rows={6} />}
        isEmpty={(d) => d.items.length === 0}
        empty={<EmptyState title="Tranzaksiya yo'q" hint="Bu filtrda owner↔markaz harakati topilmadi." />}
      >
        {(data) => (
          <div>
            {data.items.map((t, i) => {
              const meta = PLATFORM_TXN_META[t.type];
              return (
                <div key={t.id} className={cn(COLS, 'rounded-[16px] px-4 py-[13px] transition-shadow hover:shadow-nm-inset-sm')}>
                  <RowIndex n={(page - 1) * pageSize + i + 1} />
                  <div className="text-[12.5px] font-semibold text-muted">{formatDate(t.createdAt)}</div>
                  <div className="truncate text-[13.5px] font-bold text-foreground">{t.centerName}</div>
                  <div><StatusPill label={meta.label} tone={meta.tone} /></div>
                  <div className="truncate text-[12.5px] font-semibold text-[#5b6b82]">{t.note || t.period || '—'}</div>
                  <div className={cn('text-right text-[13.5px] font-extrabold', t.amount < 0 ? 'text-danger' : 'text-success')}>
                    {formatSom(t.amount, { sign: true })}
                  </div>
                  <div className="text-right text-[13px] font-bold text-foreground">{formatSom(t.balanceAfter)}</div>
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
