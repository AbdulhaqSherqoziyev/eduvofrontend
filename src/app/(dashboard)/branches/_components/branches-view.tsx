"use client";

import { Building2, Eye, Star } from "lucide-react";
import { NmCard } from "@/components/ui/nm-card";
import { QueryBoundary } from "@/components/shared/query-boundary";
import { CardGridSkeleton } from "@/components/shared/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { NmButton } from "@/components/ui/nm-button";
import { branchesApi } from "@/lib/api/branches";
import { setSession } from "@/lib/auth/session";
import { isSuperAdmin } from "@/lib/auth/session";
import { useBranches } from "@/lib/hooks/use-branches";
import type { Branch } from "@/lib/types/branch";
import { CreateBranchDialog } from "./create-branch-dialog";

const GRID = "grid gap-5 grid-cols-[repeat(auto-fill,minmax(280px,1fr))]";

async function enter(id: string) {
  const s = await branchesApi.enter(id);
  setSession(s);
  window.location.href = "/dashboard";
}

function BranchCard({ b }: { b: Branch }) {
  return (
    <NmCard className={`flex flex-col gap-4 p-[22px] ${b.isCurrent ? "shadow-nm-inset" : ""}`}>
      <div className="flex items-start gap-3.5">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-[15px] bg-background text-primary shadow-nm-sm">
          <Building2 className="size-6" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[16px] font-extrabold text-foreground">{b.brandName}</p>
          <p className="text-[12.5px] font-semibold text-muted">
            {b.isRoot ? "Bosh markaz" : "Filial"} · {b.studentCount} o&apos;quvchi
          </p>
        </div>
        {b.isCurrent ? <Star className="size-4 text-warning" /> : null}
      </div>
      {b.isCurrent ? (
        <NmButton variant="soft" disabled className="opacity-70">Joriy markaz</NmButton>
      ) : (
        <NmButton variant="soft" onClick={() => enter(b.id)}>
          <Eye className="size-[16px]" /> Kirish
        </NmButton>
      )}
    </NmCard>
  );
}

/** Director-only branches view; non-directors see a notice. */
export function BranchesView() {
  const query = useBranches();
  if (!isSuperAdmin()) {
    return <EmptyState title="Faqat direktor uchun" hint="Filiallar bo'limi direktorga (super admin) ochiq." />;
  }
  return (
    <section className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-extrabold text-foreground">Filiallar</h1>
          <p className="text-[13px] text-muted">Har bir filial mustaqil markaz — bitta direktor boshqaradi</p>
        </div>
        <CreateBranchDialog />
      </div>
      <QueryBoundary
        query={query}
        loading={<CardGridSkeleton count={3} className={GRID} />}
        isEmpty={(d) => d.length === 0}
        empty={<EmptyState title="Filial yo'q" hint="Birinchi filialni qo'shing." />}
      >
        {(data) => (
          <div className={GRID}>
            {data.map((b) => <BranchCard key={b.id} b={b} />)}
          </div>
        )}
      </QueryBoundary>
    </section>
  );
}
