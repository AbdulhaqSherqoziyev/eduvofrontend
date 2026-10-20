'use client';
/**
 * Section intro / Directions text from the exam config (`sections[].intro`):
 * a small HTML subset (<p>, <ul>/<ol>, <strong>, <em>, <u>, <br>, <table>; a <br> inside a cell is a line break)
 * parsed into React nodes — nothing from the config is injected as HTML.
 */
import { useMemo, type CSSProperties } from 'react';
import { parseRichHtml, type Run } from '@/lib/exam/sat/passage';

const style = (m: Run['marks']): CSSProperties => ({
  textDecoration: m.u ? 'underline' : undefined, fontStyle: m.em ? 'italic' : undefined, fontWeight: m.strong ? 700 : undefined,
  verticalAlign: m.sup ? 'super' : m.sub ? 'sub' : undefined, fontSize: m.sup || m.sub ? '0.75em' : undefined,
});
const Runs = ({ runs }: { runs: Run[] }) => <>{runs.map((r, i) => (Object.keys(r.marks).length ? <span key={i} style={style(r.marks)}>{r.text}</span> : <span key={i}>{r.text}</span>))}</>;

export function RichText({ html, style: st }: { html: string | null | undefined; style?: CSSProperties }) {
  const blocks = useMemo(() => parseRichHtml(html), [html]);
  if (!blocks.length) return null;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, ...st }}>
      {blocks.map((b, i) => {
        if (b.kind === 'list') {
          const L = b.ordered ? 'ol' : 'ul';
          return <L key={i} style={{ margin: 0, paddingLeft: 22, listStyle: b.ordered ? 'decimal' : 'disc', display: 'flex', flexDirection: 'column', gap: 4 }}>{b.items.map((it, j) => <li key={j} style={{ display: 'list-item' }}><Runs runs={it} /></li>)}</L>;
        }
        if (b.kind === 'table') {
          return (
            <table key={i} style={{ borderCollapse: 'collapse' }}>
              <tbody>{b.rows.map((row, ri) => (
                <tr key={ri}>{row.cells.map((c, ci) => { const Cell = row.head ? 'th' : 'td'; return <Cell key={ci} style={{ border: '1px solid var(--x-line)', padding: '4px 8px', textAlign: 'left', verticalAlign: 'top', whiteSpace: 'pre-line' }}><Runs runs={c} /></Cell>; })}</tr>
              ))}</tbody>
            </table>
          );
        }
        return <p key={b.pid} style={{ margin: 0, whiteSpace: 'pre-wrap' }}><Runs runs={b.runs} /></p>;
      })}
    </div>
  );
}
