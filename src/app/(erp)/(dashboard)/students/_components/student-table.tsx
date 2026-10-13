'use client';

import { useEffect, useState } from 'react';
import { NmCard } from '@/components/ui/nm-card';
import { QueryBoundary } from '@/components/shared/query-boundary';
import { EmptyState } from '@/components/shared/empty-state';
import { RowsSkeleton } from '@/components/shared/skeleton';
import { Pagination } from '@/components/shared/pagination';
import { useStudents } from '@/lib/hooks/use-students';
import type { StudentStatus } from '@/lib/types/student';
import { StudentRow } from './student-row';

const HEAD = 'grid min-w-[700px] grid-cols-[40px_2.4fr_1.5fr_1.3fr_1.1fr_92px] items-center gap-4 px-4 pb-3.5 pt-2';

interface StudentTableProps {
  search: string;
  status: string;
}

/** Active students table — real data via useStudents(), paginated. */
export function StudentTable({ search, status }: StudentTableProps) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  useEffect(() => setPage(1), [search, status]);
  const query = useStudents({
    search,
    status: (status || undefined) as StudentStatus | undefined,
    page,
    limit: pageSize,
  });

  return (
    <NmCard className="px-4 py-3.5 overflow-x-auto">
      <div className={`${HEAD} text-[10.5px] font-bold uppercase tracking-[0.8px] text-[#9aa6b8]`}>
        <div>#</div>
        <div>O&apos;QUVCHI</div>
        <div>GURUH</div>
        <div>BALANS</div>
        <div>HOLAT</div>
        <div className="text-right">AMAL</div>
      </div>
      <QueryBoundary
        query={query}
        loading={<RowsSkeleton rows={8} />}
        isEmpty={(d) => d.items.length === 0}
        empty={<EmptyState title="O'quvchi topilmadi" hint="Qidiruv yoki filtrlarni o'zgartiring." />}
      >
        {(data) => (
          <>
            <div>
              {data.items.map((student, i) => (
                <StudentRow key={student.id} student={student} n={(page - 1) * pageSize + i + 1} />
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
