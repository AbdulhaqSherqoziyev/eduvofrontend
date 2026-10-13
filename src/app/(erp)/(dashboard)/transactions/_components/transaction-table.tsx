'use client';

import type { UseQueryResult } from '@tanstack/react-query';
import { NmCard } from '@/components/ui/nm-card';
import { NmButton } from '@/components/ui/nm-button';
import { Can } from '@/components/shared/can';
import { QueryBoundary } from '@/components/shared/query-boundary';
import { EmptyState } from '@/components/shared/empty-state';
import { RowsSkeleton } from '@/components/shared/skeleton';
import { Pagination } from '@/components/shared/pagination';
import type { Paginated } from '@/lib/api/http';
import type { Transaction } from '@/lib/types/transaction';
import { TransactionCard } from './transaction-card';
import { TransactionRow, TX_GRID } from './transaction-row';

interface TransactionTableProps {
  query: UseQueryResult<Paginated<Transaction>>;
  page: number;
  pageSize: number;
  onPage: (page: number) => void;
  onPageSize: (size: number) => void;
  filtered: boolean;
  onClear: () => void;
  onNewExpense: () => void;
  onOpen: (tx: Transaction) => void;
  /** Row just written — briefly ringed so the eye finds it (§B.4). */
  flashId?: string | null;
}

/** §A.4 — the ledger. A table on a desk, cards on a phone. */
export function TransactionTable({
  query, page, pageSize, onPage, onPageSize, filtered, onClear, onNewExpense, onOpen, flashId,
}: TransactionTableProps) {
  const empty = filtered ? (
    <EmptyState
      title="Bu filtr bo'yicha yozuv topilmadi"
      hint="Sana yoki kategoriya filtrini kengaytiring."
      action={
        <NmButton variant="soft" onClick={onClear}>
          Filtrlarni tozalash
        </NmButton>
      }
    />
  ) : (
    <EmptyState
      title="Kassada hali yozuv yo'q"
      hint="Birinchi xarajatni yozing — ijara, kommunal yoki reklama."
      action={
        <Can permission="transaction.create">
          <NmButton onClick={onNewExpense}>+ Xarajat yozish</NmButton>
        </Can>
      }
    />
  );

  return (
    <>
      {/* Phone: cards, no horizontal scroll (§A.9). */}
      <div className="flex flex-col gap-2.5 md:hidden">
        <QueryBoundary
          query={query}
          loading={<RowsSkeleton rows={6} />}
          isEmpty={(d) => d.items.length === 0}
          empty={empty}
        >
          {(data) => (
            <>
              {data.items.map((tx) => (
                <TransactionCard key={tx.id} tx={tx} flash={tx.id === flashId} onOpen={onOpen} />
              ))}
              <Pagination
                page={page}
                pageSize={pageSize}
                total={data.total}
                onPageChange={onPage}
                onPageSizeChange={onPageSize}
              />
            </>
          )}
        </QueryBoundary>
      </div>

      <NmCard className="hidden overflow-x-auto px-4 py-3.5 md:block">
        <div className={`${TX_GRID} pb-3.5 pt-2 text-[10.5px] font-bold uppercase tracking-[0.8px] text-[#9aa6b8]`}>
          <div>№</div>
          <div />
          <div>TAVSIF</div>
          <div>SANA / KIM</div>
          <div className="hidden xl:block">KATEGORIYA</div>
          <div className="text-right">SUMMA</div>
          <div />
        </div>
        <QueryBoundary
          query={query}
          loading={<RowsSkeleton rows={8} />}
          isEmpty={(d) => d.items.length === 0}
          empty={empty}
        >
          {(data) => (
            <>
              {data.items.map((tx, i) => (
                <TransactionRow
                  key={tx.id}
                  tx={tx}
                  n={(page - 1) * pageSize + i + 1}
                  flash={tx.id === flashId}
                  onOpen={onOpen}
                />
              ))}
              <Pagination
                page={page}
                pageSize={pageSize}
                total={data.total}
                onPageChange={onPage}
                onPageSizeChange={onPageSize}
              />
            </>
          )}
        </QueryBoundary>
      </NmCard>
    </>
  );
}
