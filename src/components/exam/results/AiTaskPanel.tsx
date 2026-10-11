'use client';
/**
 * Writing / Speaking detail on the player result page (staff preview) — the same
 * structure as the hub's `exams-hub/ai-task-panel.tsx` (_hub-design.md §4), drawn
 * flat with the player result palette. Per task: "N-topshiriq" + score/range +
 * AI chip, `results.ai_range`, criterion bars with notes, then
 * `results.strengths` / `results.next_steps` from the feedback text.
 * In-line essay marks are not in the §1.10 payload (only in GradingJob.stepData), so they are not drawn.
 */
import { Check, Hourglass, UserCheck } from 'lucide-react';
import { parseCriteria, parseFeedback } from '@/lib/exam/ai-feedback';
import { criterionLabel, criterionMax, criterionValue } from '@/lib/exam/criteria-labels';
import type { ExamFamily } from '@/lib/exam/hub-types';
import { t, type Locale } from '@/lib/exam/i18n';
import type { ResultResp } from '@/lib/exam/types';

type Ai = ResultResp['ai'][number];
const SUB = '#4A586C';
const MUTED = '#7A8699';

function range(a: Ai, one: (v: number) => string): string | null {
  if (a.scoreMin != null && a.scoreMax != null) return a.scoreMin === a.scoreMax ? one(a.scoreMin) : `${one(a.scoreMin)}–${one(a.scoreMax)}`;
  return a.score != null ? one(a.score) : null;
}

function Quote({ text, tone }: { text: string; tone: 'ok' | 'next' }) {
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', background: '#F4F6F9', borderRadius: 12, padding: '10px 14px' }}>
      {tone === 'ok' ? <Check size={16} color="#1F7A55" style={{ flexShrink: 0, marginTop: 2 }} aria-hidden /> : <span style={{ width: 6, height: 6, borderRadius: 3, background: '#2E6BE6', flexShrink: 0, marginTop: 8 }} aria-hidden />}
      <span style={{ fontSize: 13.5, lineHeight: 1.6, color: SUB, fontFamily: "'Source Serif 4', Georgia, serif" }}>{text}</span>
    </div>
  );
}

export function AiTaskPanel({ r, family, locale }: { r: ResultResp; family: ExamFamily; locale: Locale }) {
  const tasks = r.ai;
  const one = (v: number) => criterionValue(family, v);
  const top = criterionMax(family);
  if (!tasks.length) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 600, color: SUB, padding: '8px 0' }}>
        <Hourglass size={16} color="#5B3FD1" aria-hidden />{t('results.grading_writing', locale)}
      </div>
    );
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {tasks.map((a, i) => {
        const val = range(a, one);
        const crit = parseCriteria(a.criteria);
        const fb = a.status === 'READY' ? parseFeedback(a.feedback) : null;
        return (
          <div key={a.taskKey} style={{ border: '1px solid #E6EAF0', borderRadius: 16, padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 15, fontWeight: 800 }}>{t('x.task_n', locale, { n: i + 1 })}</span>
              {a.status === 'READY' && val ? <span style={{ fontSize: 28, fontWeight: 800, letterSpacing: -0.6, fontVariantNumeric: 'tabular-nums' }}>{val}</span> : null}
              <span style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: 0.4, borderRadius: 7, padding: '3px 8px', color: '#5B3FD1', background: '#EEE9FF' }}>{t('x.ai_estimate', locale)}</span>
            </div>
            {a.status === 'GRADING' ? (
              <p style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: SUB }}><Hourglass size={14} aria-hidden />{t('results.grading_writing', locale)}</p>
            ) : a.status === 'NEEDS_HUMAN' ? (
              <p style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: SUB }}><UserCheck size={14} aria-hidden />{t('results.human_review', locale)}</p>
            ) : a.scoreMin != null && a.scoreMax != null ? (
              <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: SUB }}>{t('results.ai_range', locale, { a: one(a.scoreMin), b: one(a.scoreMax) })}</p>
            ) : val == null ? (
              <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: SUB }}>{t('results.no_response', locale)}</p>
            ) : null}
            {a.status === 'READY' && crit.length ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 0.8, color: MUTED }}>{t('x.criteria', locale).toUpperCase()}</div>
                {crit.map((c) => (
                  <div key={c.name} style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) auto', columnGap: 12, rowGap: 5, alignItems: 'center' }}>
                    <span style={{ fontSize: 13, fontWeight: 700 }}>{criterionLabel(family, c.name, i)}</span>
                    <span style={{ fontSize: 13, fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>{c.min === c.max ? one(c.min) : `${one(c.min)}–${one(c.max)}`}</span>
                    <div style={{ gridColumn: '1 / -1', height: 8, borderRadius: 4, background: '#DDE3EC', overflow: 'hidden', position: 'relative' }}>
                      {c.max > c.min && <div style={{ position: 'absolute', inset: 0, width: `${Math.min(100, (c.max / top) * 100)}%`, borderRadius: 4, background: 'rgba(46,107,230,0.3)' }} />}
                      <div style={{ position: 'absolute', inset: 0, width: `${Math.min(100, (c.min / top) * 100)}%`, borderRadius: 4, background: '#2E6BE6' }} />
                    </div>
                    {c.note && <div style={{ gridColumn: '1 / -1', fontSize: 12.5, lineHeight: 1.55, color: SUB }}>{c.note}</div>}
                  </div>
                ))}
              </div>
            ) : null}
            {fb?.summary && <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.6, color: SUB, whiteSpace: 'pre-line' }}>{fb.summary}</p>}
            {fb && fb.strengths.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ fontSize: 13, fontWeight: 800 }}>{t('results.strengths', locale)}</div>
                {fb.strengths.map((s, k) => <Quote key={k} text={s} tone="ok" />)}
              </div>
            )}
            {fb && fb.nextSteps.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ fontSize: 13, fontWeight: 800 }}>{t('results.next_steps', locale)}</div>
                {fb.nextSteps.map((s, k) => <Quote key={k} text={s} tone="next" />)}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
