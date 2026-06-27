'use client';

import { useIncomeChart } from '@/lib/hooks/use-dashboard';
import { QueryBoundary } from '@/components/shared/query-boundary';
import { EmptyState } from '@/components/shared/empty-state';
import { Skeleton } from '@/components/shared/skeleton';
import { NmCard } from '@/components/ui/nm-card';
import { buildChart } from './chart-path';

/** Income dynamics area chart for the last months. */
export function IncomeChart() {
  const query = useIncomeChart();

  return (
    <NmCard className="col-span-8 p-[22px]">
      <div className="mb-[18px] flex items-start justify-between">
        <div>
          <div className="text-[17px] font-extrabold tracking-[-0.3px] text-foreground">Daromad dinamikasi</div>
          <div className="text-muted">Oxirgi 7 oy · mln so,m</div>
        </div>
        <div className="rounded-ctl bg-background px-3 py-1.5 text-[11px] font-bold tracking-[0.7px] text-muted shadow-nm-inset-sm">
          2026
        </div>
      </div>
      <QueryBoundary
        query={query}
        loading={<Skeleton className="h-[240px] w-full" />}
        isEmpty={(d) => d.length === 0}
        empty={<EmptyState title="Ma,lumot yo,q" />}
      >
        {(data) => {
          const { linePath, areaPath, points } = buildChart(data);
          return (
            <svg viewBox="0 0 720 240" className="w-full">
              <defs>
                <linearGradient id="income-area" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(46,107,230,0.2)" />
                  <stop offset="100%" stopColor="rgba(46,107,230,0)" />
                </linearGradient>
              </defs>
              <path d={areaPath} fill="url(#income-area)" />
              <path d={linePath} fill="none" stroke="var(--primary)" strokeWidth={3} strokeLinecap="round" />
              {points.map((p) => (
                <g key={p.month}>
                  <circle cx={p.x} cy={p.y} r={4.5} fill="#E8ECF3" stroke="var(--primary)" strokeWidth={2.5} />
                  <text x={p.x} y={234} textAnchor="middle" fill="#7A8699" fontSize={12} fontWeight={600}>
                    {p.month}
                  </text>
                </g>
              ))}
            </svg>
          );
        }}
      </QueryBoundary>
    </NmCard>
  );
}
