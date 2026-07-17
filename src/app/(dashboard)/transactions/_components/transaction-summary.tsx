'use client';

import { AlignJustify, ArrowDown, ArrowUp } from 'lucide-react';
import { SummaryCard } from '@/components/shared/summary-card';
import { Skeleton } from '@/components/shared/skeleton';
import { ErrorCard } from '@/components/shared/error-card';
import { useTransactionSummary } from '@/lib/hooks/use-transactions';
import { formatSom } from '@/lib/utils/format';

/** Income / expense / net balance strip for the transactions ledger. */
export function TransactionSummary() {
  const { data, isLoading, isError, refetch } = useTransactionSummary();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
        <Skeleton className="h-[92px]" />
        <Skeleton className="h-[92px]" />
        <Skeleton className="h-[92px]" />
      </div>
    );
  }

  if (isError || !data) {
    return <ErrorCard onRetry={() => refetch()} />;
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
      <SummaryCard
        label="KIRIM (IYUN)"
        value={formatSom(data.income)}
        icon={<ArrowDown size={22} />}
        tone="success"
      />
      <SummaryCard
        label="CHIQIM (IYUN)"
        value={formatSom(data.expense)}
        icon={<ArrowUp size={22} />}
        tone="danger"
      />
      <SummaryCard
        label="SOF BALANS"
        value={formatSom(data.net)}
        icon={<AlignJustify size={22} />}
        tone="primary"
      />
    </div>
  );
}
