'use client';
/**
 * "Choose TWO/THREE" (ielts.md §3 A1): one widget for a multiGroup; the same
 * key array is written to every row of the group; max_select = number of rows.
 */
import { useExam, useT } from '@/lib/exam/engine/context';
import { numRange } from '@/lib/exam/format';
import type { Group } from '@/lib/exam/types';
import { Choices } from './Choices';
import { QuestionCard } from './QuestionCard';

export function McqMulti({ g }: { g: Group }) {
  const { s, setAnswer } = useExam();
  const { t } = useT();
  const ids = g.questions.map((q) => q.id);
  const max = g.content?.maxSelect ?? ids.length;
  const v = s.answers[ids[0]]?.v;
  const sel = Array.isArray(v) ? v : [];
  const pick = (k: string) => {
    const next = sel.includes(k) ? sel.filter((x) => x !== k) : sel.length < max ? [...sel, k] : sel;
    if (next !== sel) setAnswer(ids, next.length ? next : null);
  };
  const prompt = g.content?.prompt ?? (g.questions[0].content as { prompt?: string }).prompt;
  return (
    <QuestionCard id={ids[0]} rowIds={ids} label={numRange(g.questions.map((q) => q.no))} prompt={prompt ? <span>{prompt}</span> : null}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--x-muted)' }}>{t('x.choose_n', { n: max })}</div>
        <Choices multi label={`Questions ${numRange(g.questions.map((q) => q.no))}`} options={g.content?.options ?? []} selected={sel} onPick={pick} atMax={sel.length >= max} />
      </div>
    </QuestionCard>
  );
}
