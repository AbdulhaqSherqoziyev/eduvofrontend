"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { NmInput } from "@/components/ui/nm-input";
import { NmSelect } from "@/components/ui/nm-select";
import { useGroups } from "@/lib/hooks/use-groups";
import { useSubjectOptions } from "@/lib/hooks/use-subjects";
import { QueryBoundary } from "@/components/shared/query-boundary";
import { CardGridSkeleton } from "@/components/shared/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { Pagination } from "@/components/shared/pagination";
import { GroupCard } from "./group-card";

const COLS = "grid-cols-[repeat(auto-fill,minmax(310px,1fr))]";

export function GroupsGrid() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const subjects = useSubjectOptions();
  const query = useGroups({ page, limit: pageSize, search: search || undefined, subjectId: subjectId || undefined });

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 sm:flex-row">
        <NmInput icon={<Search className="size-[18px]" />} placeholder="Guruh nomi bo'yicha qidirish"
          value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="sm:max-w-xs" />
        <NmSelect value={subjectId} onChange={(e) => { setSubjectId(e.target.value); setPage(1); }} className="sm:max-w-[240px]">
          <option value="">Barcha yo&apos;nalishlar</option>
          {subjects.map((s) => (<option key={s.value} value={s.value}>{s.label}</option>))}
        </NmSelect>
      </div>
      <QueryBoundary query={query} loading={<CardGridSkeleton count={6} className={COLS} />}
        isEmpty={(d) => d.items.length === 0} empty={<EmptyState title="Guruh yo'q" hint="Filtrlarni o'zgartiring." />}>
        {(data) => (
          <div className="flex flex-col gap-5">
            <div className={`grid gap-[22px] ${COLS}`}>
              {data.items.map((g) => (<GroupCard key={g.id} group={g} />))}
            </div>
            <Pagination page={page} pageSize={pageSize} total={data.total}
              onPageChange={setPage} onPageSizeChange={(s) => { setPageSize(s); setPage(1); }} />
          </div>
        )}
      </QueryBoundary>
    </div>
  );
}
