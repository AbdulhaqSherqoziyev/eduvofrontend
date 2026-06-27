'use client';

import { useState } from 'react';
import { useGroups } from '@/lib/hooks/use-groups';
import { QueryBoundary } from '@/components/shared/query-boundary';
import { CardGridSkeleton } from '@/components/shared/skeleton';
import { EmptyState } from '@/components/shared/empty-state';
import { Pagination } from '@/components/shared/pagination';
import { GroupCard } from './group-card';

const COLS = 'grid-cols-[repeat(auto-fill,minmax(310px,1fr))]';

export function GroupsGrid() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const query = useGroups({ page, limit: pageSize });

  return (
    <QueryBoundary
      query={query}
      loading={<CardGridSkeleton count={6} className={COLS} />}
      isEmpty={(d) => d.items.length === 0}
      empty={<EmptyState title="Guruh yo'q" />}
    >
      {(data) => (
        <div className="flex flex-col gap-5">
          <div className={`grid gap-[22px] ${COLS}`}>
            {data.items.map((g) => (
              <GroupCard key={g.id} group={g} />
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
        </div>
      )}
    </QueryBoundary>
  );
}
