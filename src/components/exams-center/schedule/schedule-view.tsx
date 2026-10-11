'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CalendarClock } from 'lucide-react';
import { QueryBoundary } from '@/components/shared/query-boundary';
import { EmptyState } from '@/components/shared/empty-state';
import { Pagination } from '@/components/shared/pagination';
import { Skeleton } from '@/components/shared/skeleton';
import { useExamAssignments, useExamCatalog } from '@/lib/hooks/use-center-exams';
import { phaseOf, type Phase } from '../assignment-meta';
import { ConsoleHeader } from '../ui';
import { LivePanel } from '../live/live-panel';
import { SessionCard } from './session-card';

const RANK: Record<Phase, number> = { live: 0, upcoming: 1, past: 2 };

/** Rejalashtirilgan mocklar (design v3 SCHEDULE): sessions left, live monitor right. */
export function ScheduleView() {
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [picked, setPicked] = useState<string | null>(null);
  const list = useExamAssignments(undefined, page, size);
  const catalog = useExamCatalog();
  const examOf = (code: string) => catalog.data?.exams.find((e) => e.code === code);

  return (
    <section className="flex flex-col pb-6">
      <ConsoleHeader title="Rejalashtirilgan mocklar" subtitle="Guruhlarga tayinlangan imtihonlar va jonli kuzatuv" />
      <QueryBoundary
        query={list}
        loading={<div className="grid gap-[22px] xl:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)]"><Skeleton className="h-[320px]" /><Skeleton className="h-[320px]" /></div>}
        isEmpty={(d) => d.items.length === 0}
        empty={<EmptyState icon={<CalendarClock className="size-6" />} title="Rejalashtirilgan imtihon yo'q" hint="Katalogdan imtihonni guruhga tayinlang — u shu yerda chiqadi." />}
      >
        {(data) => {
          // Design order: live first, then upcoming, then finished.
          const items = [...data.items].sort((a, b) => RANK[phaseOf(a)] - RANK[phaseOf(b)] || a.windowStart.localeCompare(b.windowStart));
          const current = items.find((a) => a.id === picked) ?? items[0];
          return (
            <div className="grid items-start gap-[22px] xl:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)]">
              <div className="flex min-w-0 flex-col gap-3.5">
                {items.map((a) => (
                  <SessionCard key={a.id} a={a} exam={examOf(a.examCode)} active={a.id === current.id} onPick={() => setPicked(a.id)} />
                ))}
                {data.total > size ? (
                  <Pagination page={page} pageSize={size} total={data.total} onPageChange={setPage} onPageSizeChange={(s) => { setSize(s); setPage(1); }} />
                ) : null}
              </div>
              <LivePanel
                key={current.id}
                assignment={current}
                exam={examOf(current.examCode)}
                action={
                  <Link href={`/exams/assignments/${current.id}`} className="self-center text-[12.5px] font-bold text-primary hover:underline">
                    Batafsil
                  </Link>
                }
              />
            </div>
          );
        }}
      </QueryBoundary>
    </section>
  );
}
