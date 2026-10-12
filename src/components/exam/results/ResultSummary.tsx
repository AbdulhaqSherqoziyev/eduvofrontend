'use client';
/**
 * "Xulosa" under the section cards (player results + hub result, §1.10 `summary`).
 * Per objective section: "40 tadan 6 ta to'g'ri", one row per question type
 * (neutral blue bar + n/total; 0 correct → no bar, the words "qayta ko'rib chiqing"),
 * strongest / needs-practice chips, then "Keyingi qadamlar" (`nextSteps`).
 * No red, no percentages. Transparent background — the caller supplies the card.
 */
import { ArrowRight, Check, Target } from 'lucide-react';
import { t, type Locale } from '@/lib/exam/i18n';
import type { ResultSummaryData, TypeLine } from '@/lib/exam/result-summary';

// CSS vars with light defaults — the console sets dark values on its wrapper (`--rs-*`).
const INK = 'var(--rs-ink, #1E2A3A)';
const SUB = 'var(--rs-sub, #4A586C)';
const MUTED = 'var(--rs-muted, #7A8699)';
const TRACK = 'var(--rs-track, #DDE3EC)';

function TypeRow({ l, locale }: { l: TypeLine; locale: Locale }) {
  // 0 correct: no empty bar and no "0/10" — the words "N ta savol · qayta ko'rib chiqing" instead (Sevara).
  const zero = l.correct === 0;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) auto', columnGap: 10, rowGap: 5, alignItems: 'center' }}>
      <span style={{ fontSize: 13, fontWeight: 700, color: INK, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={l.label}>{l.label}</span>
      <span style={{ fontSize: 12.5, fontWeight: 800, color: INK, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>{zero ? null : `${l.correct}/${l.total}`}</span>
      {zero ? (
        <span style={{ gridColumn: '1 / -1', fontSize: 12.5, fontWeight: 600, color: SUB }}>{t('x.type_review_again', locale, { total: l.total })}</span>
      ) : (
        <div style={{ gridColumn: '1 / -1', height: 6, borderRadius: 3, background: TRACK, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${Math.min(100, (l.correct / Math.max(1, l.total)) * 100)}%`, borderRadius: 3, background: '#2E6BE6' }} />
        </div>
      )}
    </div>
  );
}

function Pick({ icon, title, lines }: { icon: React.ReactNode; title: string; lines: TypeLine[] }) {
  if (!lines.length) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, fontSize: 12.5, fontWeight: 600, color: SUB, lineHeight: 1.45 }}>
      <span style={{ marginTop: 2, flexShrink: 0 }}>{icon}</span>
      <span><b style={{ color: INK, fontWeight: 800 }}>{title}:</b> {lines.map((l) => l.label).join(', ')}</span>
    </div>
  );
}

export function ResultSummary({ data, locale }: { data: ResultSummaryData; locale: Locale }) {
  if (!data.sections.length && !data.nextSteps.length) return null;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ fontSize: 17, fontWeight: 800, color: INK }}>{t('x.summary_title', locale)}</div>
      {data.sections.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
          {data.sections.map((s) => (
            <div key={s.key} style={{ display: 'flex', flexDirection: 'column', gap: 12, minWidth: 0 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 800, color: INK }}>{s.title}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: MUTED, marginTop: 2 }}>{t('x.n_of_total', locale, { n: s.correct, total: s.total })}</div>
              </div>
              {s.byType.length > 0 && <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>{s.byType.map((l) => <TypeRow key={l.type} l={l} locale={locale} />)}</div>}
              <Pick icon={<Check size={13} color="#1F7A55" aria-hidden />} title={t('x.strongest', locale)} lines={s.strongest} />
              <Pick icon={<Target size={13} color="#B7790F" aria-hidden />} title={t('x.weakest', locale)} lines={s.weakest} />
            </div>
          ))}
        </div>
      )}
      {data.nextSteps.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: INK }}>{t('results.next_steps', locale)}</div>
          {data.nextSteps.map((s, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', background: 'rgba(46,107,230,0.06)', borderRadius: 12, padding: '10px 14px' }}>
              <ArrowRight size={15} color="#2E6BE6" style={{ flexShrink: 0, marginTop: 3 }} aria-hidden />
              <span style={{ fontSize: 13.5, lineHeight: 1.6, color: SUB }}>{s}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
