'use client';

import { Check, Clock, AlertTriangle } from 'lucide-react';
import { SummaryCard } from '@/components/shared/summary-card';
import { ErrorCard } from '@/components/shared/error-card';
import { Skeleton } from '@/components/shared/skeleton';
import { usePaymentSummary } from '@/lib/hooks/use-payments';
import { formatSom } from '@/lib/utils/format';

/** Three KPI cards: collected / outstanding / overdue totals. */
export function PaymentSummaryStrip() {
  const { data, isLoading, isError, refetch } = usePaymentSummary();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-[22px]">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-[92px]" />
        ))}
      </div>
    );
  }

  if (isError || !data) {
    return <ErrorCard onRetry={() => refetch()} />;
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-[22px]">
      <SummaryCard label="YIG'ILGAN" value={formatSom(data.collected)} icon={<Check className="size-[22px]" />} tone="success" />
      <SummaryCard label="QOLDIQ" value={formatSom(data.outstanding)} icon={<Clock className="size-[22px]" />} tone="muted" />
      <SummaryCard label="MUDDATI O'TGAN" value={formatSom(data.overdue)} icon={<AlertTriangle className="size-[22px]" />} tone="danger" />
    </div>
  );
}
