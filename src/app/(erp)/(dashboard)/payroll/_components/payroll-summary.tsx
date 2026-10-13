'use client';

import { HandCoins, Percent, Plus, Wallet } from 'lucide-react';
import { SummaryCard } from '@/components/shared/summary-card';
import { somOrDash } from '@/lib/utils/payroll-labels';
import type { PeriodView } from '@/lib/types/payroll';

/**
 * Xulosa kartalari (§E.3).
 *
 * `ASOSIY + ULUSH + QO'SHIMCHA = JAMI` — ko'rsatiladigan invariant: qatorlar
 * yig'indisi kartalarga to'g'ri kelmasa, direktor xatoni maketda emas,
 * hisobda deb o'qiydi.
 *
 * `tone="muted"` — maosh summasi hech qachon rangli emas (§F.2).
 */
export function PayrollSummary({ totals }: { totals: PeriodView['totals'] }) {
  return (
    <div className="grid grid-cols-2 gap-[22px] md:grid-cols-4">
      <SummaryCard label="Asosiy" value={somOrDash(totals.base)} tone="muted" icon={<Wallet className="size-5" />} />
      <SummaryCard label="Ulush" value={somOrDash(totals.share)} tone="muted" icon={<Percent className="size-5" />} />
      <SummaryCard label="Qo'shimcha" value={somOrDash(totals.extra)} tone="muted" icon={<Plus className="size-5" />} />
      <SummaryCard label="Jami" value={somOrDash(totals.total)} tone="muted" icon={<HandCoins className="size-5" />} />
    </div>
  );
}
