'use client';
/**
 * Student-produced response (design q.298–300, A-table SPR row, sat.md §3.1):
 * 52px × 220px field, input filtered to what Bluebook accepts (5 characters,
 * 6 with a minus), hint, and a live KaTeX "Answer Preview" (7/2 shows as a fraction).
 * A character that cannot be entered (space, comma, %, $, letters…) is never
 * dropped silently: the change is refused and a soft note says why for ~4 s.
 * "How do I enter my answer?" toggles the inline examples panel (not a modal).
 */
import { Info } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import { useT } from '@/lib/exam/engine/context';
import type { TextKey } from '@/lib/exam/i18n';
import { applySprInput, sprLatex, type SprReject } from '@/lib/exam/sat/spr';
import { Tex } from './MathText';
import { SprExamples } from './SprExamples';

const NOTE_MS = 4000;
const REJECT_TEXT: Record<SprReject, TextKey> = {
  space: 'sat.spr_reject_space',
  comma: 'sat.spr_reject_comma',
  symbol: 'sat.spr_reject_symbol',
  other: 'sat.spr_reject_other',
};

export function SprInput({ no, value, onChange }: { no: number; value: string; onChange: (v: string | null) => void }) {
  const { t } = useT();
  const tex = sprLatex(value);
  const [reject, setReject] = useState<SprReject | null>(null);
  const [open, setOpen] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  const uid = useId();
  const panelId = `${uid}-howto`;
  const noteId = `${uid}-note`;
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const onInput = (raw: string) => {
    const r = applySprInput(value, raw);
    if (r.rejected) {
      setReject(r.rejected);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setReject(null), NOTE_MS);
      return; // field keeps its value: nothing is rewritten for the student
    }
    if (r.value !== value) onChange(r.value === '' ? null : r.value);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <input value={value} inputMode="decimal" autoComplete="off" spellCheck={false} aria-label={`Question ${no} answer`}
        aria-describedby={noteId} placeholder={t('sat.spr_placeholder')}
        onChange={(e) => onInput(e.target.value)}
        style={{ height: 52, width: 220, maxWidth: '100%', borderRadius: 10, border: '1.5px solid var(--x-line)', background: 'var(--x-field)', color: 'var(--x-ink)', padding: '0 14px', fontSize: 18, fontWeight: 700, outline: 'none', fontVariantNumeric: 'tabular-nums' }} />
      <div id={noteId} aria-live="polite">
        {reject && (
          <div className="x-fade-in" style={{ display: 'inline-flex', alignItems: 'flex-start', gap: 6, maxWidth: 520, fontSize: 12.5, fontWeight: 600, lineHeight: 1.5, color: 'var(--x-sub)', background: 'var(--x-tile)', borderRadius: 8, padding: '6px 10px' }}>
            <Info size={14} aria-hidden style={{ flexShrink: 0, marginTop: 2 }} />{t(REJECT_TEXT[reject])}
          </div>
        )}
      </div>
      <div style={{ fontSize: 12.5, color: 'var(--x-muted)', fontWeight: 600, lineHeight: 1.5, maxWidth: 520 }}>
        {t('sat.spr_hint')}{' '}
        <button type="button" aria-expanded={open} aria-controls={panelId} onClick={() => setOpen((o) => !o)}
          style={{ background: 'none', border: 'none', padding: 0, font: 'inherit', fontWeight: 700, color: 'var(--x-link)', textDecoration: 'underline', textUnderlineOffset: 2, cursor: 'pointer' }}>
          {t('sat.spr_howto')}
        </button>
      </div>
      <div aria-live="polite" style={{ minHeight: 30, display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--x-muted)', fontWeight: 600 }}>
        {tex && <>{t('sat.answer_preview')} <span style={{ color: 'var(--x-ink)', fontSize: 16 }}><Tex tex={tex} /></span></>}
      </div>
      {open && (
        <section id={panelId} aria-labelledby={`${panelId}-h`} style={{ maxWidth: 560, background: 'var(--x-panel)', border: '1px solid var(--x-line)', borderRadius: 12, padding: '14px 16px' }}>
          <SprExamples title={t('sat.spr_howto_title')} headingId={`${panelId}-h`} />
        </section>
      )}
    </div>
  );
}
