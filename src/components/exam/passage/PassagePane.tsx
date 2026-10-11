'use client';
/**
 * Reading passage (design A5/A6/G4): serif, select text → Highlight · Note · Clear.
 * Text is rendered from parsed paragraphs only (no injected HTML). Copy and the
 * browser context menu are blocked by the integrity hook; ours replaces it.
 */
import { StickyNote } from 'lucide-react';
import { Fragment, useMemo, useRef, useState } from 'react';
import { useExam, useT } from '@/lib/exam/engine/context';
import { paraLabel, parsePassage } from '@/lib/exam/engine/selectors';
import { addHighlight, clearRange, segments, selectionOffsets, touches } from '@/lib/exam/highlight';
import type { Part } from '@/lib/exam/types';
import { HighlightMenu, type MenuPos } from './HighlightMenu';
import { NoteCard } from './NoteCard';

interface Sel { pid: string; start: number; end: number; pos: MenuPos }

export function PassagePane({ part, label, enabled = true }: { part: Part; label: string; enabled?: boolean }) {
  const { s, dispatch } = useExam();
  const { t } = useT();
  const paras = useMemo(() => parsePassage(part.passageHtml), [part.passageHtml]);
  const box = useRef<HTMLDivElement>(null);
  const [sel, setSel] = useState<Sel | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const hls = s.highlights.filter((h) => h.part === part.part);

  const capture = () => {
    if (!enabled) return;
    const ws = window.getSelection();
    const node = ws?.anchorNode;
    const el = (node instanceof Element ? node : node?.parentElement)?.closest('[data-pid-text]') as HTMLElement | null;
    if (!el || !box.current) { setSel(null); return; }
    const off = selectionOffsets(el);
    if (!off) { setSel(null); return; }
    const rect = ws!.getRangeAt(0).getBoundingClientRect();
    const host = box.current.getBoundingClientRect();
    const below = rect.top - host.top < 52;
    setSel({ pid: el.dataset.pidText!, ...off, pos: { x: rect.left + rect.width / 2 - host.left + box.current.scrollLeft, y: (below ? rect.bottom : rect.top) - host.top + box.current.scrollTop, below } });
  };
  const done = () => { setSel(null); window.getSelection()?.removeAllRanges(); };
  const apply = (withNote: boolean) => {
    if (!sel) return;
    const r = addHighlight(s.highlights, { part: part.part, pid: sel.pid, start: sel.start, end: sel.end });
    dispatch({ t: 'HL', highlights: r.list });
    if (withNote) setEditing(r.id);
    done();
  };
  const setNote = (id: string, note: string) => dispatch({ t: 'HL', highlights: s.highlights.map((h) => (h.id === id ? { ...h, note: note || undefined } : h)) });

  return (
    <div ref={box} onMouseUp={capture} onKeyUp={(e) => e.shiftKey && capture()} onContextMenu={(e) => { e.preventDefault(); capture(); }}
      style={{ position: 'relative', height: '100%', padding: '32px 44px', overflow: 'auto', background: 'var(--x-panel)' }}>
      <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: 1, color: 'var(--x-muted)', marginBottom: 12 }}>{label}</div>
      {part.title && <div style={{ fontFamily: 'var(--x-serif)', fontSize: 25, fontWeight: 600, lineHeight: 1.25, marginBottom: 16 }}>{part.title}</div>}
      <div style={{ fontFamily: 'var(--x-serif)', fontSize: 'var(--x-fs-passage)', lineHeight: 1.75, maxWidth: 640, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {paras.map((p) => {
          const ed = hls.find((h) => h.pid === p.pid && h.id === editing);
          return (
          <div key={p.pid}>
          <p style={{ margin: 0, cursor: 'text' }}>
            {paraLabel(p.pid) && <b className="x-nosel" style={{ marginRight: 6 }}>{paraLabel(p.pid)}</b>}
            <span data-pid-text={p.pid}>
              {segments(p.text, hls.filter((h) => h.pid === p.pid)).map((sg, i) => (
                <Fragment key={i}>
                  {sg.hl ? <mark className="x-hl">{sg.text}</mark> : sg.text}
                  {sg.hl && (sg.noteAfter || editing === sg.hl.id) && (
                    <button type="button" className="x-nosel" aria-label={`Note: ${(sg.hl.note ?? '').slice(0, 40)}`} title={sg.hl.note} onClick={() => setEditing(sg.hl!.id)}
                      style={{ width: 12, height: 12, borderRadius: '50%', border: 'none', padding: 0, margin: '0 2px', verticalAlign: 'super', background: 'var(--x-flag)', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                      <StickyNote size={8} aria-hidden />
                    </button>
                  )}
                </Fragment>
              ))}
            </span>
          </p>
          {ed && <NoteCard initial={ed.note ?? ''} onSave={(v) => setNote(ed.id, v)} onDelete={() => setNote(ed.id, '')} onClose={() => setEditing(null)} />}
          </div>
          );
        })}
      </div>
      <div style={{ fontSize: 12, color: 'var(--x-muted)', fontWeight: 600, marginTop: 16 }}>{t('x.passage_hint')}</div>
      {sel && (
        <HighlightMenu pos={sel.pos} canClear={touches(s.highlights, part.part, sel.pid, sel.start, sel.end)}
          onHighlight={() => apply(false)} onNote={() => apply(true)}
          onClear={() => { dispatch({ t: 'HL', highlights: clearRange(s.highlights, part.part, sel.pid, sel.start, sel.end) }); done(); }} onClose={() => setSel(null)} />
      )}
    </div>
  );
}
