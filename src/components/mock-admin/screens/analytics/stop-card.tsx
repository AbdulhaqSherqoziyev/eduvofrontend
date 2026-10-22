/**
 * §3.4 "Eng ko'p to'xtash nuqtasi" — neutral (no red/yellow, no warning icon). Picks, among
 * transitions whose denominator is a number ≥ 20, the one with the lowest pass rate (ties → earlier).
 */
import { cnt, groupNum, pct } from '@/lib/admin-mock/format';
import type { Cnt } from '@/lib/admin-mock/types';
import { eyebrow } from './blocks';
import { T } from './texts';

export interface Transition { from: string; to: string; num: Cnt | null; den: Cnt | null }

export function StopCard({ transitions, title = T.stop.title, unit = 'people' }: {
  transitions: Transition[];
  title?: string;
  /** "412 kishidan …" (people) or "38 tadan …" (orders, §11.1) */
  unit?: 'people' | 'orders';
}) {
  let best: { t: Transition; rate: number } | null = null;
  for (const t of transitions) {
    if (typeof t.den !== 'number' || t.den < 20 || t.num === null) continue;
    // "<5" compares as its upper bound
    const rate = (typeof t.num === 'number' ? t.num : 4.99) / t.den;
    if (!best || rate < best.rate) best = { t, rate };
  }
  let line1: string, line2: string;
  if (!best) { line1 = T.stop.none; line2 = T.stop.noneText; }
  else {
    const { t } = best;
    const m = groupNum(t.den as number);
    line1 = `${t.from} → ${t.to}`;
    if (t.num === '<5') line2 = unit === 'orders' ? `${m} tadan 5 dan kami o'tdi` : T.stop.lineLt5(m);
    else {
      const p = pct((t.num as number) / (t.den as number));
      line2 = unit === 'orders' ? `${m} tadan ${cnt(t.num)} tasi o'tdi (${p})` : T.stop.line(m, cnt(t.num), p);
    }
  }
  return (
    <div style={{ background: 'var(--paper)', borderRadius: 16, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
      <span style={eyebrow}>{title}</span>
      <b style={{ fontSize: 15, fontWeight: 800, color: 'var(--ink)' }}>{line1}</b>
      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink2)' }}>{line2}</span>
    </div>
  );
}
