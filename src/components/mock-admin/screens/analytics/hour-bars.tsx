'use client';
/**
 * §9.4 one day by hour (Stats histogram look): 24 columns, the tallest in `--blue`, others 55% mix;
 * "<5" → fixed 6px muted stub; 0 → no column. Today: the current hour is hatched ("(hozirgacha)"),
 * later hours stay empty with a note. No Y axis — "maks N" in the corner.
 */
import { useState } from 'react';
import { cnt, cntNum, groupNum, hourRange } from '@/lib/admin-mock/format';
import type { Cnt } from '@/lib/admin-mock/types';
import { mutedText } from './blocks';
import { T } from './texts';

const pad = (n: number) => String(n).padStart(2, '0');

export function HourBars({ bars, unit, isToday, currentHour, mob }: { bars: Array<Cnt | null>; unit: string; isToday: boolean; currentHour: number | null; mob: boolean }) {
  const [tip, setTip] = useState<number | null>(null);
  const max = Math.max(0, ...bars.map((v) => cntNum(v) ?? 0));
  const cur = isToday ? currentHour : null;
  const tipText = (h: number) => `${hourRange(h)} · ${cnt(bars[h] ?? 0)} ${unit}${h === cur ? ` ${T.hours.soFar}` : ''}`;
  const step = mob ? 6 : 3;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <span style={mutedText}>{T.hours.max(groupNum(max))}</span>
      <div style={{ position: 'relative' }} onMouseLeave={() => setTip(null)}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: mob ? 3 : 6, height: 180, borderBottom: '1px solid var(--line)' }}>
          {Array.from({ length: 24 }, (_, h) => {
            const v = bars[h] ?? 0;
            // null = a future hour today (or before tracking): no column, no tooltip
            const future = (cur !== null && h > cur) || bars[h] === null;
            const n = cntNum(v);
            const height = future ? 0 : v === '<5' ? 6 : n && max ? `${(n / max) * 100}%` : 0;
            const bg = v === '<5' ? 'var(--mut)' : h === cur ? 'repeating-linear-gradient(135deg, var(--blue) 0 4px, transparent 4px 8px)'
              : n === max && max > 0 ? 'var(--blue)' : 'color-mix(in oklab, var(--blue) 55%, var(--paper))';
            return (
              <span key={h} tabIndex={future ? -1 : 0} aria-label={future ? undefined : tipText(h)} onMouseEnter={() => !future && setTip(h)} onFocus={() => setTip(h)} onBlur={() => setTip(null)}
                style={{ flex: 1, height: '100%', display: 'flex', alignItems: 'flex-end', minWidth: 0 }}>
                <span style={{ width: '100%', height, background: bg, opacity: v === '<5' ? 0.45 : tip === h ? 0.85 : 1, borderRadius: '6px 6px 0 0', boxShadow: h === cur && n ? 'inset 0 0 0 1.5px var(--blue)' : undefined }} />
              </span>
            );
          })}
        </div>
        {tip !== null && (
          <span className="ma-filter-menu" aria-hidden="true"
            style={{ top: 0, left: `clamp(0px, calc(${((tip + 0.5) / 24) * 100}% - 100px), calc(100% - 200px))`, minWidth: 0, width: 200, fontSize: 12, fontWeight: 700, color: 'var(--ink2)', padding: '8px 10px', pointerEvents: 'none' }}>
            {tipText(tip)}
          </span>
        )}
      </div>
      <div style={{ display: 'flex', gap: mob ? 3 : 6, fontSize: 11, fontWeight: 700, color: 'var(--mut)' }}>
        {Array.from({ length: 24 }, (_, h) => <span key={h} style={{ flex: 1, minWidth: 0, textAlign: 'left', whiteSpace: 'nowrap', overflow: 'visible' }}>{h % step === 0 ? pad(h) : ''}</span>)}
      </div>
      {cur !== null && cur < 23 && <span style={mutedText}>{T.hours.future(pad(cur + 1))}</span>}
      <table className="ma-sr">
        <tbody>{bars.map((v, h) => <tr key={h}><th scope="row">{hourRange(h)}</th><td>{v === null ? '—' : cnt(v)}</td></tr>)}</tbody>
      </table>
    </div>
  );
}
