import Link from 'next/link';
import { Avatar } from '@/components/ui/avatar';
import { RowIndex } from '@/components/shared/row-index';
import { StatusPill } from '@/components/shared/status-pill';
import { Can } from '@/components/shared/can';
import { cn } from '@/lib/utils/cn';
import { formatSom } from '@/lib/utils/format';
import { INVOICE_STATUS_META, type Invoice } from '@/lib/types/payment';
import { AcceptPaymentDialog } from './accept-payment-dialog';

const COLS = 'grid min-w-[640px] grid-cols-[40px_2.4fr_1.1fr_1.3fr_1.2fr_150px] items-center gap-4';

/** One invoice table row (student, period, amounts, status, accept action). */
export function InvoiceRow({ invoice, n }: { invoice: Invoice; n: number }) {
  const meta = INVOICE_STATUS_META[invoice.status];
  return (
    <div className={cn(COLS, 'rounded-[16px] px-4 py-[13px] transition-shadow hover:shadow-nm-inset-sm')}>
      <RowIndex n={n} />
      <Link href={`/students/${invoice.studentId}`} className="flex min-w-0 items-center gap-[13px]">
        <Avatar name={invoice.studentName} size={42} />
        <div className="truncate text-[14px] font-bold text-foreground hover:text-primary">{invoice.studentName}</div>
      </Link>
      <div className="text-[13px] font-semibold text-muted">{invoice.period}</div>
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
