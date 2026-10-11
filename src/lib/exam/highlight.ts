/**
 * Highlight/notes model (design G4): Selection → Range → character offsets in
 * one paragraph's text. v1: one paragraph per highlight; overlapping ones merge.
 */
import type { Highlight } from './engine/state';

/** Offsets of the current selection inside `textEl` (clamped to it), or null. */
export function selectionOffsets(textEl: HTMLElement): { start: number; end: number } | null {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return null;
  const r = sel.getRangeAt(0);
  const full = textEl.textContent?.length ?? 0;
  const pos = (node: Node, off: number) => {
    if (!textEl.contains(node)) return textEl.compareDocumentPosition(node) & Node.DOCUMENT_POSITION_PRECEDING ? 0 : full;
    const pre = document.createRange();
    pre.setStart(textEl, 0);
    pre.setEnd(node, off);
    return pre.toString().length;
  };
  const a = pos(r.startContainer, r.startOffset);
  const b = pos(r.endContainer, r.endOffset);
  const start = Math.max(0, Math.min(a, b));
  const end = Math.min(full, Math.max(a, b));
  return end > start ? { start, end } : null;
}

export function addHighlight(list: Highlight[], h: Omit<Highlight, 'id'>): { list: Highlight[]; id: string } {
  const same = list.filter((x) => x.part === h.part && x.pid === h.pid);
  const overlapping = same.filter((x) => x.start < h.end && x.end > h.start);
  const start = Math.min(h.start, ...overlapping.map((x) => x.start));
  const end = Math.max(h.end, ...overlapping.map((x) => x.end));
  const note = [h.note, ...overlapping.map((x) => x.note)].filter(Boolean).join('\n') || undefined;
  const id = `h${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
  return { list: [...list.filter((x) => !overlapping.includes(x)), { ...h, id, start, end, note }], id };
}

export function clearRange(list: Highlight[], part: number, pid: string, start: number, end: number): Highlight[] {
  return list.filter((x) => !(x.part === part && x.pid === pid && x.start < end && x.end > start));
}

export function touches(list: Highlight[], part: number, pid: string, start: number, end: number): boolean {
  return list.some((x) => x.part === part && x.pid === pid && x.start < end && x.end > start);
}

export interface Segment { text: string; hl: Highlight | null; noteAfter: Highlight | null }

/** Split paragraph text into plain / highlighted runs; a note marker follows its highlight. */
export function segments(text: string, hls: Highlight[]): Segment[] {
  const sorted = [...hls].sort((a, b) => a.start - b.start);
  const out: Segment[] = [];
  let i = 0;
  for (const h of sorted) {
    const s = Math.max(h.start, i);
    if (s >= h.end) continue;
    if (s > i) out.push({ text: text.slice(i, s), hl: null, noteAfter: null });
    out.push({ text: text.slice(s, h.end), hl: h, noteAfter: h.note ? h : null });
    i = h.end;
  }
  if (i < text.length) out.push({ text: text.slice(i), hl: null, noteAfter: null });
  return out;
}
