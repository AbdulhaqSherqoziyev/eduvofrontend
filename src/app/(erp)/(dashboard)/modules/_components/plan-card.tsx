'use client';

import { Clock, CreditCard } from 'lucide-react';
import { NmCard } from '@/components/ui/nm-card';
import { StatusPill } from '@/components/shared/status-pill';
import { SUPPORT_PHONE, SUPPORT_PHONE_HREF } from '@/lib/constants/contact';
import { formatNumber } from '@/lib/utils/format';
import type { ModulesOverview } from '@/lib/types/module';

/**
 * The center's current plan.
 *
 * Deliberately not a launchpad: there is no "upgrade" button anywhere, because
 * plans are sold by phone. The phone row is what keeps the page from being a
 * dead end — the screen is called "Tarif va modullar", so "Tarif" has to lead
 * somewhere (R10).
 */
export function PlanCard({ data }: { data: ModulesOverview }) {
  return (
    <NmCard className="flex flex-col gap-3.5 p-[22px]">
      <div className="flex flex-wrap items-start justify-between gap-3 max-[480px]:flex-col">
        <div className="flex min-w-0 items-center gap-3.5">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-[14px] bg-background text-primary shadow-nm-inset-sm">
            <CreditCard className="size-[21px]" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-[17px] font-extrabold text-foreground">
              {data.planName ?? 'Joriy tarif'}
            </p>
            <p className="text-[12.5px] font-semibold text-muted">Joriy tarif</p>
          </div>
        </div>
        {data.showPrices ? (
          <div className="flex items-end gap-1.5">
            <span className="text-[20px] font-extrabold leading-none text-foreground">
              {formatNumber(data.monthlyFee)}
            </span>
            <span className="text-[12.5px] font-bold text-muted">so&apos;m/oy</span>
          </div>
        ) : null}
      </div>

      {data.trial.active ? (
        <div className="flex flex-col gap-2">
          <StatusPill
            tone="warning"
            className="w-fit"
            icon={<Clock className="size-[13px] shrink-0" />}
            label={`Sinov davri — ${data.trial.daysLeft} kun qoldi`}
          />
          {/* Closes the "so when does the bill land?" question before it forms.
              No countdown, no red, no "hurry" — the days left are enough. */}
          <p className="text-[12px] font-semibold text-muted">
            To&apos;lov sinov tugagach boshlanadi.
          </p>
        </div>
      ) : null}

      <p className="flex min-h-[36px] flex-wrap items-center gap-x-1.5 text-[12.5px] font-semibold text-muted">
        Tarifni o&apos;zgartirish — qo&apos;ng&apos;iroq qiling:
        <a href={SUPPORT_PHONE_HREF} className="font-bold text-primary">
          {SUPPORT_PHONE}
        </a>
      </p>
    </NmCard>
  );
}
