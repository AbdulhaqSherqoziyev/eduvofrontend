'use client';

import { useState } from 'react';
import { NmCard } from '@/components/ui/nm-card';
import { Can } from '@/components/shared/can';
import { QueryBoundary } from '@/components/shared/query-boundary';
import { EmptyState } from '@/components/shared/empty-state';
import { RowsSkeleton } from '@/components/shared/skeleton';
import { Pagination } from '@/components/shared/pagination';
import { useAssignments } from '@/lib/hooks/use-assignments';
import { AssignmentRow } from './assignment-row';
import { CreateAssignmentDialog } from './create-assignment-dialog';

/** Assignments board — create action + paginated list with progress. */
export function AssignmentsBoard() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const query = useAssignments({ page, limit: pageSize });

  return (
    <div className="flex flex-col gap-5">
      <div className="flex justify-end">
        <Can permission="assignment.create">
          <CreateAssignmentDialog />
        </Can>
      </div>
      <NmCard className="flex flex-col gap-3 p-4">
        <QueryBoundary
          query={query}
          loading={<RowsSkeleton rows={6} />}
          isEmpty={(d) => d.items.length === 0}
          empty={<EmptyState title="Vazifa yo'q" />}
        >
          {(data) => (
            <>
              {data.items.map((a) => (
                <AssignmentRow key={a.id} assignment={a} />
              ))}
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
    </div>
  );
}
