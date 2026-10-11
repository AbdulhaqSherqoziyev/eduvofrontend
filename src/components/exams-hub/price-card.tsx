'use client';
/**
 * PriceCard — v1 "Tayinlov rejimi" (Sevara final review 10-10): no variant picker,
 * only an info line of the variants already done, the assignment title
 * ("Hozircha tayinlanmagan" without one) and `hub.self_practice_off`. Plus "Qanday baholanadi".
 */
import { NmCard } from '@/components/ui/nm-card';
import type { HubExam } from '@/lib/exam/hub-types';
import { ht } from '@/lib/exam/i18n/hub';

interface Props {
  tests: { id: string; title: string }[];
  doneTests: Set<string>;
  hasAssignment: boolean;
}

export function PriceCard({ tests, doneTests, hasAssignment }: Props) {
  const done = tests.filter((t) => doneTests.has(t.id));
  const allDone = tests.length > 0 && done.length === tests.length;
  return (
    <NmCard className="flex flex-col gap-3 p-6">
      {done.length ? (
        <p className="text-[13px] font-semibold leading-[1.5] text-[#5b6b82]">
          {ht('hubx.done_variants', { list: done.map((t) => `${t.title} ✓`).join(', ') })}
        </p>
      ) : null}
      {allDone ? <p className="text-[12.5px] font-semibold leading-[1.5] text-muted">{ht('hub.repeat_variant_note')}</p> : null}
      <div className="text-[20px] font-extrabold tracking-[-0.4px] text-foreground">
        {ht(hasAssignment ? 'hubx.assigned_exam' : 'hubx.not_assigned')}
      </div>
      <p className="text-[12px] font-semibold leading-[1.5] text-muted">{ht('hub.self_practice_off')}</p>
    </NmCard>
  );
}

export function HowGraded({ exam }: { exam: Pick<HubExam, 'sections'> }) {
  const hasAi = exam.sections.some((s) => s.available && s.gradingKind !== 'objective');
  return (
    <NmCard className="flex flex-col gap-3.5 p-6">
      <div className="text-[15px] font-extrabold text-foreground">{ht('hubx.how_graded')}</div>
      <div className="flex gap-3">
        <span className="h-max rounded-[7px] bg-[#E5F5EE] px-2 py-1 text-[10.5px] font-extrabold text-[#1F7A55]">AUTO</span>
        <p className="text-[13px] font-medium leading-[1.55] text-[#5b6b82]">{ht('hubx.how_auto')}</p>
      </div>
      {hasAi ? (
        <div className="flex gap-3">
          <span className="h-max rounded-[7px] bg-[#EEE9FF] px-2 py-1 text-[10.5px] font-extrabold text-[#5B3FD1]">AI</span>
          <p className="text-[13px] font-medium leading-[1.55] text-[#5b6b82]">{ht('hubx.how_ai')}</p>
        </div>
      ) : null}
    </NmCard>
  );
}
