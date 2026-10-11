import { Suspense } from 'react';
import { PaymentsView } from './_components/payments-view';

/** Payments screen — invoices, plus the debt-reminder worklist as a tab. */
export default function PaymentsPage() {
  // useSearchParams (the ?search= link from a student profile) needs a suspense boundary here.
  return (
    <Suspense fallback={null}>
      <PaymentsView />
    </Suspense>
  );
}
