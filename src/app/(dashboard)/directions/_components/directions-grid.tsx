'use client';

import { useState } from 'react';
import { BookOpen } from 'lucide-react';
import { QueryBoundary } from '@/components/shared/query-boundary';
import { CardGridSkeleton } from '@/components/shared/skeleton';
import { EmptyState } from '@/components/shared/empty-state';
import { Pagination } from '@/components/shared/pagination';
import { useSubjects } from '@/lib/hooks/use-subjects';
import { DirectionCard } from './direction-card';

const GRID = 'grid gap-5 grid-cols-[repeat(auto-fill,minmax(300px,1fr))]';

/** Grid of direction (subject) cards, paginated. */
export function DirectionsGrid() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const query = useSubjects({ page, limit: pageSize });

  return (
    <QueryBoundary
      query={query}
      loading={<CardGridSkeleton count={6} className={GRID} />}
      isEmpty={(d) => d.items.length === 0}
      empty={
        <EmptyState icon={<BookOpen className="size-6" />} title="Yo‘nalishlar yo‘q" hint="Birinchi yo‘nalishni qo‘shing." />
      }
    >
      {(data) => (
        <div className="flex flex-col gap-5">
          <div className={GRID}>
            {data.items.map((subject) => (
              <DirectionCard key={subject.id} subject={subject} />
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
