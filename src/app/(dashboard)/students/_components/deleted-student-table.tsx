'use client';

import { useEffect, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { NmCard } from '@/components/ui/nm-card';
import { NmButton } from '@/components/ui/nm-button';
import { Avatar } from '@/components/ui/avatar';
import { Can } from '@/components/shared/can';
import { QueryBoundary } from '@/components/shared/query-boundary';
import { EmptyState } from '@/components/shared/empty-state';
import { RowsSkeleton } from '@/components/shared/skeleton';
import { Pagination } from '@/components/shared/pagination';
import { useDeletedStudents, useRestoreStudent } from '@/lib/hooks/use-students';

/** Trash view — soft-deleted students with a restore action, paginated. */
export function DeletedStudentTable({ search }: { search: string }) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  useEffect(() => setPage(1), [search]);
  const query = useDeletedStudents({ search, page, limit: pageSize });
  const restore = useRestoreStudent();

  return (
    <NmCard className="flex flex-col gap-2 px-4 py-3.5">
      <QueryBoundary
        query={query}
        loading={<RowsSkeleton rows={5} />}
        isEmpty={(d) => d.items.length === 0}
        empty={<EmptyState title="Korzina bo'sh" hint="O'chirilgan o'quvchilar yo'q." />}
      >
        {(data) => (
          <>
            {data.items.map((s) => (
              <div key={s.id} className="flex items-center gap-3 rounded-[16px] px-4 py-3 hover:shadow-nm-inset-sm">
                <Avatar name={s.fullName} size={40} tone="muted" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[14px] font-bold text-foreground">{s.fullName}</div>
                  <div className="text-[12px] font-semibold text-[#9aa6b8]">{s.groupName ?? '—'}</div>
                </div>
                <Can permission="student.update">
                  <NmButton variant="soft" size="sm" disabled={restore.isPending} onClick={() => restore.mutate(s.id)}>
                    <RotateCcw className="size-4" strokeWidth={2} />
                    Tiklash
                  </NmButton>
                </Can>
              </div>
            ))}
            <Pagination page={page} pageSize={pageSize} total={data.total} onPageChange={setPage}
              onPageSizeChange={(s) => { setPageSize(s); setPage(1); }} />
          </>
        )}
      </QueryBoundary>
    </NmCard>
  );
}
