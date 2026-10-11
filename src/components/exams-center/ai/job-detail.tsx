'use client';

import { Skeleton } from '@/components/shared/skeleton';
import { useGradingJob } from '@/lib/hooks/use-center-exams-v3';
import type { GradingJob, GradingJobDetail } from '@/lib/api/center-exams-v3';
import { cn } from '@/lib/utils/cn';
import { examErrorText } from '../exam-errors';
import { finalLabel, formatScore } from '../exam-meta';
import { SH } from '../tokens';
import { Card, InlineError } from '../ui';

const STEPS = {
  s: ['Audio yuklandi', 'Speech-to-text', "AI: fluency, lug'at, grammatika", 'Talaffuz API', 'Birlashtirish'],
  w: ['Matn qabul qilindi', "So'z soni (kod)", 'AI: 1-baholash', 'AI: 2-baholash', 'Natija'],
};

/** Selected job (design v3 `jb`): meta, final band, pipeline, 3 passes, criteria, text. */
export function JobDetail({ job }: { job: GradingJob }) {
  const running = job.status === 'run' || job.status === 'retry';
  const q = useGradingJob(job.id, running);
  const d: GradingJob & Partial<GradingJobDetail> = { ...job, ...q.data };
  const scored = d.status === 'done' || d.status === 'third';
  const passes = d.passes ?? [null, null, null];
  const pass = (v: string | null, i: number) => v ?? (i === 2 || scored ? '—' : '…');
  const body = d.kind === 's' ? (d.transcript ? `Transkript: "${d.transcript}"` : null) : d.text;

  return (
    <Card className="flex min-w-0 flex-col gap-5 px-5 py-6 md:px-7 md:py-[26px]">
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div className="min-w-0">
          <div className="text-[19px] font-extrabold">{d.studentName} · {d.task}</div>
          <div className="mt-[5px] text-[13px] font-semibold text-muted">{d.meta}</div>
        </div>
        <div className="text-right">
          <div className="text-[10.5px] font-bold tracking-[0.8px] text-muted">YAKUNIY BALL</div>
          <div className="text-[30px] font-extrabold tracking-[-0.6px] text-primary">{finalLabel(d.final)}</div>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {STEPS[d.kind].map((t, i, all) => {
          const reached = i <= d.step;
          const now = i === d.step && d.status !== 'done';
          return (
            <div key={t} className="flex items-center gap-2">
              <span
                className={cn('flex h-8 items-center rounded-[10px] px-3 text-[12.5px] font-bold', reached ? SH.rsm : SH.inset)}
                style={{ color: reached ? (now ? '#2E6BE6' : undefined) : '#9aa6b8' }}
              >
                {t}
              </span>
              {i < all.length - 1 ? <span className="font-extrabold text-[#B4BDCA]">→</span> : null}
            </div>
          );
        })}
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {['1-BAHOLASH', '2-BAHOLASH', '3-BAHOLASH (MEDIAN)'].map((k, i) => (
          <div key={k} className={`rounded-[16px] px-4 py-3.5 ${SH.well}`}>
            <div className="text-[10.5px] font-bold tracking-[0.7px] text-[#9aa6b8]">{k}</div>
            <div className="mt-1 text-[20px] font-extrabold" style={{ color: i === 2 ? (passes[2] != null ? '#7A4E00' : '#9aa6b8') : undefined }}>
              {pass(passes[i], i)}
            </div>
          </div>
        ))}
      </div>
      {q.isLoading ? <Skeleton className="h-[120px] w-full" /> : null}
      {q.isError && !q.data ? <InlineError text={examErrorText(q.error, "Ish tafsilotini yuklab bo'lmadi.")} onRetry={() => q.refetch()} /> : null}
      {d.criteria?.length ? (
        <div className="grid grid-cols-1 gap-x-[26px] gap-y-3.5 md:grid-cols-2">
          {d.criteria.map((c) => (
            <div key={c.name} className="flex flex-col gap-[7px]">
              <div className="flex justify-between text-[13.5px] font-bold"><span>{c.name}</span><span>{scored ? formatScore(c.score) : '…'}</span></div>
              <div className="h-[7px] rounded-[4px] shadow-[inset_1px_1px_3px_rgba(163,177,198,0.6)] dark:shadow-nm-inset-sm">
                <div className="h-full rounded-[4px] bg-[#2E6BE6]" style={{ width: scored && c.max ? `${Math.round((c.score / c.max) * 100)}%` : '0%' }} />
              </div>
              <div className="text-[12.5px] leading-[1.5] text-[#5b6b82]">{c.note}</div>
            </div>
          ))}
        </div>
      ) : null}
      {body ? (
        <div className={`whitespace-pre-line rounded-[16px] px-5 py-[18px] font-serif text-[15.5px] leading-[1.75] text-[#26313F] dark:text-foreground ${SH.well}`} style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>
          {body}
        </div>
      ) : null}
      <div className="flex items-center gap-2.5 text-[12.5px] font-bold leading-[1.5] text-muted">
        <span className="size-2 flex-shrink-0 rounded-full bg-[#5B3FD1]" />
        O&apos;qituvchi ball qo&apos;ymaydi. Ikki baho 0.5 dan ko&apos;p farq qilsa, tizim avtomatik 3-marta baholaydi va o&apos;rtadagi (median) ballni oladi.
      </div>
    </Card>
  );
}
