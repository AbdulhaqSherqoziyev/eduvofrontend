'use client';
/**
 * Writing detail (§4 AiTaskPanel). One score + "AI" chip, no ranges (Abdulhaq 10-12).
 * v1 contract gives `ai[]` = score, criteria
 * (free-form object) and feedback text; essay text with in-line marks is not in
 * the result payload yet, so only what the API sends is drawn.
 */
import { Check, Hourglass, UserCheck } from 'lucide-react';
import { NmCard } from '@/components/ui/nm-card';
import { ht } from '@/lib/exam/i18n/hub';
import { aiScore } from '@/lib/exam/result-summary';
import type { ResultResp } from '@/lib/exam/types';
import { feedbackOf, parseCriteria } from '@/lib/exam/ai-feedback';
import { criterionLabel, criterionMax, criterionValue } from '@/lib/exam/criteria-labels';
import type { ExamFamily } from '@/lib/exam/hub-types';

type Ai = ResultResp['ai'][number] & { criteria?: unknown; feedback?: string | null };

/** `[{name, score, max, note}]` (grading runner) or `{name: band | {min,max}}` → bars (shared with the player panel). */
const criteria = (c: unknown) => parseCriteria(c);

export function AiTaskPanel({ r, family }: { r: ResultResp; family: ExamFamily }) {
  const tasks = r.ai as Ai[];
  const one = (v: number) => criterionValue(family, v);
  const top = criterionMax(family);
  if (!tasks.length) {
    return (
      <NmCard className="flex items-center gap-2 p-6 text-[14px] font-semibold text-[#5b6b82]">
        <Hourglass className="size-4 text-[#5B3FD1]" aria-hidden />{ht('results.grading_writing')} {ht('hubx.others_ready_above')}
      </NmCard>
    );
  }
  return (
    <div className="flex flex-col gap-4">
      {tasks.map((a, i) => {
        const v = aiScore(a);
        const val = v != null ? one(v) : null;
        const crit = criteria(a.criteria);
        const fb = a.status === 'READY' ? feedbackOf(a) : null;
        return (
          <NmCard key={a.taskKey} className="flex flex-col gap-3 rounded-[24px] p-6 max-md:p-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-[15px] font-extrabold text-foreground">{ht('hubx.task_n', { n: i + 1 })}</span>
              {a.status === 'READY' && val ? <span className="text-[28px] font-extrabold tabular-nums text-foreground">{val}</span> : null}
              <span className="rounded-[7px] bg-[#EEE9FF] px-2 py-0.5 text-[10.5px] font-extrabold text-[#5B3FD1]">{ht('x.ai_badge')}</span>
            </div>
            {a.status === 'GRADING' ? (
              <p className="flex items-center gap-1.5 text-[13px] font-semibold text-[#5b6b82]"><Hourglass className="size-3.5" aria-hidden />{ht('results.grading_writing')}</p>
            ) : a.status === 'NEEDS_HUMAN' ? (
              <p className="flex items-center gap-1.5 text-[13px] font-semibold text-[#5b6b82]"><UserCheck className="size-3.5" aria-hidden />{ht('results.human_review')}</p>
            ) : val == null ? (
              <p className="text-[13px] font-medium text-[#5b6b82]">{ht('results.no_response')}</p>
            ) : null}
            {crit.map((c) => (
              <div key={c.name} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1">
                <span className="text-[13px] font-bold text-foreground">{criterionLabel(family, c.name, i)}</span>
                <span className="text-[13px] font-extrabold tabular-nums text-foreground">{one(c.min)}</span>
                <div className="col-span-2 h-2 overflow-hidden rounded-[4px] bg-[#DDE3EC]">
                  <div className="h-full rounded-[4px] bg-primary" style={{ width: `${Math.min(100, (c.min / top) * 100)}%` }} />
                </div>
              </div>
            ))}
            {fb?.summary ? <p className="whitespace-pre-line text-[13.5px] leading-[1.6] text-[#5b6b82]">{fb.summary}</p> : null}
            {fb?.strengths.length ? (
              <div className="flex flex-col gap-2">
                <div className="text-[13px] font-extrabold text-foreground">{ht('results.strengths')}</div>
                {fb.strengths.map((x, k) => (
                  <div key={k} className="flex items-start gap-2.5 rounded-[12px] px-3.5 py-2.5 shadow-nm-inset-sm">
                    <Check className="mt-0.5 size-4 shrink-0 text-[#1F7A55]" aria-hidden />
                    <span className="text-[13.5px] leading-[1.6] text-[#5b6b82]" style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>{x}</span>
                  </div>
                ))}
              </div>
            ) : null}
            {fb?.nextSteps.length ? (
              <div className="flex flex-col gap-2">
                <div className="text-[13px] font-extrabold text-foreground">{ht('results.next_steps')}</div>
                {fb.nextSteps.map((x, k) => (
                  <div key={k} className="flex items-start gap-2.5 rounded-[12px] px-3.5 py-2.5 shadow-nm-inset-sm">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
                    <span className="text-[13.5px] leading-[1.6] text-[#5b6b82]" style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>{x}</span>
                  </div>
                ))}
              </div>
            ) : null}
          </NmCard>
        );
      })}
    </div>
  );
}
