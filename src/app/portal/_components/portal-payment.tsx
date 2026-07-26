'use client';

import { Check, Phone } from 'lucide-react';
import { NmCard } from '@/components/ui/nm-card';
import { NmButton } from '@/components/ui/nm-button';
import { formatSom } from '@/lib/utils/format';
import { dayLabel, periodLabel } from '../_lib/api';
import { CENTER_PHONE, PAY_METHOD, payState, type Overview } from '../_lib/types';

const CARD = 'p-4 sm:p-5';
const INV_ST: Record<string, string> = {
  PAID: "To'langan",
  PARTIAL: 'Qisman',
  UNPAID: "To'lanmagan",
  OVERDUE: "Muddati o'tgan",
};

/**
 * One line of money, in muted text.
 *
 * Overdue is warning-coloured, never danger: an unpaid invoice is a reminder,
 * not an accusation, and the person reading it is usually not the one who pays.
 * The words "Qarz" / "Qarzdor" / "To'lamadingiz" never appear.
 */
export function PaymentLine({ d }: { d: Overview }) {
  const s = payState(d.finance?.invoices ?? []);
  if (s.kind === 'none') return <p className="text-[13px] font-semibold text-muted">To&apos;lov hisobi yo&apos;q.</p>;
  if (s.kind === 'paid') {
    return (
      <p className="flex items-center gap-1.5 text-[13px] font-semibold text-success">
        <Check className="size-4 shrink-0" />
        {s.period} to&apos;langan.
      </p>
    );
  }
  if (s.kind === 'overdue') {
    return (
      <p className="text-[13px] font-semibold leading-[1.5] text-warning">
        {s.period} uchun: {formatSom(s.left)} · muddat {s.due} o&apos;tdi
      </p>
    );
  }
  return (
    <p className="text-[13px] font-semibold leading-[1.5] text-muted">
      {s.period} uchun: {formatSom(s.left)} · muddat {s.due}
    </p>
  );
}

/** Overdue gets one action that actually helps: call the centre. */
export function PaymentCallButton({ d }: { d: Overview }) {
  const s = payState(d.finance?.invoices ?? []);
  if (s.kind !== 'overdue') return null;
  return (
    <NmButton
      variant="soft"
      className="mt-3 min-h-[44px] w-full"
      onClick={() => {
        window.location.href = `tel:${CENTER_PHONE.replace(/\s/g, '')}`;
      }}
    >
      <Phone className="mr-2 size-4" />
      Qo&apos;ng&apos;iroq qilish
    </NmButton>
  );
}

/** The full money view: invoices and payment history. Balance is "Qoldiq". */
export function PaymentDetail({ d, title }: { d: Overview; title: string }) {
  const fin = d.finance ?? { balance: 0, invoices: [], payments: [] };
  const left = fin.balance < 0 ? -fin.balance : 0;
  return (
    <>
      <NmCard className={CARD}>
        <div className="mb-2 text-[13.5px] font-extrabold text-foreground">{title}</div>
        <PaymentLine d={d} />
        <div className="mt-3 rounded-[12px] bg-background px-3 py-2 text-[13px] font-semibold text-muted shadow-nm-inset-sm">
          {left > 0
            ? `Qoldiq: ${formatSom(left)}`
            : fin.balance > 0
              ? `Ortiqcha to'langan: ${formatSom(fin.balance)}`
              : `Qoldiq: ${formatSom(0)}`}
        </div>
        <PaymentCallButton d={d} />
      </NmCard>

      {fin.invoices?.length ? (
        <NmCard className={CARD}>
          <div className="mb-2 text-[13.5px] font-extrabold text-foreground">To&apos;lov hisoblari</div>
          <div className="flex flex-col gap-1.5">
            {fin.invoices.map((iv, i) => (
              <div key={i} className="flex flex-wrap justify-between gap-x-3 gap-y-1 rounded-[12px] bg-background px-3 py-2 text-[12.5px] shadow-nm-inset-sm">
                <span className="font-bold text-foreground">{periodLabel(iv.period)}</span>
                <span className="font-semibold text-muted">
                  {formatSom(iv.paidAmount)} / {formatSom(iv.amount)} · {dayLabel(iv.dueDate)}
                </span>
                <span className={iv.status === 'PAID' ? 'font-bold text-success' : 'font-bold text-warning'}>
                  {INV_ST[iv.status] ?? iv.status}
                </span>
              </div>
            ))}
          </div>
        </NmCard>
      ) : null}

      {fin.payments?.length ? (
        <NmCard className={CARD}>
          <div className="mb-2 text-[13.5px] font-extrabold text-foreground">To&apos;lovlar tarixi</div>
          <div className="flex flex-col gap-1.5">
            {fin.payments.map((p, i) => (
              <div key={i} className="flex justify-between gap-2 text-[12.5px]">
                <span className="truncate font-semibold text-muted">
                  {dayLabel(p.date)} · {PAY_METHOD[p.method] ?? p.method}
                  {p.note ? ` · ${p.note}` : ''}
                </span>
                <span className="shrink-0 font-bold text-success">+{formatSom(p.amount)}</span>
              </div>
            ))}
          </div>
        </NmCard>
      ) : null}
    </>
  );
}
