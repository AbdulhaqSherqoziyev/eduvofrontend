'use client';

import { CreditCard, Clock, Users } from 'lucide-react';
import { useDashboardMetrics } from '@/lib/hooks/use-dashboard';
import { StatCard } from '@/components/shared/stat-card';
import { StatusPill } from '@/components/shared/status-pill';
import { Skeleton } from '@/components/shared/skeleton';
import { ErrorCard } from '@/components/shared/error-card';
import { NmCard } from '@/components/ui/nm-card';
import { CircularProgress } from '@/components/ui/circular-progress';
import { formatMln, formatNumber } from '@/lib/utils/format';

/** Top row of 4 dashboard metric cards. */
export function MetricCards() {
  const query = useDashboardMetrics();

  if (query.isLoading) {
    return (
      <>
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="col-span-3 h-[150px]" />
        ))}
      </>
    );
  }

  if (query.isError || query.data === undefined) {
    return (
      <div className="col-span-12">
        <ErrorCard onRetry={() => query.refetch()} />
      </div>
    );
  }

  const m = query.data;

  return (
    <>
      <div className="col-span-3">
        <StatCard
          label="OYLIK DAROMAD"
          icon={<CreditCard size={20} />}
          value={formatMln(m.revenue)}
          accent
          footer={<StatusPill tone="success" label={'↑ ' + m.revenueDeltaPct + '% o,tgan oyga'} />}
        />
      </div>
      <div className="col-span-3">
        <StatCard
          label="KUTILAYOTGAN TO,LOV"
          icon={<Clock size={20} />}
          value={formatMln(m.expected)}
          footer={<StatusPill tone="muted" label={m.expectedInvoices + ' ta hisob kutilmoqda'} />}
        />
      </div>
      <div className="col-span-3">
        <StatCard
          label="FAOL O,QUVCHILAR"
          icon={<Users size={20} />}
          value={formatNumber(m.activeStudents)}
          unit="o,quvchi"
          footer={<StatusPill tone="success" label={'↑ ' + m.studentsAddedThisMonth + ' bu oy qo,shildi'} />}
        />
      </div>
      <NmCard className="col-span-3 p-[22px] flex items-center gap-[18px]">
        <CircularProgress value={m.attendanceRate} size={78} />
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.7px] text-muted">O,RTACHA DAVOMAT</div>
          <div className="mt-1 font-bold text-foreground">Yaxshi daraja</div>
          <div className="text-muted">Bu hafta bo,yicha</div>
        </div>
      </NmCard>
    </>
  );
}
