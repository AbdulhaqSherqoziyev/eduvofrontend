'use client';

import { useState } from 'react';
import { NmCard } from '@/components/ui/nm-card';
import { QueryBoundary } from '@/components/shared/query-boundary';
import { EmptyState } from '@/components/shared/empty-state';
import { RowsSkeleton } from '@/components/shared/skeleton';
import { Pagination } from '@/components/shared/pagination';
import { useTeachers } from '@/lib/hooks/use-teachers';
import { TeacherRow } from './teacher-row';

const HEAD = 'grid grid-cols-[2.4fr_1.3fr_1fr_0.9fr_1.2fr_1fr_92px] items-center gap-4 px-4 pb-3.5 pt-2';

/** Active teachers table — real data via useTeachers(), paginated. */
export function TeacherTable() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const query = useTeachers({ page, limit: pageSize });

  return (
    <NmCard className="px-4 py-3.5">
      <div className={`${HEAD} text-[10.5px] font-bold uppercase tracking-[0.8px] text-[#9aa6b8]`}>
        <div>O&apos;QITUVCHI</div>
        <div>YO&apos;NALISH</div>
        <div>GURUH/O&apos;QUVCHI</div>
        <div>REYTING</div>
        <div>OYLIK</div>
        <div>HOLAT</div>
        <div className="text-right">AMAL</div>
      </div>
      <QueryBoundary
        query={query}
        loading={<RowsSkeleton rows={8} />}
        isEmpty={(d) => d.items.length === 0}
        empty={<EmptyState title="O'qituvchi topilmadi" hint="Yangi o'qituvchi qo'shing." />}
      >
        {(data) => (
          <>
            <div>
              {data.items.map((teacher) => (
                <TeacherRow key={teacher.id} teacher={teacher} />
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
