'use client';
/** One answer: A–D rows (3/4 options) or label pills — tfng / ynng / tf3 / tf2 (design A7, cefr.md "No information"). */
import { LABEL_SETS, type ChoiceLabels, type McqSingleContent } from '@/lib/exam/content-types';
import { useExam } from '@/lib/exam/engine/context';
import type { Question } from '@/lib/exam/types';
import { Choices } from './Choices';
import { QuestionCard } from './QuestionCard';

const TYPE_LABELS: Record<string, ChoiceLabels> = { tfng: 'tfng', ynng: 'ynng', tf3: 'tf3', tf3_noinfo: 'tf3', tf2: 'tf2' };

export function McqSingle({ q }: { q: Question }) {
  const { s, setAnswer } = useExam();
  const c = q.content as McqSingleContent;
  const labels = c.labels ?? TYPE_LABELS[q.type];
  const options = labels ? LABEL_SETS[labels] : c.options ?? [];
  const v = s.answers[q.id]?.v;
  return (
    <QuestionCard id={q.id} label={String(q.no)} prompt={c.prompt ? <span>{c.prompt}</span> : null}>
      <Choices label={`Question ${q.no}`} options={options} layout={c.layout ?? (labels ? 'pills' : 'rows')}
        selected={typeof v === 'string' ? [v] : []} onPick={(k) => setAnswer([q.id], k)} />
    </QuestionCard>
  );
}
