'use client';
/**
 * Dark result card body (player + hub): "UMUMIY BAND" / "JAMI BALL" (SAT 400–1600),
 * a 60/800 number, then which sections it is based on. While `pending` the number
 * waits: "Writing baholangach hisoblanadi". No "estimated" wording (Abdulhaq 10-12).
 * `overallView(r)` null → the old note (`hub.no_overall_v1`); a single-section attempt has no overall, so only the title.
 */
import { t, type Locale } from '@/lib/exam/i18n';
import { overallView } from '@/lib/exam/result-summary';
import type { ResultResp } from '@/lib/exam/types';

export function OverallBlock({ r, locale, fallbackTitle }: { r: ResultResp; locale: Locale; fallbackTitle: string }) {
  const o = overallView(r);
  const note = { fontSize: 13, color: '#AEB9CB', fontWeight: 600, lineHeight: 1.5 } as const;
  if (!o) {
    return (
      <div>
        <div style={{ fontSize: 15, fontWeight: 700 }}>{fallbackTitle}</div>
        {r.mode === 'section' ? null : <div style={{ ...note, marginTop: 4 }}>{t('hub.no_overall_v1', locale)}</div>}
      </div>
    );
  }
  const list = (xs: string[]) => xs.join(', ');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: 1, color: '#9DB8F5' }}>{t(o.kind === 'total' ? 'x.overall_total' : 'x.overall_band', locale)}</div>
      {o.label ? (
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 60, fontWeight: 800, letterSpacing: -2, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{o.label}</span>
          {o.level ? <span style={{ marginBottom: 6, borderRadius: 7, background: 'rgba(255,255,255,0.14)', padding: '3px 8px', fontSize: 12, fontWeight: 800 }}>{o.level}</span> : null}
        </div>
      ) : (
        <div style={{ fontSize: 60, fontWeight: 800, letterSpacing: -2, lineHeight: 1, color: '#5E6E86' }} aria-hidden>…</div>
      )}
      {o.pending.length ? (
        <div style={note} role="status">{t('x.overall_pending', locale, { list: list(o.pending) })}</div>
      ) : o.basis.length ? (
        <div style={note}>{t('x.overall_basis', locale, { list: list(o.basis) })}</div>
      ) : null}
    </div>
  );
}
