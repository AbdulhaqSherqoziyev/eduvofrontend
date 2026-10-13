'use client';

import { useState } from 'react';
import { Can } from '@/components/shared/can';
import { NmSegmented } from '@/components/ui/nm-segmented';
import { isCenterAdmin } from '@/lib/auth/permissions';
import { moduleOn } from '@/lib/auth/module-gate';
import { useModuleGateVersion } from '@/lib/hooks/use-module-gate';
import { PaymentSummaryStrip } from './payment-summary-strip';
import { InvoiceTable } from './invoice-table';
import { StudentPaymentDialog } from './student-payment-dialog';
import { RemindersPanel } from './reminders-panel';

const TABS = [
  { value: 'invoices', label: "To'lovlar" },
  { value: 'reminders', label: 'Eslatmalar' },
];

/**
 * Payments screen. Debt reminders live here as a tab rather than as their own
 * page: chasing a debt is the same job as taking the payment that clears it,
 * and a separate nav entry would split one workflow across two screens.
 *
 * The tab follows the same rule as the sidebar — a module the center has not
 * bought is not shown at all. It is also admin-only, because the endpoint
 * behind it is.
 */
export function PaymentsView() {
  const [tab, setTab] = useState('invoices');
  useModuleGateVersion();
  const showReminders = moduleOn('reminders') && isCenterAdmin();
  const onReminders = showReminders && tab === 'reminders';

  return (
    <section className="flex flex-col gap-[22px]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {showReminders ? (
          <NmSegmented items={TABS} value={tab} onValueChange={setTab} className="sm:max-w-[320px]" />
        ) : (
          <div />
        )}
        {!onReminders ? (
          <Can permission="payment.create">
            <StudentPaymentDialog />
          </Can>
        ) : null}
      </div>

      {onReminders ? (
        <RemindersPanel />
      ) : (
        <>
          <PaymentSummaryStrip />
          <InvoiceTable />
        </>
      )}
    </section>
  );
}
