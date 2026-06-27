'use client';

import { QueryBoundary } from '@/components/shared/query-boundary';
import { EmptyState } from '@/components/shared/empty-state';
import { RowsSkeleton } from '@/components/shared/skeleton';
import { Pagination } from '@/components/shared/pagination';
import { useApplications } from '@/lib/hooks/use-owner-applications';
import { useClientPagination } from '@/lib/hooks/use-client-pagination';
import { ApplicationCard } from './application-card';

/** Pending applications, newest first, paginated. */
export function ApplicationsList() {
  const query = useApplications();
  const pager = useClientPagination(query.data?.items ?? []);
  return (
    <QueryBoundary
      query={query}
      loading={<RowsSkeleton rows={3} />}
      isEmpty={(d) => d.items.length === 0}
      empty={<EmptyState title="Yangi ariza yo'q" hint="Barcha arizalar ko'rib chiqilgan." />}
    >
      {() => (
        <div className="flex flex-col gap-3">
          {pager.pageItems.map((app) => (
            <ApplicationCard key={app.id} app={app} />
          ))}
          <Pagination page={pager.page} pageSize={pager.pageSize} total={pager.total}
            onPageChange={pager.setPage} onPageSizeChange={pager.onPageSizeChange} />
        </div>
      )}
    </QueryBoundary>
  );
}
