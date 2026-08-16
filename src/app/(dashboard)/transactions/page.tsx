import { Suspense } from 'react';
import { CashView } from './_components/cash-view';

/** Kassa — balance, income/expense entry, approvals and the day-end count. */
export default function TransactionsPage() {
  // useSearchParams (the ?pending=1 anchor) needs a suspense boundary here.
  return (
    <Suspense fallback={null}>
      <CashView />
    </Suspense>
  );
}
