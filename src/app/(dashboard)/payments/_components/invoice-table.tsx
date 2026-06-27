'use client';

import { useState } from 'react';
import { NmCard } from '@/components/ui/nm-card';
import { QueryBoundary } from '@/components/shared/query-boundary';
import { EmptyState } from '@/components/shared/empty-state';
import { RowsSkeleton } from '@/components/shared/skeleton';
import { Pagination } from '@/components/shared/pagination';
import { useInvoices } from '@/lib/hooks/use-payments';
import { InvoiceRow } from './invoice-row';

const HEAD = 'grid grid-cols-[2.2fr_1.1fr_1.2fr_1.2fr_1.1fr_150px] items-center gap-4 px-4 pb-3.5 pt-2';

/** Invoices table — real data via useInvoices(), paginated. */
export function InvoiceTable() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const query = useInvoices({ page, limit: pageSize });

  return (
    <NmCard className="px-4 py-3.5">
      <div className={`${HEAD} text-[10.5px] font-bold uppercase tracking-[0.8px] text-[#9aa6b8]`}>
        <div>O&apos;QUVCHI</div>
        <div>DAVR</div>
        <div>SUMMA</div>
        <div>TO&apos;LANGAN</div>
        <div>HOLAT</div>
        <div />
      </div>
      <QueryBoundary
        query={query}
        loading={<RowsSkeleton rows={8} />}
        isEmpty={(d) => d.items.length === 0}
        empty={<EmptyState title="To'lov topilmadi" hint="Hozircha hisob-fakturalar yo'q." />}
      >
        {(data) => (
          <>
            <div>
              {data.items.map((invoice) => (
                <InvoiceRow key={invoice.id} invoice={invoice} />
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
