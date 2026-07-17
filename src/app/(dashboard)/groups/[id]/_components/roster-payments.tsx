"use client";

import { useMemo, useState } from "react";
import { QueryBoundary } from "@/components/shared/query-boundary";
import { EmptyState } from "@/components/shared/empty-state";
import { RowsSkeleton } from "@/components/shared/skeleton";
import { Avatar } from "@/components/ui/avatar";
import { NmSegmented } from "@/components/ui/nm-segmented";
import { StatusPill } from "@/components/shared/status-pill";
import { useGroupRoster } from "@/lib/hooks/use-groups";
import { STUDENT_STATUS_META } from "@/lib/types/student";
import { formatSom } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

const COLS = "grid min-w-[640px] grid-cols-[38px_2.4fr_1fr_1.3fr] items-center gap-4";
const FILTERS = [
  { value: "all", label: "Hammasi" },
  { value: "prepaid", label: "Oldinda (+)" },
  { value: "zero", label: "Nol" },
  { value: "debt", label: "Qarzdor (−)" },
];

/** Per-student balance view for a group (payments tab) with balance filter. */
export function RosterPayments({ groupId }: { groupId: string }) {
  const query = useGroupRoster(groupId);
  const [filter, setFilter] = useState("all");
  const rows = useMemo(() => {
    const all = query.data ?? [];
    if (filter === "prepaid") return all.filter((r) => r.balance > 0);
    if (filter === "zero") return all.filter((r) => r.balance === 0);
    if (filter === "debt") return all.filter((r) => r.balance < 0);
    return all;
  }, [query.data, filter]);

  return (
    <div className="flex flex-col gap-3">
      <NmSegmented items={FILTERS} value={filter} onValueChange={setFilter} />
      <div className={cn(COLS, "px-4 pb-3.5 pt-1 text-[10.5px] font-bold uppercase tracking-[0.8px] text-[#9aa6b8]")}>
        <div>#</div>
        <div>O&apos;QUVCHI</div>
        <div>HOLAT</div>
        <div>BALANS</div>
      </div>
      <QueryBoundary
        query={query}
        loading={<RowsSkeleton rows={6} />}
        isEmpty={() => rows.length === 0}
        empty={<EmptyState title="O'quvchi yo'q" hint="Tanlangan filtrga mos o'quvchi yo'q." />}
      >
        {() => (
          <div>
            {rows.map((r, i) => {
              const meta = STUDENT_STATUS_META[r.status];
              return (
                <div key={r.id} className={cn(COLS, "rounded-[16px] px-4 py-[13px] hover:shadow-nm-inset-sm")}>
                  <div className="text-[13px] font-bold text-[#9aa6b8]">{i + 1}</div>
                  <div className="flex min-w-0 items-center gap-[13px]">
                    <Avatar name={r.fullName} size={40} />
                    <span className="truncate text-[14px] font-bold text-foreground">{r.fullName}</span>
                  </div>
                  <div><StatusPill label={meta.label} tone={meta.tone} /></div>
                  <div className={cn("text-[14px] font-bold",
                    r.balance === 0 ? "text-muted" : r.balance < 0 ? "text-danger" : "text-success")}>
                    {r.balance === 0 ? "—" : formatSom(r.balance, { sign: true })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </QueryBoundary>
    </div>
  );
}
