'use client';

import { BellRing } from 'lucide-react';
import { NmCard } from '@/components/ui/nm-card';
import { QueryBoundary } from '@/components/shared/query-boundary';
import { EmptyState } from '@/components/shared/empty-state';
import { RowsSkeleton } from '@/components/shared/skeleton';
import { useReminders } from '@/lib/hooks/use-reminders';
import { REMINDER_COLS, ReminderRow } from './reminder-row';

/**
 * "Eslatmalar" — the debt-reminder worklist.
 *
 * The daily cron only PREPARES rows; every message leaves on a human decision,
 * one row at a time. There is deliberately NO "send all" button and no bulk
 * selection: one wrong click would push a wrong message to two hundred families
 * at once, and nothing can call it back. That constraint is the feature, not a
 * missing convenience — do not add one.
 */
export function RemindersPanel() {
  const query = useReminders('PENDING');

  return (
    <div className="flex flex-col gap-4">
      <p className="px-1 text-[12.5px] font-semibold leading-[1.5] text-muted">
        Har bir eslatma faqat siz tasdiqlaganingizdan keyin yuboriladi.
      </p>
      <NmCard className="px-4 py-3.5 sm:overflow-x-auto">
        {/* Column headers belong to the table layout only — the mobile cards
            below sm label themselves. */}
        <div
          className={`${REMINDER_COLS} hidden px-4 pb-3.5 pt-2 text-[10.5px] font-bold uppercase tracking-[0.8px] text-[#9aa6b8] sm:grid`}
        >
          <div>O&apos;QUVCHI</div>
          <div>BOSQICH</div>
          <div>SUMMA</div>
          <div>TELEGRAM</div>
          <div />
        </div>
        <QueryBoundary
          query={query}
          loading={<RowsSkeleton rows={6} />}
          isEmpty={(rows) => rows.length === 0}
          empty={
            <EmptyState
              icon={<BellRing className="size-6" />}
              title="Kutayotgan eslatma yo'q"
              hint="Qarzdorlik eslatmalari har kuni avtomatik tayyorlanadi — qarzdor paydo bo'lsa shu yerda ko'rinadi."
            />
          }
        >
          {(rows) => (
            <div>
              {rows.map((reminder) => (
                <ReminderRow key={reminder.id} reminder={reminder} />
              ))}
            </div>
          )}
        </QueryBoundary>
      </NmCard>
    </div>
  );
}
