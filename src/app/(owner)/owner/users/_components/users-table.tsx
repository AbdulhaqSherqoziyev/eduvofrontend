'use client';

import { useEffect, useState } from 'react';
import { NmCard } from '@/components/ui/nm-card';
import { QueryBoundary } from '@/components/shared/query-boundary';
import { EmptyState } from '@/components/shared/empty-state';
import { RowsSkeleton } from '@/components/shared/skeleton';
import { Pagination } from '@/components/shared/pagination';
import { useOwnerUsers } from '@/lib/hooks/use-owner-users';
import { UserRow, USER_COLS } from './user-row';

/** Cross-tenant user list — filtered by center + search. */
export function UsersTable({ tenantId, search }: { tenantId: string; search: string }) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  useEffect(() => setPage(1), [tenantId, search]);
  const query = useOwnerUsers({ tenantId: tenantId || undefined, search: search || undefined, page, limit: pageSize });

  return (
    <NmCard className="px-4 py-3.5 overflow-x-auto">
      <div className={`${USER_COLS} px-4 pb-3.5 pt-2 text-[10.5px] font-bold uppercase tracking-[0.8px] text-[#9aa6b8]`}>
        <div>#</div><div>FOYDALANUVCHI</div><div>MARKAZ / LAVOZIM</div><div>ROLLAR</div><div className="text-right">AMAL</div>
      </div>
      <QueryBoundary
        query={query}
        loading={<RowsSkeleton rows={6} />}
        isEmpty={(d) => d.items.length === 0}
        empty={<EmptyState title="Foydalanuvchi yo'q" hint="Yangi foydalanuvchi qo'shing yoki filtrni o'zgartiring." />}
      >
        {(data) => (
          <div>
            {data.items.map((u, i) => <UserRow key={u.id} user={u} n={(page - 1) * pageSize + i + 1} />)}
            <Pagination page={page} pageSize={pageSize} total={data.total} onPageChange={setPage}
              onPageSizeChange={(s) => { setPageSize(s); setPage(1); }} />
          </div>
        )}
      </QueryBoundary>
    </NmCard>
  );
}
