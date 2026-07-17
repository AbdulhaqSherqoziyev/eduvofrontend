'use client';

import { useState } from 'react';
import { NmCard } from '@/components/ui/nm-card';
import { QueryBoundary } from '@/components/shared/query-boundary';
import { EmptyState } from '@/components/shared/empty-state';
import { RowsSkeleton } from '@/components/shared/skeleton';
import { Pagination } from '@/components/shared/pagination';
import { useGroups } from '@/lib/hooks/use-groups';
import { ManageGroupRow } from './manage-group-row';

const HEAD = 'grid min-w-[700px] grid-cols-[40px_2fr_1.4fr_1.3fr_1fr_1.1fr_124px] items-center gap-4 px-4 pb-3.5 pt-2';

/** Groups management table — real data via useGroups(), paginated. */
export function ManageGroupsTable() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const query = useGroups({ page, limit: pageSize });

  return (
    <NmCard className="px-4 py-3.5 overflow-x-auto">
      <div className={`${HEAD} text-[10.5px] font-bold uppercase tracking-[0.8px] text-[#9aa6b8]`}>
        <div>#</div>
        <div>GURUH</div>
        <div>O&apos;QITUVCHI</div>
        <div>JADVAL</div>
        <div>O&apos;QUVCHILAR</div>
        <div>NARX</div>
        <div className="text-right">AMAL</div>
      </div>
      <QueryBoundary
        query={query}
        loading={<RowsSkeleton rows={8} />}
        isEmpty={(d) => d.items.length === 0}
        empty={<EmptyState title="Guruh topilmadi" hint="Yangi guruh qo'shing." />}
      >
        {(data) => (
          <>
            <div>
              {data.items.map((group, i) => (
                <ManageGroupRow key={group.id} group={group} n={(page - 1) * pageSize + i + 1} />
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
