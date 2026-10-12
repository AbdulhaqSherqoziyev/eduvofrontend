'use client';
/** ReviewRow (§4 / player G10): grey number always, green "To'g'ri javob" chip, no red, no strike-through.
 * Not-correct rows: amber left rail + warm tint (10-12). Opens explanation + `evidence` (§1.10). */
import { Check, ChevronDown, TextSearch } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useState } from 'react';
import { BoldText } from '@/components/exam/shell/BoldText';
import { NmButton } from '@/components/ui/nm-button';
import { ht } from '@/lib/exam/i18n/hub';
import { correctLabel, rowNo } from '@/lib/exam/review-label';
import { evidenceText } from '@/lib/exam/result-summary';
import type { ReviewRow as Row } from '@/lib/exam/types';
import { cn } from '@/lib/utils/cn';

// KaTeX only for SAT Math rows, in its own chunk
const MathText = dynamic(() => import('@/components/exam/sat/MathText').then((m) => m.MathText));

const fmt = (v: Row['yours']) => (Array.isArray(v) ? v.join(', ') : v ?? '');

/** `defaultOpen` — the staff result page's "Hammasini ochish" (remount with a new key to apply). */
export function ReviewRow({ r, onPassage, defaultOpen = false }: { r: Row; onPassage?: (anchor: string) => void; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const yours = fmt(r.yours);
  // SAT Math: LaTeX in explanations + the "fill the field" note on a short decimal (contract §1b hint)
  const math = r.sectionKey === 'math';
  const sprNote = r.hint === 'DECIMAL_NOT_FULL';
  const evidence = evidenceText(r.evidence);
  const canOpen = !!(r.explanation || evidence || sprNote || (r.passageAnchor && onPassage));
  return (
    <div className={cn('rounded-[14px] shadow-nm-inset-sm', !r.isCorrect && 'border-l-[3px] border-[#E0A93B] bg-[#FFF8EA] dark:bg-[#E0A93B]/10')}>
      <button
        type="button"
        onClick={() => canOpen && setOpen((o) => !o)}
        aria-expanded={canOpen ? open : undefined}
        className={cn('grid min-h-11 w-full grid-cols-[auto_minmax(0,1fr)_auto_20px] items-center gap-2.5 px-3 py-2 text-left', !canOpen && 'cursor-default')}
      >
        <span className="flex h-[26px] min-w-[26px] items-center justify-center whitespace-nowrap rounded-[8px] bg-[#DDE3EC] px-1 text-[12px] font-extrabold text-[#5b6b82]">{rowNo(r)}</span>
        <span className={cn('truncate text-[13.5px]', !yours ? 'font-semibold italic text-muted' : r.isCorrect ? 'font-bold text-foreground' : 'font-semibold text-[#5b6b82]')}>
          {yours || ht('results.no_answer')}
        </span>
        <span className="inline-flex max-w-[260px] items-center gap-1 truncate rounded-[8px] bg-[#E5F5EE] px-2 py-1 text-[12px] font-bold text-[#1F7A55]" title={r.isCorrect ? undefined : correctLabel(r)}>
          {r.isCorrect ? <><Check className="size-3 shrink-0" aria-hidden />{ht('x.correct_short')}</> : ht('results.correct_answer', { answer: correctLabel(r) })}
        </span>
        <span>{canOpen ? <ChevronDown className={cn('size-4 text-muted transition-transform duration-200', open && 'rotate-180')} aria-hidden /> : null}</span>
      </button>
      {open ? (
        <div className="flex flex-col gap-2 px-3 pb-3 pl-[50px]">
          {r.explanation ? (
            <p className="text-[13.5px] leading-[1.6] text-[#5b6b82]" style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>
              <b className="font-sans text-[12.5px]">{ht('results.explanation')}: </b>{math ? <MathText text={r.explanation} bold /> : <BoldText text={r.explanation} />}
            </p>
          ) : null}
          {evidence ? (
            <p className="rounded-[10px] bg-white/70 px-3 py-2 text-[13.5px] leading-[1.6] text-[#5b6b82]" style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>
              <b className="font-sans text-[12.5px]">{ht('x.evidence')}: </b>«{evidence}»
            </p>
          ) : null}
          {sprNote ? <p className="text-[13px] font-semibold text-[#5b6b82]">{ht('sat.spr_field_note')}</p> : null}
          {r.passageAnchor && onPassage ? (
            <NmButton variant="ghost" size="sm" className="self-start px-0" onClick={() => onPassage(r.passageAnchor!)}>
              <TextSearch className="size-4" aria-hidden />{ht('results.show_in_passage')}
            </NmButton>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
