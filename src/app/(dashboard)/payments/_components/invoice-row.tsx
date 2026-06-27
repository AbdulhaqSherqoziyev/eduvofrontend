import { Avatar } from '@/components/ui/avatar';
import { StatusPill } from '@/components/shared/status-pill';
import { Can } from '@/components/shared/can';
import { cn } from '@/lib/utils/cn';
import { formatSom } from '@/lib/utils/format';
import { INVOICE_STATUS_META, type Invoice } from '@/lib/types/payment';
import { AcceptPaymentDialog } from './accept-payment-dialog';

const COLS = 'grid grid-cols-[2.2fr_1.1fr_1.2fr_1.2fr_1.1fr_150px] items-center gap-4';

/** One invoice table row (student, period, amounts, status, accept action). */
export function InvoiceRow({ invoice }: { invoice: Invoice }) {
  const meta = INVOICE_STATUS_META[invoice.status];
  return (
    <div className={cn(COLS, 'rounded-[16px] px-4 py-[13px] transition-shadow hover:shadow-nm-inset-sm')}>
      <div className="flex min-w-0 items-center gap-[13px]">
        <Avatar name={invoice.studentName} size={42} />
        <div className="truncate text-[14px] font-bold text-foreground">{invoice.studentName}</div>
      </div>
      <div className="text-[13px] font-semibold text-muted">{invoice.period}</div>
      <div className="text-[14px] font-bold text-foreground">{formatSom(invoice.amount)}</div>
      <div className="text-[14px] font-bold text-foreground">{formatSom(invoice.paidAmount)}</div>
      <div>
        <StatusPill label={meta.label} tone={meta.tone} />
      </div>
      <div className="flex justify-end">
        {invoice.status !== 'PAID' ? (
          <Can permission="payment.create">
            <AcceptPaymentDialog invoice={invoice} />
          </Can>
        ) : null}
      </div>
    </div>
  );
}
