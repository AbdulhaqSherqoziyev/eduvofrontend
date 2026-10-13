'use client';

import { useState } from 'react';
import { Avatar } from '@/components/ui/avatar';
import { NmDialog } from '@/components/ui/nm-dialog';
import { NmButton } from '@/components/ui/nm-button';
import { NmInput } from '@/components/ui/nm-input';
import { NmSegmented } from '@/components/ui/nm-segmented';
import { FieldLabel } from '@/components/ui/label';
import { StatusPill } from '@/components/shared/status-pill';
import { useAcceptPayment } from '@/lib/hooks/use-payments';
import { formatSom } from '@/lib/utils/format';
import { INVOICE_STATUS_META, PAYMENT_METHODS, type Invoice, type PaymentMethod } from '@/lib/types/payment';

/** Dialog to register a payment against an invoice. */
export function AcceptPaymentDialog({ invoice }: { invoice: Invoice }) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(String(invoice.amount - invoice.paidAmount));
  const [method, setMethod] = useState<PaymentMethod>('CASH');
  const accept = useAcceptPayment();
  const meta = INVOICE_STATUS_META[invoice.status];

  const onSubmit = async () => {
    await accept.mutateAsync({ invoiceId: invoice.id, amount: Number(amount), method });
    setOpen(false);
  };

  return (
    <NmDialog
      open={open}
      onOpenChange={setOpen}
      title="To'lovni qabul qilish"
      trigger={
        <NmButton variant="soft" size="sm">
          + Qabul qilish
        </NmButton>
      }
    >
      <div className="flex flex-col gap-5">
        <div className="flex items-center gap-[13px] rounded-ctl bg-background p-[14px] shadow-nm-inset-sm">
          <Avatar name={invoice.studentName} size={42} />
          <div className="min-w-0 flex-1">
            <div className="truncate text-[14px] font-bold text-foreground">{invoice.studentName}</div>
            <div className="text-[12px] font-semibold text-muted">
              {invoice.period} · jami {formatSom(invoice.amount)}
            </div>
          </div>
          <StatusPill label={meta.label} tone={meta.tone} />
        </div>

        <div>
          <FieldLabel>TO&apos;LOV SUMMASI</FieldLabel>
          <NmInput
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="text-[20px] font-extrabold text-primary"
          />
        </div>

        <div>
          <FieldLabel>TO&apos;LOV USULI</FieldLabel>
          <NmSegmented items={PAYMENT_METHODS} value={method} onValueChange={(v) => setMethod(v as PaymentMethod)} />
        </div>

        <div className="flex gap-3">
          <NmButton type="button" variant="soft" className="flex-1" onClick={() => setOpen(false)}>
            Bekor qilish
          </NmButton>
          <NmButton type="button" className="flex-[1.4]" onClick={onSubmit} disabled={accept.isPending}>
            {accept.isPending ? '...' : "To'lovni tasdiqlash"}
          </NmButton>
        </div>
      </div>
    </NmDialog>
  );
}
