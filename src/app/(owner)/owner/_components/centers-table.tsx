'use client';

import { NmCard } from '@/components/ui/nm-card';
import { QueryBoundary } from '@/components/shared/query-boundary';
import { EmptyState } from '@/components/shared/empty-state';
import { RowsSkeleton } from '@/components/shared/skeleton';
import { Pagination } from '@/components/shared/pagination';
import { useOwnerTenants } from '@/lib/hooks/use-owner-tenants';
import { useClientPagination } from '@/lib/hooks/use-client-pagination';
import { CenterRow, CENTER_COLS } from './center-row';

/** All centers in one table — real data via useOwnerTenants(), paginated. */
export function CentersTable() {
  const query = useOwnerTenants();
  const pager = useClientPagination(query.data ?? []);

  return (
    <NmCard className="px-4 py-3.5">
      <div className={`${CENTER_COLS} px-4 pb-3.5 pt-2 text-[10.5px] font-bold uppercase tracking-[0.8px] text-[#9aa6b8]`}>
        <div>MARKAZ</div>
        <div>O&apos;QUVCHI / XODIM</div>
        <div>OYLIK</div>
        <div>BALANS</div>
        <div>HOLAT</div>
        <div className="text-right">AMAL</div>
      </div>
      <QueryBoundary
        query={query}
        loading={<RowsSkeleton rows={6} />}
        isEmpty={(d) => d.length === 0}
        empty={<EmptyState title="Markaz topilmadi" hint="Arizalar bo'limidan tasdiqlang." />}
      >
        {() => (
          <div>
            {pager.pageItems.map((tenant) => (
              <CenterRow key={tenant.id} tenant={tenant} />
            ))}
            <Pagination page={pager.page} pageSize={pager.pageSize} total={pager.total}
              onPageChange={pager.setPage} onPageSizeChange={pager.onPageSizeChange} />
          </div>
        )}
      </QueryBoundary>
    </NmCard>
  );
}
