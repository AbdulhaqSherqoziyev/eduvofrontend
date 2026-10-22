'use client';
/**
 * §9.3 heatmap (Stats "Kogorta" cell look): weekday × hour sums. Desktop 7 rows × 24 columns, phone
 * transposed (24 × 7). Every cell prints its value (colour never carries meaning alone). One Tab stop,
 * arrow keys move between cells (roving tabindex); hover/focus shows a small card. Clicking does nothing.
 */
import { useRef, useState } from 'react';
import { cnt, cntNum, groupNum, hourRange, WEEKDAY_LONG, WEEKDAY_SHORT } from '@/lib/admin-mock/format';
import type { Cnt } from '@/lib/admin-mock/types';
import { T } from './texts';

const mix = (p: number) => `color-mix(in oklab, var(--blue) ${p}%, var(--paper))`;
const pad = (n: number) => String(n).padStart(2, '0');

/** §9.3 colour levels (max = the largest unmasked cell) */
export function level(v: Cnt, max: number): 0 | 1 | 2 | 3 | 4 {
  if (v === 0) return 0;
  if (v === '<5') return 1;
  const r = max ? v / max : 0;
  return r <= 0.25 ? 1 : r <= 0.5 ? 2 : r <= 0.75 ? 3 : 4;
}
const LEVEL = [
  { bg: 'var(--paper)', fg: 'var(--mut)', w: 600 },
  { bg: mix(18), fg: 'var(--ink)', w: 800 },
  { bg: mix(40), fg: 'var(--ink)', w: 800 },
  { bg: mix(68), fg: '#fff', w: 800 },
  { bg: 'var(--blue)', fg: '#fff', w: 800 },
] as const;

export function Heatmap({ cells, unit, periodLabel, mob, title }: { cells: Cnt[][]; unit: string; periodLabel: string; mob: boolean; title: string }) {
  const max = Math.max(0, ...cells.flat().map((v) => cntNum(v) ?? 0));
  const [focus, setFocus] = useState({ d: 0, h: 0 });
  const [tip, setTip] = useState<{ d: number; h: number; x: number; y: number } | null>(null);
  const box = useRef<HTMLDivElement>(null);
  const label = (d: number, h: number) => T.hours.cellAria(WEEKDAY_LONG[d], hourRange(h), cnt(cells[d]?.[h] ?? 0), unit, periodLabel);
  const show = (d: number, h: number, el: HTMLElement) => {
    const b = box.current?.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    if (b) setTip({ d, h, x: r.left - b.left + r.width / 2, y: r.top - b.top });
  };
  const move = (e: React.KeyboardEvent, d: number, h: number) => {
    // phone grid is transposed: rows are hours, columns are weekdays
    const keys: Record<string, [number, number]> = mob
      ? { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] }
      : { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] };
    let next: [number, number] | null = null;
    if (keys[e.key]) next = [Math.min(6, Math.max(0, d + keys[e.key][0])), Math.min(23, Math.max(0, h + keys[e.key][1]))];
    if (e.key === 'Home') next = mob ? [0, h] : [d, 0];
    if (e.key === 'End') next = mob ? [6, h] : [d, 23];
    if (!next) return;
    e.preventDefault();
    setFocus({ d: next[0], h: next[1] });
    const el = box.current?.querySelector<HTMLElement>(`[data-cell="${next[0]}-${next[1]}"]`);
    el?.focus();
  };
  const cell = (d: number, h: number) => {
    const v = cells[d]?.[h] ?? 0;
    const lv = LEVEL[level(v, max)];
    return (
      <span key={`${d}-${h}`} data-cell={`${d}-${h}`} className="ma-an-cell" tabIndex={focus.d === d && focus.h === h ? 0 : -1} aria-label={label(d, h)}
        onKeyDown={(e) => move(e, d, h)}
        onFocus={(e) => { setFocus({ d, h }); show(d, h, e.currentTarget); }} onBlur={() => setTip(null)}
        onMouseEnter={(e) => show(d, h, e.currentTarget)} onMouseLeave={() => setTip(null)}
        style={{ height: mob ? 26 : 30, borderRadius: 8, background: lv.bg, color: lv.fg, fontWeight: lv.w, fontSize: mob ? 10.5 : 11, display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 0, overflow: 'hidden' }}>
        {v === '<5' ? '<5' : groupNum(v)}
      </span>
    );
  };
  const head = { fontSize: 11, fontWeight: 700, color: 'var(--mut)', textAlign: 'center' } as const;
  const rowHead = { fontSize: 11, fontWeight: 700, color: 'var(--ink2)', display: 'flex', alignItems: 'center' } as const;
  return (
    <div ref={box} style={{ position: 'relative' }} role="group" aria-label={title}>
      {mob ? (
        <div style={{ display: 'grid', gridTemplateColumns: '40px repeat(7,minmax(0,1fr))', gap: 4 }}>
          <span />
          {WEEKDAY_SHORT.map((w) => <span key={w} style={head}>{w}</span>)}
          {Array.from({ length: 24 }, (_, h) => [<span key={`h${h}`} style={rowHead}>{pad(h)}</span>, ...Array.from({ length: 7 }, (_, d) => cell(d, h))])}
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '40px repeat(24,minmax(28px,1fr))', gap: 4, fontSize: 11, minWidth: 40 + 24 * 32 }}>
            <span />
            {Array.from({ length: 24 }, (_, h) => <span key={h} style={head}>{pad(h)}</span>)}
            {WEEKDAY_SHORT.map((w, d) => [<span key={w} style={rowHead}>{w}</span>, ...Array.from({ length: 24 }, (_, h) => cell(d, h))])}
          </div>
        </div>
      )}
      {tip && (
        <span className="ma-filter-menu" aria-hidden="true"
          style={{ top: Math.max(0, tip.y - 44), left: `clamp(0px, ${tip.x - 120}px, calc(100% - 240px))`, minWidth: 0, width: 240, fontSize: 12, fontWeight: 700, color: 'var(--ink2)', padding: '8px 10px', pointerEvents: 'none' }}>
          {label(tip.d, tip.h)}
        </span>
      )}
    </div>
  );
}

export function HeatLegend({ periodLabel }: { periodLabel: string }) {
  const sw = (bg: string, fg: string, text?: string) => (
    <span style={{ width: 14, height: 14, borderRadius: 4, background: bg, color: fg, fontSize: 7, fontWeight: 800, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>{text}</span>
  );
  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap', fontSize: 12, fontWeight: 700, color: 'var(--ink2)' }}>
      <span>{T.hours.low}</span>
      {sw(LEVEL[0].bg, LEVEL[0].fg, '0')}
      {sw(LEVEL[1].bg, LEVEL[1].fg, '<5')}
      {sw(LEVEL[2].bg, LEVEL[2].fg)}
      {sw(LEVEL[3].bg, LEVEL[3].fg)}
      {sw(LEVEL[4].bg, LEVEL[4].fg)}
      <span>{T.hours.high}</span>
      <span style={{ color: 'var(--mut)', fontWeight: 600 }}>· {T.hours.sumNote(periodLabel)}</span>
    </div>
  );
}
