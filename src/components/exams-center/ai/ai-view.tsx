'use client';

import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { QueryBoundary } from '@/components/shared/query-boundary';
import { EmptyState } from '@/components/shared/empty-state';
import { Skeleton } from '@/components/shared/skeleton';
import { useGradingJobs, useGradingStats } from '@/lib/hooks/use-center-exams-v3';
import type { GradingJob, GradingStats } from '@/lib/api/center-exams-v3';
import { cn } from '@/lib/utils/cn';
import { finalLabel, minSec } from '../exam-meta';
import { JOB_ST, SH } from '../tokens';
import { ConsoleHeader, KpiCard, KpiGrid, ToneChip } from '../ui';
import { JobDetail } from './job-detail';

/** AI baholash (design v3 AI GRADING): KPI row, job list left, selected job right. */
export function AiView() {
  const stats = useGradingStats();
  const jobs = useGradingJobs();
  const [picked, setPicked] = useState<string | null>(null);
  return (
    <section className="flex flex-col pb-6">
      <ConsoleHeader title="AI baholash" subtitle="Writing va Speaking avtomatik AI orqali baholanadi. O'qituvchi ball qo'ymaydi." />
      <AiKpis s={stats.data} />
      <QueryBoundary
        query={jobs}
        loading={<div className="grid gap-[22px] xl:grid-cols-[340px_minmax(0,1fr)]"><Skeleton className="h-[420px]" /><Skeleton className="h-[420px]" /></div>}
        isEmpty={(d) => d.length === 0}
        empty={<EmptyState icon={<Sparkles className="size-6" />} title="Hali baholash ishi yo'q" hint="O'quvchilar Writing yoki Speaking topshirganda ishlar shu yerda chiqadi." />}
      >
        {(list) => {
          const current = list.find((j) => j.id === picked) ?? list[0];
          return (
            <div className="grid items-start gap-[22px] xl:grid-cols-[340px_minmax(0,1fr)]">
              <div className="flex flex-col gap-3">
                {list.map((j) => <JobCard key={j.id} j={j} active={j.id === current.id} onPick={() => setPicked(j.id)} />)}
              </div>
              <JobDetail key={current.id} job={current} />
            </div>
          );
        }}
      </QueryBoundary>
    </section>
  );
}

function AiKpis({ s }: { s?: GradingStats }) {
  return (
    <KpiGrid>
      <KpiCard size={26} label="BUGUN BAHOLANDI" value={s ? String(s.gradedToday) : '—'} sub={s ? `${s.writingToday} writing · ${s.speakingToday} speaking` : undefined} />
      <KpiCard size={26} label="O'RTACHA VAQT" value={minSec(s?.avgTurnaroundSec)} sub="topshirgandan natijagacha" />
      <KpiCard size={26} label="IKKI BAHO MOS" value={s?.agreementPct != null ? `${Math.round(s.agreementPct)}%` : '—'} sub="farq ≤ 0.5 band" />
      <KpiCard size={26} label="KALIBRLASH" value={s?.calibration != null ? `± ${s.calibration.toFixed(2)}` : '—'} sub="ekspert bahosiga nisbatan" />
    </KpiGrid>
  );
}

function JobCard({ j, active, onPick }: { j: GradingJob; active: boolean; onPick: () => void }) {
  const [label, fg, bg] = JOB_ST[j.status];
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onPick}
      className={cn('w-full rounded-[18px] bg-background px-[18px] py-[15px] text-left transition-shadow', active ? SH.inset : SH.card)}
    >
      <div className="flex items-center justify-between gap-2.5">
        <div className="truncate text-[14.5px] font-extrabold">{j.studentName}</div>
        <ToneChip label={label} fg={fg} bg={bg} size={10.5} />
      </div>
      <div className="mt-[5px] text-[12.5px] font-semibold text-muted">{j.task}</div>
      <div className="mt-2 text-[12.5px] font-bold text-[#5b6b82]">Natija: {finalLabel(j.final)}</div>
    </button>
  );
}
