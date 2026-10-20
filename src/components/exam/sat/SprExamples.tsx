'use client';
/**
 * "How to enter your answer" for SAT student-produced response (SPR) questions:
 * one data table (Bluebook's SPR examples + the symbols students get wrong) used
 * by the "How do I enter my answer?" panel under each SPR field and by the
 * one-time card on the break screen / Math intro (before the Math timer runs).
 * Never says whether an answer is right — only how a value is entered.
 */
import { Check, X } from 'lucide-react';
import type { ReactNode } from 'react';
import { useT } from '@/lib/exam/engine/context';
import { Tex } from './MathText';

/** Answer (TeX) | accepted entries | entries that get no credit. */
export const SPR_EXAMPLES: { tex: string; ok: string[]; bad: string[] }[] = [
  { tex: '3\\dfrac{1}{2}', ok: ['7/2', '3.5'], bad: ['3 1/2'] },
  { tex: '\\dfrac{2}{3}', ok: ['2/3', '.6666', '.6667', '0.666', '0.667'], bad: ['.66', '.67', '0.66', '.666'] },
  { tex: '-\\dfrac{1}{3}', ok: ['-1/3', '-.3333', '-0.333'], bad: ['-.33', '-0.33'] },
  { tex: '\\dfrac{3}{4}', ok: ['3/4', '.75', '0.75'], bad: [] },
  { tex: '\\dfrac{1}{2}', ok: ['1/2', '.5', '0.5'], bad: ['0,5'] },
  { tex: '50\\%', ok: ['50'], bad: ['50%'] },
  { tex: '1\\,200', ok: ['1200'], bad: ['1,200', '1 200'] },
];

const fs = (k: number) => `calc(var(--x-fs-q) * ${k})`;

function Codes({ list, tone }: { list: string[]; tone: 'ok' | 'err' }) {
  if (!list.length) return <span aria-hidden style={{ color: 'var(--x-muted)' }}>—</span>;
  return (
    <span style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
      {list.map((v) => (
        <code key={v} style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace', fontSize: fs(0.85), fontWeight: 700, whiteSpace: 'pre', padding: '1px 6px', borderRadius: 6, background: `var(--x-${tone}-bg)`, color: 'var(--x-ink)' }}>{v}</code>
      ))}
    </span>
  );
}

function Head({ icon, color, children }: { icon?: ReactNode; color?: string; children: ReactNode }) {
  return (
    <th scope="col" style={{ textAlign: 'left', padding: '6px 8px', fontSize: fs(0.78), fontWeight: 800, color: color ?? 'var(--x-sub)', borderBottom: '1.5px solid var(--x-line)', verticalAlign: 'bottom' }}>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>{icon}{children}</span>
    </th>
  );
}

/** Title + intro + examples table + the two notes. `headingId` labels the region. */
export function SprExamples({ title, headingId, action }: { title: string; headingId?: string; action?: ReactNode }) {
  const { t } = useT();
  const cell = { padding: '6px 8px', borderBottom: '1px solid var(--x-line)', verticalAlign: 'middle' } as const;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, color: 'var(--x-ink)', fontSize: fs(0.87), lineHeight: 1.5 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div id={headingId} style={{ fontSize: fs(1), fontWeight: 800 }}>{title}</div>
        {action}
      </div>
      <div style={{ color: 'var(--x-sub)' }}>{t('sat.spr_howto_intro')}</div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <Head>{t('sat.spr_col_answer')}</Head>
              <Head icon={<Check size={14} aria-hidden />} color="var(--x-ok-fg)">{t('sat.spr_col_ok')}</Head>
              <Head icon={<X size={14} aria-hidden />} color="var(--x-err-fg)">{t('sat.spr_col_bad')}</Head>
            </tr>
          </thead>
          <tbody>
            {SPR_EXAMPLES.map((r) => (
              <tr key={r.tex}>
                <td style={{ ...cell, fontSize: fs(1.05), whiteSpace: 'nowrap' }}><Tex tex={r.tex} /></td>
                <td style={cell}><Codes list={r.ok} tone="ok" /></td>
                <td style={cell}><Codes list={r.bad} tone="err" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ul style={{ margin: 0, paddingLeft: 18, listStyle: 'disc', color: 'var(--x-sub)', display: 'flex', flexDirection: 'column', gap: 4 }}>
        <li style={{ display: 'list-item' }}>{t('sat.spr_field_note')}</li>
        <li style={{ display: 'list-item' }}>{t('sat.spr_note_one')}</li>
      </ul>
    </div>
  );
}
