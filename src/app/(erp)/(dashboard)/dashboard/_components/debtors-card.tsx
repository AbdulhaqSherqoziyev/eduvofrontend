'use client';

import Link from 'next/link';
import { useDebtors } from '@/lib/hooks/use-dashboard';
import { QueryBoundary } from '@/components/shared/query-boundary';
import { EmptyState } from '@/components/shared/empty-state';
import { RowsSkeleton } from '@/components/shared/skeleton';
import { StatusPill } from '@/components/shared/status-pill';
import { NmCard } from '@/components/ui/nm-card';
import { Avatar } from '@/components/ui/avatar';
import { formatSom } from '@/lib/utils/format';

/** Top debtors list with amounts and overdue days. */
export function DebtorsCard() {
  const query = useDebtors();

  return (
    <NmCard className="col-span-1 sm:col-span-2 md:col-span-4 p-[22px]">
      <QueryBoundary
        query={query}
        loading={<RowsSkeleton rows={5} />}
        isEmpty={(d) => d.length === 0}
        empty={<EmptyState title="Qarzdorlar yo'q" />}
      >
        {(list) => (
          <>
            <div className="mb-[18px] flex items-center justify-between">
              <div className="text-[17px] font-extrabold tracking-[-0.3px] text-foreground">Top qarzdorlar</div>
              <StatusPill tone="danger" label={list.length + ' ta'} />
            </div>
            <div className="flex flex-col gap-3.5">
              {list.map((d) => (
                <div key={d.id} className="flex items-center gap-3">
                  <Avatar name={d.fullName} size={38} tone="danger" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-bold text-foreground">{d.fullName}</div>
                    <div className="truncate text-muted">{d.groupName}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-danger">−{formatSom(d.amount)}</div>
                    <div className="text-muted">{d.days} kun</div>
                  </div>
                </div>
              ))}
            </div>
            <Link href="/students?status=DEBTOR" className="mt-[18px] block text-center text-[13px] font-bold text-primary hover:underline">
              Barchasini ko&apos;rish →
            </Link>
          </>
        )}
      </QueryBoundary>
    </NmCard>
  );
}
