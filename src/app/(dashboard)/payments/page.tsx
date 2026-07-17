import { Can } from "@/components/shared/can";
import { PaymentSummaryStrip } from "./_components/payment-summary-strip";
import { InvoiceTable } from "./_components/invoice-table";
import { StudentPaymentDialog } from "./_components/student-payment-dialog";

/** Payments screen — summary + main accept-payment button + filtered invoices. */
export default function PaymentsPage() {
  return (
    <section className="flex flex-col gap-[22px]">
      <div className="flex justify-end">
        <Can permission="payment.create">
          <StudentPaymentDialog />
        </Can>
      </div>
      <PaymentSummaryStrip />
      <InvoiceTable />
    </section>
  );
}
