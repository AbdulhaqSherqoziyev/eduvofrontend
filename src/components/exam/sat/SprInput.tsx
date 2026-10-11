'use client';
/**
 * Student-produced response (design q.298–300, A-table SPR row, sat.md §3.1):
 * 52px × 220px field, input filtered to what Bluebook accepts (5 characters,
 * 6 with a minus), hint, and a live KaTeX "Answer Preview" (7/2 shows as a fraction).
 */
import { useT } from '@/lib/exam/engine/context';
import { sanitizeSpr, sprLatex } from '@/lib/exam/sat/spr';
import { Tex } from './MathText';

export function SprInput({ no, value, onChange }: { no: number; value: string; onChange: (v: string | null) => void }) {
  const { t } = useT();
  const tex = sprLatex(value);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <input value={value} inputMode="decimal" autoComplete="off" spellCheck={false} aria-label={`Question ${no} answer`}
        placeholder={t('sat.spr_placeholder')} maxLength={6}
        onChange={(e) => { const v = sanitizeSpr(e.target.value); onChange(v === '' ? null : v); }}
        style={{ height: 52, width: 220, borderRadius: 10, border: '1.5px solid var(--x-line)', background: 'var(--x-field)', color: 'var(--x-ink)', padding: '0 14px', fontSize: 18, fontWeight: 700, outline: 'none', fontVariantNumeric: 'tabular-nums' }} />
      <div style={{ fontSize: 12.5, color: 'var(--x-muted)', fontWeight: 600, lineHeight: 1.5, maxWidth: 520 }}>{t('sat.spr_hint')}</div>
      <div aria-live="polite" style={{ minHeight: 30, display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--x-muted)', fontWeight: 600 }}>
        {tex && <>{t('sat.answer_preview')} <span style={{ color: 'var(--x-ink)', fontSize: 16 }}><Tex tex={tex} /></span></>}
      </div>
    </div>
  );
}
