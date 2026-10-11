'use client';
/** Dark card (§4, v1 without overall) and the Writing grading strip. No badge, streak or confetti. */
import { Check, Trophy, TrendingUp } from 'lucide-react';
import { ht } from '@/lib/exam/i18n/hub';
import { satRange } from '@/lib/exam/sat/flow';
import type { HeroFacts } from '@/lib/exam/result-facts';
import type { ResultResp } from '@/lib/exam/types';
import { cn } from '@/lib/utils/cn';


function Chip({ icon, text }: { icon?: React.ReactNode; text: string }) {
  return <span className="inline-flex items-center gap-1.5 rounded-[9px] bg-white/10 px-2.5 py-1 text-[12px] font-bold">{icon}{text}</span>;
}

/** SAT total band = sum of the section bands (contract §1b). */
function satTotalRange(r: ResultResp): { a: number; b: number } {
  const bands = r.sections.filter((x) => x.scaled != null).map((x) => satRange(x.scaled!));
  return { a: bands.reduce((n, b) => n + b[0], 0), b: bands.reduce((n, b) => n + b[1], 0) };
}

export function ResultHero({ r, facts }: { r: ResultResp; facts: HeroFacts }) {
  const taken = r.sections.filter((s) => s.status !== 'NOT_TAKEN').length;
  return (
    <div className="flex min-h-[180px] flex-col justify-between gap-3 rounded-[24px] bg-[#1E2A3A] p-6 text-white">
      {facts.mockN ? <div className="text-[10.5px] font-bold tracking-[0.8px] text-[#9DB8F5]">{ht('results.mock_n', { n: facts.mockN }).toUpperCase()}</div> : null}
      {r.overall ? (
        <div className="flex flex-wrap items-end gap-2.5">
          <span className="text-[60px] font-extrabold leading-none tracking-[-2px]">{r.overall.label}</span>
          {r.overall.estimated ? <span title={ht('results.estimated_tip')} className="mb-1.5 rounded-[7px] bg-white/15 px-2 py-0.5 text-[10.5px] font-extrabold">{ht('results.estimated')}</span> : null}
          {r.examCode.startsWith('SAT') ? <span className="w-full text-[12.5px] font-semibold text-[#AEB9CB]">{ht('sat.range', satTotalRange(r))}</span> : null}
        </div>
      ) : (
        <div>
          <div className="text-[15px] font-bold">{ht('hubx.n_sections_result', { n: taken })}</div>
          <p className="mt-1 text-[12.5px] font-medium leading-[1.5] text-[#AEB9CB]">{ht('hub.no_overall_v1')}</p>
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        {facts.personalBest ? <Chip icon={<Trophy className="size-3.5" aria-hidden />} text={`${ht('results.personal_best')}: ${facts.personalBest}`} /> : null}
        {facts.sinceLast ? <Chip icon={<TrendingUp className="size-3.5" aria-hidden />} text={`${facts.sinceLast.section}: ${ht('hubx.since_last_short', { delta: facts.sinceLast.delta })}`} /> : null}
        {!facts.sinceLast && facts.sameAsLast ? <Chip text={ht('results.same_as_last')} /> : null}
      </div>
    </div>
  );
}

const STEPS = ['results.strip_received', 'results.strip_scoring', 'results.strip_double_check', 'results.strip_ready'] as const;

/** v1: the AI pipeline does not report sub-steps yet → "Qabul qilindi" done, "Baholanmoqda" current. */
export function GradingStrip({ r }: { r: ResultResp }) {
  if (!r.sections.some((s) => s.status === 'GRADING' || s.status === 'NEEDS_HUMAN')) return null;
  const current = 1;
  return (
    <div className="flex flex-col gap-3 rounded-[24px] bg-background p-5 shadow-nm md:flex-row md:items-center md:gap-5">
      <div className="min-w-0 flex-1">
        <div className="text-[14px] font-extrabold text-foreground">{ht('results.grading_writing')}</div>
        <div className="mt-0.5 text-[13px] font-medium text-[#5b6b82]">{ht('results.can_leave')}</div>
      </div>
      <ol className="flex flex-wrap items-center gap-2 text-[12px] font-bold">
        {STEPS.map((k, i) => (
          <li key={k} className={cn('inline-flex items-center gap-1.5', i === current ? 'text-primary' : i < current ? 'text-[#5b6b82]' : 'text-[#9aa6b8]')}>
            {i < current ? <Check className="size-3.5" aria-hidden /> : i === current ? <span className="size-2 rounded-full bg-primary" aria-hidden /> : null}
            {ht(k)}
            {i < STEPS.length - 1 ? <span className="text-[#9aa6b8]" aria-hidden>→</span> : null}
          </li>
        ))}
      </ol>
    </div>
  );
}
