import type { IncomePoint } from '@/lib/types/dashboard';

export interface ChartPoint {
  x: number;
  y: number;
  month: string;
}

export interface ChartResult {
  linePath: string;
  areaPath: string;
  points: ChartPoint[];
}

const W = 720;
const H = 240;
const PAD_X = 36;
const PAD_TOP = 24;
const PAD_BOTTOM = 40;

/** Build a smooth catmull-rom area + line chart from income points. */
export function buildChart(data: IncomePoint[]): ChartResult {
  if (data.length === 0) return { linePath: '', areaPath: '', points: [] };

  const max = Math.max(...data.map((d) => d.value), 1);
  const min = Math.min(...data.map((d) => d.value), 0);
  const span = max - min || 1;
  const innerW = W - PAD_X * 2;
  const innerH = H - PAD_TOP - PAD_BOTTOM;

  const points: ChartPoint[] = data.map((d, i) => ({
    x: PAD_X + (data.length === 1 ? innerW / 2 : (innerW * i) / (data.length - 1)),
    y: PAD_TOP + innerH - ((d.value - min) / span) * innerH,
    month: d.month,
  }));

  let linePath = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    linePath += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y}`;
  }

  const baseY = PAD_TOP + innerH;
  const last = points[points.length - 1];
  const areaPath = `${linePath} L ${last.x} ${baseY} L ${points[0].x} ${baseY} Z`;

  return { linePath, areaPath, points };
}
