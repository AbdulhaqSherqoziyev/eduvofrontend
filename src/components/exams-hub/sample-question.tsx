'use client';
/**
 * "Namuna savol" (§3.1): the player's question card look (flat white, serif),
 * one practice item per family. Nothing is saved or sent.
 */
import { Check } from 'lucide-react';
import { useState } from 'react';
import { NmButton } from '@/components/ui/nm-button';
import type { ExamFamily } from '@/lib/exam/hub-types';
import { ht } from '@/lib/exam/i18n/hub';
import { cn } from '@/lib/utils/cn';

interface Sample { lead: string; prompt: string; options: { key: string; text: string }[]; answer: string }

// Exam content stays in the exam language (T43).
const SAMPLES: Partial<Record<ExamFamily, Sample>> = {
  IELTS: {
    lead: 'The first public library in the town opened in 1851 and was funded entirely by local merchants.',
    prompt: 'The library received money from the government.',
    options: [{ key: 'TRUE', text: 'TRUE' }, { key: 'FALSE', text: 'FALSE' }, { key: 'NOT GIVEN', text: 'NOT GIVEN' }],
    answer: 'FALSE',
  },
  CEFR: {
    lead: 'The museum is closed on Mondays. On other days it opens at 10 a.m. Entry is free for students.',
    prompt: 'When can a student visit the museum for free?',
    options: [{ key: 'A', text: 'On Monday at 10 a.m.' }, { key: 'B', text: 'On Tuesday at 11 a.m.' }, { key: 'C', text: 'Only at weekends' }],
    answer: 'B',
  },
};

export function SampleQuestion({ family }: { family: ExamFamily }) {
  const s = SAMPLES[family];
  const [pick, setPick] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  if (!s) return null;
  return (
    <div className="flex flex-col gap-3">
      <div>
        <div className="text-[15px] font-extrabold text-foreground">{ht('hubx.sample_title')}</div>
        <div className="text-[12.5px] font-semibold text-muted">{ht('hubx.sample_sub')}</div>
      </div>
      <div className="rounded-[18px] p-4 shadow-nm-inset">
        <div className="flex flex-col gap-3 rounded-[14px] border-[1.5px] border-[#D5DCE6] bg-white p-4 text-[#1E2A3A]" style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>
          <p className="text-[15px] leading-[1.65]">{s.lead}</p>
          <p className="text-[15.5px] font-semibold">{s.prompt}</p>
          <div role="radiogroup" className="flex flex-col gap-2">
            {s.options.map((o) => (
              <label key={o.key} className={cn('flex cursor-pointer items-center gap-2.5 rounded-[10px] border-[1.5px] px-3 py-2 text-[15px]', pick === o.key ? 'border-[#2E6BE6] bg-[#EAF1FE]' : 'border-[#E3E8EF]')}>
                <input type="radio" name={`sample-${family}`} className="accent-[#2E6BE6]" checked={pick === o.key} onChange={() => { setPick(o.key); setChecked(false); }} />
                {o.key !== o.text ? <b className="font-sans text-[13px]">{o.key}</b> : null}
                {o.text}
              </label>
            ))}
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <NmButton variant="ghost" size="sm" disabled={!pick} onClick={() => setChecked(true)}>{ht('hubx.sample_check')}</NmButton>
          {checked ? (
            <span className="inline-flex items-center gap-2.5" aria-live="polite">
              <span className="flex size-[26px] items-center justify-center rounded-[8px] bg-[#DDE3EC] text-[12px] font-extrabold text-[#5b6b82]">1</span>
              <span className="inline-flex items-center gap-1.5 rounded-[8px] bg-[#E5F5EE] px-2.5 py-1 text-[12px] font-bold text-[#1F7A55]">
                {pick === s.answer ? <><Check className="size-3" aria-hidden />{ht('x.correct_short')}</> : ht('results.correct_answer', { answer: s.answer })}
              </span>
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
