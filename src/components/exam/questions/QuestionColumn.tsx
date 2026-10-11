'use client';
/** Right-hand question column (design A5/A7): "Part · Questions x–y", instructions, groups → components. */
import { useEffect } from 'react';
import { useExam, useT } from '@/lib/exam/engine/context';
import { partNos } from '@/lib/exam/engine/selectors';
import { numRange } from '@/lib/exam/format';
import type { Group, Part } from '@/lib/exam/types';
import { GapCard, GapTemplate } from './GapFillInline';
import { MapLabelling } from './MapLabelling';
import { MatchingSelect, OptionBank } from './MatchingSelect';
import { McqMulti } from './McqMulti';
import { McqSingle } from './McqSingle';

const MATCHING = new Set(['matching', 'matching_headings', 'matching_info', 'matching_features', 'matching_endings', 'summary_bank', 'matching_dropdown']);

function GroupView({ g }: { g: Group }) {
  const type = g.questions[0]?.type ?? '';
  const instr = g.instructions && <div style={{ fontSize: 'var(--x-fs-q)', color: 'var(--x-sub)', lineHeight: 1.55 }}>{g.instructions}</div>;
  let body: React.ReactNode;
  if (g.multiGroup || type === 'mcq_multi') body = <McqMulti g={g} />;
  else if (type === 'map_labelling' || g.layout === 'map') body = <MapLabelling g={g} />;
  else if (g.content?.template) body = <GapTemplate g={g} />;
  else if (MATCHING.has(type)) {
    const cards = g.questions.map((q) => <MatchingSelect key={q.id} q={q} g={g} />);
    body = g.content?.bankPosition === 'side'
      ? <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(200px,260px)', gap: 12, alignItems: 'start' }}><div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>{cards}</div><div style={{ position: 'sticky', top: 0 }}><OptionBank g={g} /></div></div>
      : <><OptionBank g={g} />{cards}</>;
  } else {
    body = g.questions.map((q) => (q.type === 'gap_fill' || q.type === 'short_answer' ? <GapCard key={q.id} q={q} /> : <McqSingle key={q.id} q={q} />));
  }
  return <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>{instr}{body}</div>;
}

export function QuestionColumn({ part, label, wide }: { part: Part; label: string; wide: boolean }) {
  const { s } = useExam();
  const { t } = useT();
  // keep the current question in view (navigator jumps, finish-modal chips)
  useEffect(() => {
    if (!s.currentQ) return;
    const el = document.querySelector(`[data-qid="${CSS.escape(s.currentQ)}"]`);
    el?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [s.currentQ, s.partIdx]);
  return (
    <div style={{ flex: 1, minWidth: 0, overflow: 'auto', padding: '28px 36px' }}>
      <div style={{ maxWidth: wide ? 860 : 760, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: 1, color: 'var(--x-muted)' }}>{label} · {t('x.questions_range', { r: numRange(partNos(part)) }).toUpperCase()}</div>
          {part.instructions && !/^Questions\s/i.test(part.instructions) && <div style={{ fontSize: 'var(--x-fs-q)', color: 'var(--x-sub)', lineHeight: 1.55, marginTop: 6 }}>{part.instructions}</div>}
        </div>
        {part.groups.map((g) => <GroupView key={g.id} g={g} />)}
      </div>
    </div>
  );
}
