'use client';

import { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { NmSegmented } from '@/components/ui/nm-segmented';
import { QueryBoundary } from '@/components/shared/query-boundary';
import { CardGridSkeleton } from '@/components/shared/skeleton';
import { EmptyState } from '@/components/shared/empty-state';
import { StatusPill } from '@/components/shared/status-pill';
import { useLeads } from '@/lib/hooks/use-leads';
import { LEAD_BOARD_COLUMNS, LEAD_STATUS_META, type Lead, type LeadStatus } from '@/lib/types/lead';
import { LeadCard } from './lead-card';

const GRID = 'grid gap-5 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4';

const VIEW_TABS = [
  { value: 'board', label: 'Lidlar' },
  { value: 'lost', label: "Yo'qotilganlar" },
];

function Column({ status, leads }: { status: LeadStatus; leads: Lead[] }) {
  const meta = LEAD_STATUS_META[status];
  return (
    <div className="flex min-w-0 flex-col gap-3">
      <div className="flex items-center justify-between px-1">
        <span className="text-[12px] font-bold uppercase tracking-[0.7px] text-muted">{meta.label}</span>
        <StatusPill tone={meta.tone} label={String(leads.length)} />
      </div>
      {leads.length === 0 ? (
        <div className="rounded-card px-3 py-6 text-center text-[12.5px] font-semibold text-muted shadow-nm-inset-sm">
          Bo&apos;sh
        </div>
      ) : (
        leads.map((lead) => <LeadCard key={lead.id} lead={lead} />)
      )}
    </div>
  );
}

/** Leads screen — four status columns + a small "lost" tab. */
export function LeadsBoard() {
  const [view, setView] = useState('board');
  // Leads are few per center — pull one big page and group client-side.
  const query = useLeads({ page: 1, limit: 200 });

  return (
    <div className="flex flex-col gap-5">
      <div className="flex justify-end">
        <NmSegmented className="h-11 w-[280px] max-w-full" size="sm" items={VIEW_TABS} value={view} onValueChange={setView} />
      </div>
      <QueryBoundary
        query={query}
        loading={<CardGridSkeleton count={8} className={GRID} />}
        isEmpty={(d) => d.items.length === 0}
        empty={
          <EmptyState
            icon={<UserPlus className="size-6" />}
            title="Hali lid yo'q"
            hint="Birinchisini qo'shing."
          />
        }
      >
        {(data) =>
          view === 'lost' ? (
            data.items.filter((l) => l.status === 'LOST').length === 0 ? (
              <EmptyState title="Yo'qotilgan lid yo'q" />
            ) : (
              <div className={GRID}>
                {data.items
                  .filter((l) => l.status === 'LOST')
                  .map((lead) => (
                    <LeadCard key={lead.id} lead={lead} />
                  ))}
              </div>
            )
          ) : (
            <div className={GRID}>
              {LEAD_BOARD_COLUMNS.map((status) => (
                <Column key={status} status={status} leads={data.items.filter((l) => l.status === status)} />
              ))}
            </div>
          )
        }
      </QueryBoundary>
    </div>
  );
}
