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
import { useTeachers } from "@/lib/hooks/use-teachers";
import { TeacherRow } from "./teacher-row";

const HEAD =
  "grid min-w-[720px] grid-cols-[40px_2.2fr_1.5fr_1.6fr_0.8fr_1fr_92px] items-center gap-4 px-4 pb-3.5 pt-2";

/** Teachers table — search + status filter, multi-group chips, paginated. */
export function TeacherTable() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [status, setStatus] = useState("");
  const [q, setQ] = useState("");
  const query = useTeachers({ page, limit: pageSize, status: status || undefined, q: q || undefined });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <NmInput
          icon={<Search className="size-[18px]" />}
          placeholder="Qidirish: ism yoki telefon"
          value={q}
          onChange={(e) => { setQ(e.target.value); setPage(1); }}
          className="sm:max-w-xs"
        />
        <NmSelect
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="sm:max-w-[200px]"
        >
          <option value="">Barcha holatlar</option>
          <option value="ACTIVE">Faol</option>
          <option value="ON_LEAVE">Ta&apos;tilda</option>
        </NmSelect>
      </div>
      <NmCard className="px-4 py-3.5 overflow-x-auto">
        <div className={`${HEAD} text-[10.5px] font-bold uppercase tracking-[0.8px] text-[#9aa6b8]`}>
          <div>#</div>
          <div>O&apos;QITUVCHI</div>
          <div>YO&apos;NALISH</div>
          <div>GURUHLAR</div>
          <div>REYTING</div>
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
                {data.items.map((teacher, i) => (
                  <TeacherRow key={teacher.id} teacher={teacher} n={(page - 1) * pageSize + i + 1} />
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
