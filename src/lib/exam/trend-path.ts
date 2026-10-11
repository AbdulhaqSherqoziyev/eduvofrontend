/**
 * TrendChart geometry (§5). Same viewBox and curve as the dashboard's
 * `chart-path.ts`, but with a narrow score domain (a 0–9 axis would flatten
 * every real change of half a band into a straight line).
 */
import type { ExamFamily } from './hub-types';

export const TW = 720;
export const TH = 240;
const PX = 40;
const PT = 26;
const PB = 40;

export interface TrendPoint { x: number; y: number; v: number; i: number }
export interface Trend { line: string; area: string; points: TrendPoint[]; ticks: { y: number; v: number }[]; levels: { y: number; label: string }[] }

/** CEFR certificate floors (cefr.md §1: B1 38, B2 51, C1 65). */
const CEFR_LEVELS = [{ label: 'B1 · 38', v: 38 }, { label: 'B2 · 51', v: 51 }, { label: 'C1 · 65', v: 65 }];

export function buildTrend(values: number[], family: ExamFamily): Trend {
  const ielts = family !== 'CEFR' && family !== 'SAT';
  const sat = family === 'SAT'; // SAT: section 200–800 / total 400–1600, 10-point steps
  const pad = sat ? 30 : ielts ? 0.5 : 5;
  const top = sat ? 1600 : ielts ? 9 : 75;
  const lo = Math.max(0, Math.min(...values) - pad);
  const hi = Math.min(top, Math.max(...values) + pad);
  const span = hi - lo || 1;
  const innerW = TW - PX * 2;
  const innerH = TH - PT - PB;
  const y = (v: number) => PT + innerH - ((v - lo) / span) * innerH;
  const points = values.map((v, i) => ({ x: PX + (values.length === 1 ? innerW / 2 : (innerW * i) / (values.length - 1)), y: y(v), v, i }));

  let line = points.length ? `M ${points[0].x} ${points[0].y}` : '';
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    line += ` C ${p1.x + (p2.x - p0.x) / 6} ${p1.y + (p2.y - p0.y) / 6}, ${p2.x - (p3.x - p1.x) / 6} ${p2.y - (p3.y - p1.y) / 6}, ${p2.x} ${p2.y}`;
  }
  const base = PT + innerH;
  const area = points.length ? `${line} L ${points[points.length - 1].x} ${base} L ${points[0].x} ${base} Z` : '';

  const step = sat ? 50 : ielts ? 0.5 : 5;
  const ticks: { y: number; v: number }[] = [];
  for (let v = Math.ceil(lo / step) * step; v <= hi + 1e-9; v += step) ticks.push({ y: y(v), v });
  const levels = ielts || sat ? [] : CEFR_LEVELS.filter((l) => l.v >= lo && l.v <= hi).map((l) => ({ y: y(l.v), label: l.label }));
  return { line, area, points, ticks, levels };
}
