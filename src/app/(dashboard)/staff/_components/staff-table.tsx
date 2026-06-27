'use client';

import { useState } from 'react';
import { NmCard } from '@/components/ui/nm-card';
import { QueryBoundary } from '@/components/shared/query-boundary';
import { EmptyState } from '@/components/shared/empty-state';
import { RowsSkeleton } from '@/components/shared/skeleton';
import { Pagination } from '@/components/shared/pagination';
import { useUsers } from '@/lib/hooks/use-users';
import { StaffRow, STAFF_COLS } from './staff-row';

/** Staff table — real data via useUsers(), paginated. */
export function StaffTable() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const query = useUsers({ page, limit: pageSize });

  return (
    <NmCard className="px-4 py-3.5">
      <div className={`${STAFF_COLS} px-4 pb-3.5 pt-2 text-[10.5px] font-bold uppercase tracking-[0.8px] text-[#9aa6b8]`}>
        <div>XODIM</div>
        <div>LAVOZIM</div>
        <div>ROLLAR</div>
        <div className="text-right">AMAL</div>
      </div>
      <QueryBoundary
        query={query}
        loading={<RowsSkeleton rows={8} />}
        isEmpty={(d) => d.items.length === 0}
        empty={<EmptyState title="Xodim topilmadi" hint="Yangi xodim qo'shing." />}
      >
        {(data) => (
          <>
            <div>
              {data.items.map((staff) => (
                <StaffRow key={staff.id} staff={staff} />
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
