'use client';

import Link from 'next/link';
import { Clock } from 'lucide-react';
import { NmCard } from '@/components/ui/nm-card';
import { NmButton } from '@/components/ui/nm-button';
import { Can } from '@/components/shared/can';
import { useCashBalance } from '@/lib/hooks/use-cash';
import { formatSom } from '@/lib/utils/format';

/**
 * §C.5 — the approval anchor on the home screen.
 *
 * The director does not open the cash desk every day, and an expense waiting
 * for them stops the cashier's work — and, after [SV2], also makes that
 * evening's count come up short through no fault of theirs. One line here is
 * what keeps that from turning into a phone call.
 */
export function PendingCashCard() {
  const { data } = useCashBalance();
  const count = data?.pending.count ?? 0;
  if (count <= 0) return null;

  return (
    <Can permission="transaction.approve">
      <NmCard className="flex flex-wrap items-center gap-3 px-4 py-3 ring-1 ring-primary/25 sm:col-span-2 md:col-span-12">
        <Clock className="size-4 shrink-0 text-muted" />
        <span className="min-w-0 flex-1 text-[13.5px] font-bold text-foreground">
          Kassada {count} ta xarajat tasdiq kutmoqda · {formatSom(data!.pending.amount)}
        </span>
        <NmButton asChild variant="soft" size="sm">
          <Link href="/transactions?pending=1">Ko&apos;rish</Link>
        </NmButton>
      </NmCard>
    </Can>
  );
}
