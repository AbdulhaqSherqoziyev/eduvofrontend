'use client';

import { NmCard } from '@/components/ui/nm-card';
import { QueryBoundary } from '@/components/shared/query-boundary';
import { EmptyState } from '@/components/shared/empty-state';
import { RowsSkeleton } from '@/components/shared/skeleton';
import { formatSom } from '@/lib/utils/format';
import { usePlans } from '@/lib/hooks/use-owner-plans';
import { PlanDialog } from './plan-dialog';

/** Plan cards grid with add + per-card edit. */
export function PlansList() {
  const query = usePlans();

  return (
    <div className="flex flex-col gap-5">
      <div className="flex justify-end"><PlanDialog /></div>
      <QueryBoundary
        query={query}
        loading={<RowsSkeleton rows={3} />}
        isEmpty={(d) => d.length === 0}
        empty={<EmptyState title="Tarif yo'q" hint="Yangi tarif qo'shing." />}
      >
        {(data) => (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {data.map((p) => (
              <NmCard key={p.id} className="p-5">
                <div className="flex items-start justify-between">
                  <div className="text-[17px] font-extrabold text-foreground">{p.name}</div>
                  <PlanDialog plan={p} />
                </div>
                <div className="mt-3 text-[22px] font-extrabold text-primary">
                  {formatSom(p.monthlyFee)}
                  <span className="text-[13px] font-semibold text-muted"> /oy</span>
                </div>
                <div className="mt-3 flex flex-col gap-1 text-[12.5px] font-semibold text-[#5b6b82]">
                  <div>O&apos;rnatish: {formatSom(p.setupFee)}</div>
                  <div>Sinov: {p.trialDays} kun</div>
                  {p.maxStudents ? <div>Maks o&apos;quvchi: {p.maxStudents}</div> : null}
                  <div className={p.isActive ? 'text-success' : 'text-[#9aa6b8]'}>{p.isActive ? 'Faol' : "O'chirilgan"}</div>
                </div>
              </NmCard>
            ))}
          </div>
        )}
      </QueryBoundary>
    </div>
  );
}
