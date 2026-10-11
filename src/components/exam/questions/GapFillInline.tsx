'use client';
/**
 * Gap fill (ielts.md §3 #8–13, cefr.md #2/#6/#11). Two shapes:
 *  - per-question card: `pre [input] post` (sentence) or prompt line + input (short_answer) — design A7 gap;
 *  - group template with `{{n}}` gaps: form / note / summary lines, table (`|` cells), flow-chart boxes.
 * Inputs: 170px, spellcheck/autocomplete off; the word limit is a tooltip, never a block.
 */
import { Fragment } from 'react';
import type { GapContent } from '@/lib/exam/content-types';
import { useExam, useT } from '@/lib/exam/engine/context';
import { answered } from '@/lib/exam/engine/selectors';
import type { Group, Question } from '@/lib/exam/types';
import { NumBadge, QuestionCard } from './QuestionCard';

function GapInput({ q, inline }: { q: Question; inline?: boolean }) {
  const { s, dispatch, setAnswer } = useExam();
  const { t } = useT();
  const c = q.content as GapContent;
  const v = s.answers[q.id]?.v;
  const cur = s.currentQ === q.id;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, verticalAlign: 'middle', margin: inline ? '2px 0' : 0 }}>
      {inline && <NumBadge label={String(q.no)} done={answered(s.answers, q.id)} />}
      <input value={typeof v === 'string' ? v : ''} onChange={(e) => setAnswer([q.id], e.target.value)} onFocus={() => !cur && dispatch({ t: 'GOTO', partIdx: s.partIdx, q: q.id })}
        aria-label={`Question ${q.no}`} title={c.wordLimit ? t('x.word_limit', { n: c.wordLimit }) : undefined} data-qid={q.id}
        spellCheck={false} autoComplete="off" autoCorrect="off" autoCapitalize="off" maxLength={80}
        style={{ height: 34, width: 170, borderRadius: 8, border: `1.5px solid ${cur && inline ? 'var(--x-accent)' : 'var(--x-line)'}`, background: 'var(--x-field)', color: 'var(--x-ink)', padding: '0 10px', fontSize: 15, fontWeight: 700 }} />
    </span>
  );
}

export function GapCard({ q }: { q: Question }) {
  const c = q.content as GapContent;
  if (c.prompt) {
    return <QuestionCard id={q.id} label={String(q.no)} prompt={<span>{c.prompt}</span>}><GapInput q={q} /></QuestionCard>;
  }
  return (
    <QuestionCard id={q.id} label={String(q.no)} prompt={<>{c.pre && <span>{c.pre}</span>}<GapInput q={q} />{c.post && <span>{c.post}</span>}</>} />
  );
}

function Line({ text, byNo }: { text: string; byNo: Map<number, Question> }) {
  const bits = text.split(/(\{\{\d+\}\})/g);
  return (
    <>
      {bits.map((b, i) => {
        const m = b.match(/^\{\{(\d+)\}\}$/);
        const q = m ? byNo.get(Number(m[1])) : null;
        return <Fragment key={i}>{q ? <GapInput q={q} inline /> : b}</Fragment>;
      })}
    </>
  );
}

export function GapTemplate({ g }: { g: Group }) {
  const byNo = new Map(g.questions.map((q) => [q.no, q]));
  const lines = (g.content?.template ?? '').split('\n');
  const layout = g.layout ?? 'note';
  const box = { background: 'var(--x-panel)', borderRadius: 14, padding: '18px 20px', fontSize: 'var(--x-fs-q)', lineHeight: 2.1 } as const;

  if (layout === 'table') {
    const rows = lines.map((l) => l.split('|').map((c) => c.trim()));
    return (
      <div style={{ ...box, padding: 0, overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            {rows.map((r, ri) => (
              <tr key={ri}>
                {r.map((c, ci) => {
                  const Cell = ri === 0 ? 'th' : 'td';
                  return <Cell key={ci} style={{ border: '1px solid var(--x-line)', padding: '8px 12px', textAlign: 'left', fontWeight: ri === 0 ? 800 : 500, background: ri === 0 ? 'var(--x-tile)' : 'transparent', lineHeight: 1.8 }}><Line text={c} byNo={byNo} /></Cell>;
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
  if (layout === 'flowchart') {
    return (
      <div style={{ ...box, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
        {lines.map((l, i) => (
          <Fragment key={i}>
            {i > 0 && <span aria-hidden style={{ color: 'var(--x-muted)', lineHeight: 1 }}>↓</span>}
            <div style={{ border: '1.5px solid var(--x-line)', borderRadius: 10, padding: '6px 14px', textAlign: 'center', maxWidth: 560 }}><Line text={l} byNo={byNo} /></div>
          </Fragment>
        ))}
      </div>
    );
  }
  return (
    <div style={box}>
      {g.content?.heading && <div style={{ fontSize: 16, fontWeight: 800, textAlign: 'center', paddingBottom: 6, lineHeight: 1.4 }}>{g.content.heading}</div>}
      {layout === 'summary'
        ? <p style={{ margin: 0 }}><Line text={lines.join(' ')} byNo={byNo} /></p>
        : lines.map((l, i) => <div key={i} style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 6 }}>{layout === 'note' && <span aria-hidden>•</span>}<Line text={l} byNo={byNo} /></div>)}
    </div>
  );
}
