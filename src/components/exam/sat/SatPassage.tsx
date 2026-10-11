'use client';
/**
 * R&W passage pane (design q.285–287 + G4, sat.md §6.3): serif text on the left,
 * select → Highlight · Note · Clear (same menu/notes as IELTS), kept for this
 * question in this module only. Underline/italics from the bank survive;
 * tables render as text. Copy and the context menu stay blocked (integrity hook).
 */
import { StickyNote } from 'lucide-react';
import { Fragment, useMemo, useRef, useState, type CSSProperties } from 'react';
import { useExam, useT } from '@/lib/exam/engine/context';
import { addHighlight, clearRange, selectionOffsets, touches } from '@/lib/exam/highlight';
import { cutRuns, parseSatPassage, type Run } from '@/lib/exam/sat/passage';
import { HighlightMenu, type MenuPos } from '../passage/HighlightMenu';
import { NoteCard } from '../passage/NoteCard';

const style = (m: Run['marks']): CSSProperties => ({
  textDecoration: m.u ? 'underline' : undefined, fontStyle: m.em ? 'italic' : undefined, fontWeight: m.strong ? 700 : undefined,
  verticalAlign: m.sup ? 'super' : m.sub ? 'sub' : undefined, fontSize: m.sup || m.sub ? '0.75em' : undefined,
});
const RunView = ({ r }: { r: Run }) => (Object.keys(r.marks).length ? <span style={style(r.marks)}>{r.text}</span> : <>{r.text}</>);

interface Sel { pid: string; start: number; end: number; pos: MenuPos }

export function SatPassage({ html, hlKey, enabled }: { html: string; hlKey: number; enabled: boolean }) {
  const { s, dispatch } = useExam();
  const { t } = useT();
  const blocks = useMemo(() => parseSatPassage(html), [html]);
  const box = useRef<HTMLDivElement>(null);
  const [sel, setSel] = useState<Sel | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const hls = s.highlights.filter((h) => h.part === hlKey);

  const capture = () => {
    if (!enabled) return;
    const ws = window.getSelection();
    const node = ws?.anchorNode;
    const el = (node instanceof Element ? node : node?.parentElement)?.closest('[data-pid-text]') as HTMLElement | null;
    const off = el && box.current ? selectionOffsets(el) : null;
    if (!el || !off || !box.current) { setSel(null); return; }
    const rect = ws!.getRangeAt(0).getBoundingClientRect();
    const host = box.current.getBoundingClientRect();
    const below = rect.top - host.top < 52;
    setSel({ pid: el.dataset.pidText!, ...off, pos: { x: rect.left + rect.width / 2 - host.left + box.current.scrollLeft, y: (below ? rect.bottom : rect.top) - host.top + box.current.scrollTop, below } });
  };
  const done = () => { setSel(null); window.getSelection()?.removeAllRanges(); };
  const apply = (withNote: boolean) => {
    if (!sel) return;
    const r = addHighlight(s.highlights, { part: hlKey, pid: sel.pid, start: sel.start, end: sel.end });
    dispatch({ t: 'HL', highlights: r.list });
    if (withNote) setEditing(r.id);
    done();
  };
  const setNote = (id: string, note: string) => dispatch({ t: 'HL', highlights: s.highlights.map((h) => (h.id === id ? { ...h, note: note || undefined } : h)) });

  return (
    <div ref={box} onMouseUp={capture} onKeyUp={(e) => e.shiftKey && capture()} onContextMenu={(e) => { e.preventDefault(); capture(); }}
      style={{ position: 'relative', height: '100%', padding: '36px 48px', overflow: 'auto', background: 'var(--x-panel)' }}>
      <div style={{ fontFamily: 'var(--x-serif)', fontSize: 'var(--x-fs-passage)', lineHeight: 1.75, maxWidth: 640, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {blocks.map((b, bi) => {
          if (b.kind === 'table') {
            return (
              <table key={`t${bi}`} style={{ borderCollapse: 'collapse', fontFamily: 'var(--x-sans)', fontSize: 'var(--x-fs-q)', lineHeight: 1.45 }}>
                <tbody>{b.rows.map((row, ri) => (
                  <tr key={ri}>{row.cells.map((c, ci) => {
                    const Cell = row.head ? 'th' : 'td';
                    return <Cell key={ci} style={{ border: '1px solid var(--x-line)', padding: '6px 10px', textAlign: 'left', fontWeight: row.head ? 800 : 500, background: row.head ? 'var(--x-tile)' : undefined }}>{c.map((r, i) => <RunView key={i} r={r} />)}</Cell>;
                  })}</tr>
                ))}</tbody>
              </table>
            );
          }
          const mine = hls.filter((h) => h.pid === b.pid);
          const pieces = cutRuns(b.runs, mine.flatMap((h) => [h.start, h.end]));
          const ed = mine.find((h) => h.id === editing);
          return (
            <div key={b.pid}>
              <p style={{ margin: 0, cursor: 'text', whiteSpace: 'pre-wrap' }}>
                <span data-pid-text={b.pid}>
                  {pieces.map((pc, i) => {
                    const h = mine.find((x) => x.start <= pc.start && x.end >= pc.end);
                    const marker = h && pc.end === h.end && (h.note || editing === h.id);
                    return (
                      <Fragment key={i}>
                        {h ? <mark className="x-hl"><RunView r={pc.run} /></mark> : <RunView r={pc.run} />}
                        {marker && (
                          <button type="button" className="x-nosel" aria-label={`Note: ${(h.note ?? '').slice(0, 40)}`} title={h.note} onClick={() => setEditing(h.id)}
                            style={{ width: 12, height: 12, borderRadius: '50%', border: 'none', padding: 0, margin: '0 2px', verticalAlign: 'super', background: 'var(--x-flag)', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                            <StickyNote size={8} aria-hidden />
                          </button>
                        )}
                      </Fragment>
                    );
                  })}
                </span>
              </p>
              {ed && <NoteCard initial={ed.note ?? ''} onSave={(v) => setNote(ed.id, v)} onDelete={() => setNote(ed.id, '')} onClose={() => setEditing(null)} />}
            </div>
          );
        })}
      </div>
      {enabled && <div style={{ fontSize: 12, color: 'var(--x-muted)', fontWeight: 600, marginTop: 16 }}>{t('x.passage_hint')}</div>}
      {sel && (
        <HighlightMenu pos={sel.pos} canClear={touches(s.highlights, hlKey, sel.pid, sel.start, sel.end)}
          onHighlight={() => apply(false)} onNote={() => apply(true)}
          onClear={() => { dispatch({ t: 'HL', highlights: clearRange(s.highlights, hlKey, sel.pid, sel.start, sel.end) }); done(); }} onClose={() => setSel(null)} />
      )}
    </div>
  );
}
