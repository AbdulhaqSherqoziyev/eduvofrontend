'use client';
/**
 * Objective review (Sevara T34, design G10): number badge always grey, green
 * "Correct: X" chip, no red anywhere. Row expands to Explanation + Show in passage.
 */
import { Check, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { t, type Locale } from '@/lib/exam/i18n';
import { BoldText } from '../shell/BoldText';
import { correctLabel, rowNo } from '@/lib/exam/review-label';
import type { ReviewRow } from '@/lib/exam/types';

const fmt = (v: ReviewRow['yours']) => (Array.isArray(v) ? v.join(', ') : v ?? '');

function Row({ r, locale, onPassage }: { r: ReviewRow; locale: Locale; onPassage?: (anchor: string) => void }) {
  const [open, setOpen] = useState(false);
  const yours = fmt(r.yours);
  const sprNote = r.hint === 'DECIMAL_NOT_FULL'; // SAT SPR, contract §1b
  const canOpen = !!(r.explanation || r.passageAnchor || sprNote);
  return (
    <div style={{ borderBottom: '1px solid #F1F4F8' }}>
      <button type="button" onClick={() => canOpen && setOpen((o) => !o)} aria-expanded={canOpen ? open : undefined}
        style={{ width: '100%', minHeight: 44, display: 'grid', gridTemplateColumns: 'auto minmax(0,1fr) auto 20px', gap: 12, alignItems: 'center', padding: '8px 12px', background: 'none', border: 'none', textAlign: 'left', cursor: canOpen ? 'pointer' : 'default', color: '#1E2A3A' }}>
        <span style={{ minWidth: 26, height: 26, padding: '0 4px', borderRadius: 8, background: '#DDE3EC', color: '#5b6b82', fontSize: 12, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', whiteSpace: 'nowrap' }}>{rowNo(r)}</span>
        <span style={{ fontSize: 13.5, fontWeight: r.isCorrect ? 700 : 600, color: yours ? (r.isCorrect ? '#1E2A3A' : '#4A586C') : '#7A8699', fontStyle: yours ? 'normal' : 'italic', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {yours || t('results.no_answer', locale)}
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700, color: '#1F7A55', background: '#E5F5EE', borderRadius: 8, padding: '4px 9px', whiteSpace: 'nowrap' }}>
          {r.isCorrect ? <><Check size={12} aria-hidden />{t('x.correct_short', locale)}</> : t('results.correct_answer', locale, { answer: correctLabel(r) })}
        </span>
        <span>{canOpen && <ChevronDown size={16} color="#7A8699" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 200ms' }} aria-hidden />}</span>
      </button>
      {open && (
        <div style={{ padding: '0 12px 12px 52px', display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13, color: '#4A586C', lineHeight: 1.55 }}>
          {r.explanation && <div><b>{t('results.explanation', locale)}:</b> <BoldText text={r.explanation} /></div>}
          {sprNote && <div>{t('sat.spr_field_note', locale)}</div>}
          {r.passageAnchor && onPassage && (
            <button type="button" onClick={() => onPassage(r.passageAnchor!)} style={{ alignSelf: 'flex-start', background: 'none', border: 'none', padding: 0, color: '#2E6BE6', fontWeight: 700, fontSize: 13 }}>{t('results.show_in_passage', locale)}</button>
          )}
        </div>
      )}
    </div>
  );
}

export function ReviewList({ rows, locale, onPassage }: { rows: ReviewRow[]; locale: Locale; onPassage?: (anchor: string) => void }) {
  const [onlyWrong, setOnlyWrong] = useState(false);
  const list = onlyWrong ? rows.filter((r) => !r.isCorrect) : rows;
  const half = Math.ceil(list.length / 2);
  const seg = (on: boolean) => ({ height: 32, padding: '0 14px', borderRadius: 8, border: 'none', fontSize: 13, fontWeight: 700, background: on ? '#EAF1FE' : 'transparent', color: on ? '#1E2A3A' : '#4A586C' });
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div role="radiogroup" style={{ display: 'inline-flex', alignSelf: 'flex-start', background: '#F4F6F9', borderRadius: 10, padding: 3 }}>
        <button type="button" role="radio" aria-checked={!onlyWrong} style={seg(!onlyWrong)} onClick={() => setOnlyWrong(false)}>{t('x.filter_all', locale)} · {rows.length}</button>
        <button type="button" role="radio" aria-checked={onlyWrong} style={seg(onlyWrong)} onClick={() => setOnlyWrong(true)}>{t('x.filter_review', locale)} · {rows.filter((r) => !r.isCorrect).length}</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: '0 28px' }}>
        <div>{list.slice(0, half).map((r) => <Row key={r.questionId} r={r} locale={locale} onPassage={onPassage} />)}</div>
        <div>{list.slice(half).map((r) => <Row key={r.questionId} r={r} locale={locale} onPassage={onPassage} />)}</div>
      </div>
    </div>
  );
}
