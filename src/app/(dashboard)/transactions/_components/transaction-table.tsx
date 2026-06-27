'use client';

import { useState } from 'react';
import { NmCard } from '@/components/ui/nm-card';
import { QueryBoundary } from '@/components/shared/query-boundary';
import { EmptyState } from '@/components/shared/empty-state';
import { RowsSkeleton } from '@/components/shared/skeleton';
import { Pagination } from '@/components/shared/pagination';
import { useTransactions } from '@/lib/hooks/use-transactions';
import { TransactionRow } from './transaction-row';

const HEAD = 'grid grid-cols-[54px_2.4fr_1.2fr_1.1fr_1fr_1.2fr] items-center gap-4 px-4 pb-3.5 pt-2';

/** Transactions ledger table — real data via useTransactions(), paginated. */
export function TransactionTable() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const query = useTransactions({ page, limit: pageSize });

  return (
    <NmCard className="px-4 py-3.5">
      <div className={`${HEAD} text-[10.5px] font-bold uppercase tracking-[0.8px] text-[#9aa6b8]`}>
        <div />
        <div>TAVSIF</div>
        <div>SANA</div>
        <div>KATEGORIYA</div>
        <div>USUL</div>
        <div className="text-right">SUMMA</div>
      </div>
      <QueryBoundary
        query={query}
        loading={<RowsSkeleton rows={8} />}
        isEmpty={(d) => d.items.length === 0}
        empty={<EmptyState title="Tranzaksiya topilmadi" hint="Hozircha yozuvlar mavjud emas." />}
      >
        {(data) => (
          <>
            <div>
              {data.items.map((tx) => (
                <TransactionRow key={tx.id} tx={tx} />
              ))}
            </div>
            <Pagination
              page={page}
              pageSize={pageSize}
              total={data.total}
              onPageChange={setPage}
              onPageSizeChange={(s) => {
                setPageSize(s);
                setPage(1);
              }}
            />
          </>
        )}
      </QueryBoundary>
    </NmCard>
  );
}
