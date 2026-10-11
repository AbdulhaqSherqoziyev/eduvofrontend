'use client';
/**
 * Matching (information / features / endings / headings / summary bank), v1 = native
 * dropdown "Choose…" (design A7 select). Bank is a side panel (headings) or a box on top;
 * with uniqueOptions an option used by another question is disabled.
 */
import { useExam, useT } from '@/lib/exam/engine/context';
import type { Group, Question } from '@/lib/exam/types';
import { QuestionCard } from './QuestionCard';

export function OptionBank({ g }: { g: Group }) {
  const opts = g.content?.options ?? g.content?.bank ?? [];
  if (!opts.length) return null;
  return (
    <div style={{ background: 'var(--x-panel)', border: '1px solid var(--x-line)', borderRadius: 14, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 6 }}>
      {g.content?.bankTitle && <div style={{ fontSize: 13, fontWeight: 800 }}>{g.content.bankTitle}</div>}
      {opts.map((o) => (
        <div key={o.key} style={{ display: 'flex', gap: 10, fontSize: 'var(--x-fs-q)', lineHeight: 1.5 }}>
          <b style={{ minWidth: 28 }}>{o.key}</b><span>{o.text}</span>
        </div>
      ))}
    </div>
  );
}

export function MatchingSelect({ q, g }: { q: Question; g: Group }) {
  const { s, setAnswer } = useExam();
  const { t } = useT();
  const opts = g.content?.options ?? g.content?.bank ?? [];
  const v = s.answers[q.id]?.v;
  const used = new Set(g.content?.uniqueOptions ? g.questions.filter((x) => x.id !== q.id).map((x) => s.answers[x.id]?.v).filter((x): x is string => typeof x === 'string') : []);
  const prompt = (q.content as { prompt?: string }).prompt;
  return (
    <QuestionCard id={q.id} label={String(q.no)} prompt={prompt ? <span>{prompt}</span> : null}>
      <select aria-label={`Question ${q.no}`} value={typeof v === 'string' ? v : ''} onChange={(e) => setAnswer([q.id], e.target.value || null)}
        style={{ height: 38, minWidth: 280, maxWidth: '100%', borderRadius: 9, border: '1.5px solid var(--x-line)', background: 'var(--x-field)', color: 'var(--x-ink)', padding: '0 10px', fontSize: 14, fontWeight: 600 }}>
        <option value="">{t('x.choose')}</option>
        {opts.map((o) => (
          <option key={o.key} value={o.key} disabled={used.has(o.key)}>{o.text !== o.key ? `${o.key}  ${o.text}` : o.key}</option>
        ))}
      </select>
    </QuestionCard>
  );
}
