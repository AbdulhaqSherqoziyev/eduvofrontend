"use client";

import { useState } from "react";
import { NmCard } from "@/components/ui/nm-card";
import { NmSelect } from "@/components/ui/nm-select";
import { NmSegmented } from "@/components/ui/nm-segmented";
import { Can } from "@/components/shared/can";
import { QueryBoundary } from "@/components/shared/query-boundary";
import { EmptyState } from "@/components/shared/empty-state";
import { RowsSkeleton } from "@/components/shared/skeleton";
import { Pagination } from "@/components/shared/pagination";
import { useAssignments } from "@/lib/hooks/use-assignments";
import { useGroupOptions } from "@/lib/hooks/use-groups";
import type { AssignmentStatus } from "@/lib/types/assignment";
import { AssignmentRow } from "./assignment-row";
import { CreateAssignmentDialog } from "./create-assignment-dialog";

const STATUS_FILTERS = [
  { value: "", label: "Hammasi" },
  { value: "ACTIVE", label: "Bajarilmagan" },
  { value: "COMPLETED", label: "Bajarilgan" },
];

/** Assignments board — group + done/undone filter, create action, paginated list. */
export function AssignmentsBoard() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [groupId, setGroupId] = useState("");
  const [status, setStatus] = useState("");
  const groups = useGroupOptions();
  const query = useAssignments({
    page, limit: pageSize,
    groupId: groupId || undefined,
    status: (status || undefined) as AssignmentStatus | undefined,
  });

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row">
          <NmSelect value={groupId} onChange={(e) => { setGroupId(e.target.value); setPage(1); }} className="sm:max-w-[220px]">
            <option value="">Barcha guruhlar</option>
            {groups.map((g) => (<option key={g.value} value={g.value}>{g.label}</option>))}
          </NmSelect>
          <NmSegmented items={STATUS_FILTERS} value={status} onValueChange={(v) => { setStatus(v); setPage(1); }} />
        </div>
        <Can permission="assignment.create">
          <CreateAssignmentDialog />
        </Can>
      </div>
      <NmCard className="flex flex-col gap-3 p-4">
        <QueryBoundary
          query={query}
          loading={<RowsSkeleton rows={6} />}
          isEmpty={(d) => d.items.length === 0}
          empty={<EmptyState title="Vazifa yo'q" />}
        >
          {(data) => (
            <>
              {data.items.map((a, i) => (
                <AssignmentRow key={a.id} assignment={a} n={(page - 1) * pageSize + i + 1} />
              ))}
              <Pagination
                page={page} pageSize={pageSize} total={data.total}
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
