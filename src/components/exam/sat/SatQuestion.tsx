'use client';
/**
 * One SAT question (design q.282–311): R&W = passage left (highlights & notes) |
 * question right; Math = one column. Header: dark number badge, "Mark for
 * Review" (bookmark dot), "ABC eliminator" toggle. Prompt + options use KaTeX in every module.
 */
import type { McqSingleContent } from '@/lib/exam/content-types';
import { useExam, useT } from '@/lib/exam/engine/context';
import type { FlatQ } from '@/lib/exam/engine/selectors';
import { useSatTools } from '@/lib/exam/sat/tools';
import type { Part, Question } from '@/lib/exam/types';
import { ExamImage } from '../questions/MapLabelling';
import { SplitPane } from '../shell/SplitPane';
import { MathText } from './MathText';
import { SatOptions } from './SatOptions';
import { SatPassage } from './SatPassage';
import { SprInput } from './SprInput';

const isSpr = (q: Question) => q.type.startsWith('spr') || q.check === 'numeric_rational';

function Header({ q, n }: { q: Question; n: number }) {
  const { s, dispatch } = useExam();
  const { t } = useT();
  const tools = useSatTools();
  const flagged = !!s.flags[q.id];
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1.5px solid var(--x-line)', paddingBottom: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ width: 34, height: 34, borderRadius: 9, background: 'var(--x-dark-bg)', color: 'var(--x-dark-fg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800 }}>{n}</span>
        <button type="button" aria-pressed={flagged} onClick={() => dispatch({ t: 'FLAG', id: q.id })}
          style={{ background: 'none', border: 'none', padding: 0, fontSize: 13.5, fontWeight: 700, color: flagged ? 'var(--x-flag)' : 'var(--x-sub)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span aria-hidden style={{ width: 10, height: 10, borderRadius: '50%', border: '2px solid var(--x-flag)', background: flagged ? 'var(--x-flag)' : 'transparent' }} />
          {t('chrome.flag_sat')}
        </button>
      </div>
      {!isSpr(q) && (
        <button type="button" aria-pressed={tools.elimOn} onClick={() => tools.setElimOn(!tools.elimOn)}
          style={{ border: 'none', fontSize: 12.5, fontWeight: 800, borderRadius: 7, padding: '5px 9px', color: tools.elimOn ? '#fff' : 'var(--x-accent)', background: tools.elimOn ? 'var(--x-accent)' : 'var(--x-sel-bg)' }}>
          {t('sat.eliminator')}
        </button>
      )}
    </div>
  );
}

function QuestionBody({ q, n, figure }: { q: Question; n: number; figure: string | null }) {
  const { s, setAnswer } = useExam();
  const c = q.content as McqSingleContent;
  const v = s.answers[q.id]?.v;
  const value = typeof v === 'string' ? v : null;
  return (
    <div style={{ flex: 1, minWidth: 0, overflow: 'auto', padding: '32px 44px' }}>
      <div style={{ maxWidth: 680, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }} data-qid={q.id}>
        <Header q={q} n={n} />
        {(c.imageAssetId || figure) && <ExamImage assetId={c.imageAssetId || figure} alt={c.imageAlt} minH={120} />}
        {/* KaTeX in every module (R&W prompts may quote "$...$" too; a literal dollar is "\$" in the bank) */}
        {c.prompt && <div style={{ fontSize: 'var(--x-fs-q)', lineHeight: 1.65, whiteSpace: 'pre-line' }}><MathText text={c.prompt} /></div>}
        {isSpr(q)
          ? <SprInput no={q.no} value={value ?? ''} onChange={(nv) => setAnswer([q.id], nv)} />
          : <SatOptions qid={q.id} no={q.no} options={c.options ?? []} selected={value} onPick={(k) => setAnswer([q.id], k)} />}
      </div>
    </div>
  );
}

export function SatQuestion({ fq, n, part, highlight }: { fq: FlatQ; n: number; part: Part; highlight: boolean }) {
  const q = fq.group.questions.find((x) => x.id === fq.id);
  if (!q) return null;
  const body = <QuestionBody q={q} n={n} figure={part.imageAssetId} />;
  // contract §1b: each R&W question carries its own passage; part.passageHtml is a fallback
  const passage = (q.content as McqSingleContent).passage ?? part.passageHtml;
  if (!passage) return <div style={{ flex: 1, minHeight: 0, display: 'flex' }}>{body}</div>;
  return <SplitPane left={<SatPassage html={passage} hlKey={q.no} enabled={highlight} />} right={body} />;
}
