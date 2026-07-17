"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { NmCard } from "@/components/ui/nm-card";
import { NmInput } from "@/components/ui/nm-input";
import { NmSelect } from "@/components/ui/nm-select";
import { QueryBoundary } from "@/components/shared/query-boundary";
import { EmptyState } from "@/components/shared/empty-state";
import { RowsSkeleton } from "@/components/shared/skeleton";
import { Pagination } from "@/components/shared/pagination";
import { useInvoices } from "@/lib/hooks/use-payments";
import type { InvoiceStatus } from "@/lib/types/payment";
import { InvoiceRow } from "./invoice-row";

const HEAD =
  "grid min-w-[640px] grid-cols-[40px_2.4fr_1.1fr_1.3fr_1.2fr_150px] items-center gap-4 px-4 pb-3.5 pt-2";

/** Invoices table — search + status filter, paginated. */
export function InvoiceTable() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const query = useInvoices({
    page,
    limit: pageSize,
    search: search || undefined,
    status: (status || undefined) as InvoiceStatus | undefined,
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <NmInput
          icon={<Search className="size-[18px]" />}
          placeholder="O'quvchi ismi bo'yicha qidirish"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="sm:max-w-xs"
        />
        <NmSelect value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="sm:max-w-[220px]">
          <option value="">Barcha holatlar</option>
          <option value="PAID">To&apos;langan (oldinda)</option>
          <option value="PARTIAL">Qisman</option>
          <option value="UNPAID">To&apos;lanmagan</option>
          <option value="OVERDUE">Muddati o&apos;tgan (qarzdor)</option>
        </NmSelect>
      </div>
      <NmCard className="px-4 py-3.5 overflow-x-auto">
        <div className={`${HEAD} text-[10.5px] font-bold uppercase tracking-[0.8px] text-[#9aa6b8]`}>
          <div>#</div>
          <div>O&apos;QUVCHI</div>
          <div>DAVR</div>
          <div>TO&apos;LANGAN</div>
          <div>HOLAT</div>
          <div />
        </div>
        <QueryBoundary
          query={query}
          loading={<RowsSkeleton rows={8} />}
          isEmpty={(d) => d.items.length === 0}
          empty={<EmptyState title="To'lov topilmadi" hint="Hozircha hisob-fakturalar yo'q." />}
        >
          {(data) => (
            <>
              <div>
                {data.items.map((invoice, i) => (
                  <InvoiceRow key={invoice.id} invoice={invoice} n={(page - 1) * pageSize + i + 1} />
                ))}
              </div>
              <Pagination
                page={page}
                pageSize={pageSize}
                total={data.total}
                onPageChange={setPage}
                onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
              />
            </>
          )}
        </QueryBoundary>
      </NmCard>
    </div>
  );
}
