"use client";

import { useState } from "react";
import { TrendingUp, Clock, TrendingDown, Wallet } from "lucide-react";
import { NmCard } from "@/components/ui/nm-card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { SummaryCard } from "@/components/shared/summary-card";
import { QueryBoundary } from "@/components/shared/query-boundary";
import { ErrorCard } from "@/components/shared/error-card";
import { EmptyState } from "@/components/shared/empty-state";
import { CardGridSkeleton } from "@/components/shared/skeleton";
import { useFinanceReport } from "@/lib/hooks/use-reports";
import type { FinanceReport as FinanceReportData } from "@/lib/types/report";
import { apiErrorMessage } from "@/lib/utils/api-error";
import { formatDate } from "@/lib/utils/date";
import { formatSom } from "@/lib/utils/format";
import { CUSTOM_PERIOD, FinancePeriod, defaultRange, rangeSendable, type DateRange } from "./finance-period";

/** "So'nggi 6 oy" for a preset; "01.07.2026 – 05.10.2026" for a free range. */
function periodCaption(period: string, data: FinanceReportData, applied: DateRange): string {
  if (period !== CUSTOM_PERIOD) return `So'nggi ${period} oy`;
  return `${formatDate(data.from ?? applied.from)} – ${formatDate(data.to ?? applied.to)}`;
}

/** Finance report — period selector, summary totals, monthly bars + expense breakdown. */
export function FinanceReport() {
  const [period, setPeriod] = useState("6");
  const [range, setRange] = useState<DateRange>(defaultRange);
  // The last range that passed validation. The request always follows this one,
  // so a half-typed or inverted range leaves the previous report on screen and
  // never reaches the server.
  const [applied, setApplied] = useState<DateRange>(range);

  function changeRange(next: DateRange) {
    setRange(next);
    if (rangeSendable(next)) setApplied(next);
  }

  const custom = period === CUSTOM_PERIOD;
  const query = useFinanceReport(custom ? { from: applied.from, to: applied.to } : { months: Number(period) });

  // A 400 is the server rejecting the range in words written for this user —
  // show them. Retrying would only repeat the same request; fixing the dates
  // refires on its own.
  const status = (query.error as { response?: { status?: number } } | null)?.response?.status;
  const rejected = query.isError && status === 400 ? apiErrorMessage(query.error) : null;

  return (
    <div className="flex flex-col gap-4">
      <FinancePeriod period={period} onPeriodChange={setPeriod} range={range} onRangeChange={changeRange} />
      {rejected ? (
        <ErrorCard message={rejected} />
      ) : (
        <QueryBoundary
          query={query}
          loading={<CardGridSkeleton count={4} />}
          isEmpty={() => false}
          empty={<EmptyState title="Ma'lumot yo'q" />}
        >
          {(data) => {
            const maxIncome = Math.max(...data.rows.map((r) => r.income), 1);
            const maxCat = Math.max(...data.byCategory.map((c) => c.amount), 1);
            return (
              <div className="flex flex-col gap-[22px]">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-[22px]">
                  <SummaryCard label="Yig'ilgan" value={formatSom(data.collected)} icon={<TrendingUp className="size-[22px]" />} tone="success" />
                  <SummaryCard label="Kutilgan" value={formatSom(data.expected)} icon={<Clock className="size-[22px]" />} tone="muted" />
                  <SummaryCard label="Xarajat" value={formatSom(data.expense)} icon={<TrendingDown className="size-[22px]" />} tone="danger" />
                  <SummaryCard label="Sof" value={formatSom(data.net)} icon={<Wallet className="size-[22px]" />} tone="primary" />
                </div>
                <NmCard className="p-[22px]">
                  <div className="mb-3">
                    <div className="text-[13px] font-extrabold text-foreground">Oylar kesimida (daromad / xarajat)</div>
                    <div className="mt-0.5 text-[11.5px] font-medium text-muted">{periodCaption(period, data, applied)}</div>
                  </div>
                  <div className="flex flex-col gap-4">
                    {data.rows.map((row) => (
                      <div key={row.from ?? row.label} className="grid grid-cols-[1.4fr_2fr_1fr_1fr] items-center gap-4">
                        <div className="text-[13px] font-bold text-foreground">{row.label}</div>
                        <ProgressBar value={(row.income / maxIncome) * 100} />
                        <div className="text-right text-[13px] font-bold text-success">{formatSom(row.income)}</div>
                        <div className="text-right text-[13px] font-bold text-danger">{formatSom(row.expense)}</div>
                      </div>
                    ))}
                  </div>
                </NmCard>
                {data.byCategory.length ? (
                  <NmCard className="p-[22px]">
                    <div className="mb-3 text-[13px] font-extrabold text-foreground">Kategoriya kesimida</div>
                    <div className="flex flex-col gap-3">
                      {data.byCategory.map((c) => (
                        <div key={c.category} className="grid grid-cols-[1.4fr_2.4fr_1fr] items-center gap-4">
                          <div className="text-[13px] font-bold text-foreground">{c.category}</div>
                          <ProgressBar value={(c.amount / maxCat) * 100} />
                          <div className="text-right text-[13px] font-bold text-foreground">{formatSom(c.amount)}</div>
                        </div>
                      ))}
                    </div>
                  </NmCard>
                ) : null}
              </div>
            );
          }}
        </QueryBoundary>
      )}
    </div>
  );
}
