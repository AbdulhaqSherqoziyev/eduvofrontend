"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { NmCard } from "@/components/ui/nm-card";
import { NmInput } from "@/components/ui/nm-input";
import { NmSegmented } from "@/components/ui/nm-segmented";
import { ErrorCard } from "@/components/shared/error-card";
import { EmptyState } from "@/components/shared/empty-state";
import { RowsSkeleton } from "@/components/shared/skeleton";
import { Pagination } from "@/components/shared/pagination";
import { useUsers } from "@/lib/hooks/use-users";
import { useTeachers } from "@/lib/hooks/use-teachers";
import { useClientPagination } from "@/lib/hooks/use-client-pagination";
import type { Staff } from "@/lib/types/user";
import type { Teacher } from "@/lib/types/teacher";
import { StaffRow, STAFF_COLS } from "./staff-row";
import { TeacherStaffRow } from "./teacher-staff-row";

type Item =
  | { kind: "staff"; id: string; name: string; staff: Staff }
  | { kind: "teacher"; id: string; name: string; teacher: Teacher };

const ALL = { page: 1, limit: 500 };
const KIND_FILTERS = [
  { value: "", label: "Hammasi" },
  { value: "staff", label: "Xodimlar" },
  { value: "teacher", label: "O'qituvchilar" },
];

/** Xodimlar — office staff + teachers in one list, with search + kind filter. */
export function StaffTable() {
  const usersQ = useUsers(ALL);
  const teachersQ = useTeachers(ALL);
  const [search, setSearch] = useState("");
  const [kind, setKind] = useState("");

  const items: Item[] = [
    ...(usersQ.data?.items ?? []).map((s) => ({ kind: "staff" as const, id: `u-${s.id}`, name: s.fullName, staff: s })),
    ...(teachersQ.data?.items ?? []).map((t) => ({ kind: "teacher" as const, id: `t-${t.id}`, name: t.fullName, teacher: t })),
  ].sort((a, b) => a.name.localeCompare(b.name));

  const q = search.trim().toLowerCase();
  const filtered = items.filter((it) => (!kind || it.kind === kind) && (!q || it.name.toLowerCase().includes(q)));
  const pager = useClientPagination(filtered);
  const offset = (pager.page - 1) * pager.pageSize;

  if (usersQ.isLoading || teachersQ.isLoading) {
    return <NmCard className="px-4 py-3.5 overflow-x-auto"><RowsSkeleton rows={8} /></NmCard>;
  }
  if (usersQ.isError || teachersQ.isError) {
    return <ErrorCard onRetry={() => { usersQ.refetch(); teachersQ.refetch(); }} />;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <NmInput icon={<Search className="size-[18px]" />} placeholder="Ism bo'yicha qidirish"
          value={search} onChange={(e) => { setSearch(e.target.value); pager.setPage(1); }} className="sm:max-w-xs" />
        <NmSegmented items={KIND_FILTERS} value={kind} onValueChange={(v) => { setKind(v); pager.setPage(1); }} />
      </div>
      <NmCard className="px-4 py-3.5 overflow-x-auto">
        <div className={`${STAFF_COLS} px-4 pb-3.5 pt-2 text-[10.5px] font-bold uppercase tracking-[0.8px] text-[#9aa6b8]`}>
          <div>#</div><div>XODIM</div><div>LAVOZIM</div><div>ROLLAR</div><div className="text-right">AMAL</div>
        </div>
        {filtered.length === 0 ? (
          <EmptyState title="Xodim topilmadi" hint="Filtrlarni o'zgartiring." />
        ) : (
          <>
            <div>
              {pager.pageItems.map((it, i) =>
                it.kind === "staff" ? (
                  <StaffRow key={it.id} staff={it.staff} n={offset + i + 1} />
                ) : (
                  <TeacherStaffRow key={it.id} teacher={it.teacher} n={offset + i + 1} />
                ),
              )}
            </div>
            <Pagination page={pager.page} pageSize={pager.pageSize} total={pager.total}
              onPageChange={pager.setPage} onPageSizeChange={pager.onPageSizeChange} />
          </>
        )}
      </NmCard>
    </div>
  );
}
