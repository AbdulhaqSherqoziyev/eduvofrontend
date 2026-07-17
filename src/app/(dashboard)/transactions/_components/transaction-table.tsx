"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { NmCard } from "@/components/ui/nm-card";
import { NmInput } from "@/components/ui/nm-input";
import { NmSegmented } from "@/components/ui/nm-segmented";
import { QueryBoundary } from "@/components/shared/query-boundary";
import { EmptyState } from "@/components/shared/empty-state";
import { RowsSkeleton } from "@/components/shared/skeleton";
import { Pagination } from "@/components/shared/pagination";
import { useTransactions } from "@/lib/hooks/use-transactions";
import type { TransactionType } from "@/lib/types/transaction";
import { TransactionRow } from "./transaction-row";

const HEAD = "grid min-w-[760px] grid-cols-[40px_54px_2.4fr_1.2fr_1.1fr_1fr_1.2fr_60px] items-center gap-4 px-4 pb-3.5 pt-2";
const TYPE_FILTERS = [
  { value: "", label: "Hammasi" },
  { value: "INCOME", label: "Kirim" },
  { value: "EXPENSE", label: "Chiqim" },
];

/** Transactions ledger — search + type filter, paginated. */
export function TransactionTable() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const query = useTransactions({
    page, limit: pageSize,
    search: search || undefined,
    type: (type || undefined) as TransactionType | undefined,
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <NmInput icon={<Search className="size-[18px]" />} placeholder="Tavsif yoki izoh bo'yicha qidirish"
          value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="sm:max-w-xs" />
        <NmSegmented items={TYPE_FILTERS} value={type} onValueChange={(v) => { setType(v); setPage(1); }} />
      </div>
      <NmCard className="px-4 py-3.5 overflow-x-auto">
        <div className={`${HEAD} text-[10.5px] font-bold uppercase tracking-[0.8px] text-[#9aa6b8]`}>
          <div>#</div><div /><div>TAVSIF</div><div>SANA / KIM</div><div>KATEGORIYA</div><div>USUL</div>
          <div className="text-right">SUMMA</div><div />
        </div>
        <QueryBoundary query={query} loading={<RowsSkeleton rows={8} />} isEmpty={(d) => d.items.length === 0}
          empty={<EmptyState title="Tranzaksiya topilmadi" hint="Filtrlarni o'zgartiring." />}>
          {(data) => (
            <>
              <div>
                {data.items.map((tx, i) => (
                  <TransactionRow key={tx.id} tx={tx} n={(page - 1) * pageSize + i + 1} />
                ))}
              </div>
              <Pagination page={page} pageSize={pageSize} total={data.total}
                onPageChange={setPage} onPageSizeChange={(s) => { setPageSize(s); setPage(1); }} />
            </>
          )}
        </QueryBoundary>
      </NmCard>
    </div>
  );
}
