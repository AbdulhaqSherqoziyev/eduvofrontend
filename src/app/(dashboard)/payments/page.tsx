import { PaymentSummaryStrip } from './_components/payment-summary-strip';
import { InvoiceTable } from './_components/invoice-table';

/** Payments screen — collection summary + invoices with accept-payment flow. */
export default function PaymentsPage() {
  return (
    <section className="flex flex-col gap-[22px]">
      <PaymentSummaryStrip />
      <InvoiceTable />
    </section>
  );
}
