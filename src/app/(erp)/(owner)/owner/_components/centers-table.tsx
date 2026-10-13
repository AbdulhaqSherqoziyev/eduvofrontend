"use client";

import { useMemo, useState } from "react";
import { NmCard } from "@/components/ui/nm-card";
import { NmSegmented } from "@/components/ui/nm-segmented";
import { QueryBoundary } from "@/components/shared/query-boundary";
import { EmptyState } from "@/components/shared/empty-state";
import { RowsSkeleton } from "@/components/shared/skeleton";
import { Pagination } from "@/components/shared/pagination";
import { useOwnerTenants } from "@/lib/hooks/use-owner-tenants";
import { useClientPagination } from "@/lib/hooks/use-client-pagination";
import type { OwnerTenant } from "@/lib/types/owner";
import { CenterRow, CENTER_COLS } from "./center-row";

const FILTERS = [
  { value: "all", label: "Hammasi" },
  { value: "prepaid", label: "Oldinda (+)" },
  { value: "zero", label: "Nol" },
  { value: "debt", label: "Qarzdor (−)" },
];

function matches(t: OwnerTenant, f: string): boolean {
  const bal = t.subscription?.balance ?? 0;
  if (f === "prepaid") return bal > 0;
  if (f === "zero") return bal === 0;
  if (f === "debt") return bal < 0;
  return true;
}

/** All centers in one table — balance filter, paginated client-side. */
export function CentersTable() {
  const query = useOwnerTenants();
  const [filter, setFilter] = useState("all");
  const filtered = useMemo(() => (query.data ?? []).filter((t) => matches(t, filter)), [query.data, filter]);
  const pager = useClientPagination(filtered);

  return (
    <div className="flex flex-col gap-4">
      <NmSegmented items={FILTERS} value={filter} onValueChange={(v) => { setFilter(v); pager.setPage(1); }} />
      <NmCard className="px-4 py-3.5 overflow-x-auto">
        <div className={`${CENTER_COLS} px-4 pb-3.5 pt-2 text-[10.5px] font-bold uppercase tracking-[0.8px] text-[#9aa6b8]`}>
          <div>#</div>
          <div>MARKAZ</div>
          <div>O&apos;QUVCHI / XODIM</div>
          <div>OYLIK</div>
          <div>BALANS</div>
          <div>HOLAT</div>
          <div className="text-right">AMAL</div>
        </div>
        <QueryBoundary
          query={query}
          loading={<RowsSkeleton rows={6} />}
          isEmpty={() => filtered.length === 0}
          empty={<EmptyState title="Markaz topilmadi" hint="Tanlangan filtrga mos markaz yo'q." />}
        >
          {() => (
            <div>
              {pager.pageItems.map((tenant, i) => (
                <CenterRow key={tenant.id} tenant={tenant} n={(pager.page - 1) * pager.pageSize + i + 1} />
              ))}
              <Pagination page={pager.page} pageSize={pager.pageSize} total={pager.total}
                onPageChange={pager.setPage} onPageSizeChange={pager.onPageSizeChange} />
            </div>
          )}
        </QueryBoundary>
      </NmCard>
    </div>
  );
}
