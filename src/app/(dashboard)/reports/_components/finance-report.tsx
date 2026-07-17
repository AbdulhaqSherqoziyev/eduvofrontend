"use client";

import { useState } from "react";
import { TrendingUp, Clock, TrendingDown, Wallet } from "lucide-react";
import { NmCard } from "@/components/ui/nm-card";
import { NmSegmented } from "@/components/ui/nm-segmented";
import { ProgressBar } from "@/components/ui/progress-bar";
import { SummaryCard } from "@/components/shared/summary-card";
import { QueryBoundary } from "@/components/shared/query-boundary";
import { EmptyState } from "@/components/shared/empty-state";
import { CardGridSkeleton } from "@/components/shared/skeleton";
import { useFinanceReport } from "@/lib/hooks/use-reports";
import { formatSom } from "@/lib/utils/format";

const PERIODS = [
  { value: "3", label: "3 oy" },
  { value: "6", label: "6 oy" },
  { value: "12", label: "12 oy" },
];

/** Finance report — period selector, summary totals, monthly bars + expense breakdown. */
export function FinanceReport() {
  const [months, setMonths] = useState("6");
  const query = useFinanceReport({ months: Number(months) });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <NmSegmented items={PERIODS} value={months} onValueChange={setMonths} />
      </div>
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
                <div className="mb-3 text-[13px] font-extrabold text-foreground">Oylar kesimida (daromad / xarajat)</div>
                <div className="flex flex-col gap-4">
                  {data.rows.map((row) => (
                    <div key={row.label} className="grid grid-cols-[1.4fr_2fr_1fr_1fr] items-center gap-4">
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
    </div>
  );
}
