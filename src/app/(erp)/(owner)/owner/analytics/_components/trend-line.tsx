'use client';
/**
 * Hand-drawn SVG charts (no chart library, spec §14): TrendLine (main chart, hover + keyboard tooltip),
 * Sparkline (§4.2 — no axes/labels/dots/tooltip, own scale, aria-hidden + sr-only table) and
 * CompareBars (ERP "Bugun": today vs yesterday-same-time). Colours only via CSS variables (dark mode).
 */
import { useEffect, useId, useRef, useState } from 'react';
import { cn } from '@/lib/utils/cn';
import { fmtInt } from './format';

export function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [w, setW] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    setW(el.clientWidth);
    const ro = new ResizeObserver(() => setW(el.clientWidth));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, w] as const;
}

type V = number | null;

/** Split a series at nulls → runs of [index, value]. */
function runs(vals: V[]): Array<Array<[number, number]>> {
  const out: Array<Array<[number, number]>> = [];
  let cur: Array<[number, number]> = [];
  vals.forEach((v, i) => {
    if (v === null) { if (cur.length) out.push(cur); cur = []; } else cur.push([i, v]);
  });
  if (cur.length) out.push(cur);
  return out;
}

function niceMax(m: number) {
  if (m <= 0) return 1;
  const p = Math.pow(10, Math.floor(Math.log10(m)));
  const f = m / p;
  return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * p;
}

export interface TrendPoint {
  key: string;
  /** X-axis label ("15.10", "14:00"). */
  axis: string;
  /** Full tooltip line (spec §4.1). */
  tooltip: string;
  v: V;
}

interface TrendLineProps {
  points: TrendPoint[];
  /** Dashed comparison series (Bugun → kecha shu soatgacha), aligned by index. */
  prev?: V[] | null;
  /** Which x labels to print on wide screens. */
  axisEvery: number;
  /** sr-only table: caption + column headers + rows. */
  srCaption: string;
  srHead: [string, string];
}

export function TrendLine({ points, prev, axisEvery, srCaption, srHead }: TrendLineProps) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const [active, setActive] = useState<number | null>(null);
  const gid = useId().replace(/:/g, '');
  const mobile = width > 0 && width < 560;
  const H = mobile ? 180 : 240;
  const PL = 40, PR = 12, PT = 14, PB = 28;
  const n = points.length;
  const innerW = Math.max(10, width - PL - PR);
  const innerH = H - PT - PB;
  const vals = points.map((p) => p.v);
  const all = [...vals, ...(prev ?? [])].filter((v): v is number => v !== null);
  const max = niceMax(Math.max(0, ...all));
  const x = (i: number) => PL + (n <= 1 ? innerW / 2 : (i * innerW) / (n - 1));
  const y = (v: number) => PT + innerH - (v / max) * innerH;
  const step = n <= 1 ? innerW : innerW / (n - 1);

  const linePath = (vs: V[]) => runs(vs).map((r) => r.map(([i, v], k) => `${k ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join('')).join('');
  const areaPath = (vs: V[]) => runs(vs).map((r) => {
    const top = r.map(([i, v], k) => `${k ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join('');
    return `${top}L${x(r[r.length - 1][0]).toFixed(1)},${PT + innerH}L${x(r[0][0]).toFixed(1)},${PT + innerH}Z`;
  }).join('');
  const showAxis = (i: number) => (mobile ? i === 0 || i === n - 1 : i % axisEvery === 0 || i === n - 1);
  const ticks = [0, max / 2, max];

  return (
    <div ref={ref} className="relative w-full" style={{ height: H }}>
      {width > 0 ? (
        <svg width={width} height={H} className="block overflow-visible">
          <defs>
            <linearGradient id={`area-${gid}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" style={{ stopColor: 'var(--primary)', stopOpacity: 0.2 }} />
              <stop offset="100%" style={{ stopColor: 'var(--primary)', stopOpacity: 0 }} />
            </linearGradient>
          </defs>
          {ticks.map((t) => (
            <g key={t}>
              <line x1={PL} x2={PL + innerW} y1={y(t)} y2={y(t)} style={{ stroke: 'var(--text-soft)' }} strokeOpacity={0.18} strokeWidth={1} />
              <text x={PL - 8} y={y(t) + 4} textAnchor="end" fontSize={11} fontWeight={600} style={{ fill: 'var(--text-soft)' }}>
                {fmtInt(Math.round(t))}
              </text>
            </g>
          ))}
          {prev ? <path d={linePath(prev)} fill="none" style={{ stroke: 'var(--text-soft)' }} strokeWidth={2} strokeDasharray="4 4" strokeLinecap="round" /> : null}
          <path d={areaPath(vals)} fill={`url(#area-${gid})`} />
          <path d={linePath(vals)} fill="none" style={{ stroke: 'var(--primary)' }} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
          {points.map((p, i) => (
            <g key={p.key}>
              {showAxis(i) ? (
                <text x={x(i)} y={H - 8} textAnchor={mobile ? (i === 0 ? 'start' : 'end') : 'middle'} fontSize={11.5} fontWeight={600} style={{ fill: 'var(--text-soft)' }}>
                  {p.axis}
                </text>
              ) : null}
              {/* hover strip */}
              <rect x={x(i) - step / 2} y={PT} width={Math.max(step, 6)} height={innerH} fill="transparent"
                onMouseEnter={() => setActive(i)} onMouseLeave={() => setActive((a) => (a === i ? null : a))} />
              {p.v !== null ? (
                <circle cx={x(i)} cy={y(p.v)} r={active === i ? 5.5 : n > 40 ? 0 : 3.5} tabIndex={0} role="img" aria-label={p.tooltip}
                  onFocus={() => setActive(i)} onBlur={() => setActive((a) => (a === i ? null : a))}
                  style={{ fill: 'var(--bg)', stroke: 'var(--primary)', outline: 'none' }} strokeWidth={2.5} />
              ) : null}
            </g>
          ))}
          {active !== null ? <line x1={x(active)} x2={x(active)} y1={PT} y2={PT + innerH} style={{ stroke: 'var(--primary)' }} strokeOpacity={0.35} strokeWidth={1} pointerEvents="none" /> : null}
        </svg>
      ) : null}
      {active !== null && points[active] ? (
        <div role="tooltip"
          className="pointer-events-none absolute top-0 z-10 max-w-[260px] rounded-[12px] bg-background px-3 py-2 text-[12px] font-semibold leading-[1.45] text-foreground shadow-nm"
          style={{ left: Math.min(Math.max(0, x(active) - 130), Math.max(0, width - 260)) }}>
          {points[active].tooltip}
        </div>
      ) : null}
      <table className="sr-only">
        <caption>{srCaption}</caption>
        <thead><tr><th scope="col">{srHead[0]}</th><th scope="col">{srHead[1]}</th></tr></thead>
        <tbody>{points.map((p) => <tr key={p.key}><td>{p.axis}</td><td>{p.v === null ? '—' : fmtInt(p.v)}</td></tr>)}</tbody>
      </table>
    </div>
  );
}

/** §4.2 sparkline: 64px, no axes/labels/dots/hover, not focusable, own min–max scale. */
export function Sparkline({ values, labels, caption }: { values: V[]; labels: string[]; caption: string }) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const gid = useId().replace(/:/g, '');
  const H = 64, P = 4;
  const nums = values.filter((v): v is number => v !== null);
  const lo = 0; // baseline is zero (Sevara): a min–max scale exaggerated small dips
  const hi = nums.length ? Math.max(...nums) : 0;
  const n = values.length;
  const x = (i: number) => P + (n <= 1 ? (width - 2 * P) / 2 : (i * (width - 2 * P)) / (n - 1));
  const y = (v: number) => (hi === lo ? H / 2 : P + (H - 2 * P) * (1 - (v - lo) / (hi - lo)));
  const rs = runs(values);
  const line = rs.map((r) => r.map(([i, v], k) => `${k ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join('')).join('');
  const area = rs.map((r) => `${r.map(([i, v], k) => `${k ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join('')}L${x(r[r.length - 1][0]).toFixed(1)},${H}L${x(r[0][0]).toFixed(1)},${H}Z`).join('');
  return (
    <div ref={ref} className="w-full" style={{ height: H }}>
      {width > 0 ? (
        <svg width={width} height={H} aria-hidden focusable="false" className="block">
          <defs>
            <linearGradient id={`sp-${gid}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" style={{ stopColor: 'var(--primary)', stopOpacity: 0.16 }} />
              <stop offset="100%" style={{ stopColor: 'var(--primary)', stopOpacity: 0 }} />
            </linearGradient>
          </defs>
          <path d={area} fill={`url(#sp-${gid})`} />
          <path d={line} fill="none" style={{ stroke: 'var(--primary)' }} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : null}
      <table className="sr-only">
        <caption>{caption}</caption>
        <tbody>{values.map((v, i) => <tr key={labels[i] ?? i}><td>{labels[i]}</td><td>{v === null ? '—' : fmtInt(v)}</td></tr>)}</tbody>
      </table>
    </div>
  );
}

/** ERP "Bugun" (Sevara b): two bars, value above each, "Kecha" with a dashed outline. */
export function CompareBars({ today, yesterday }: { today: number; yesterday: number }) {
  const max = Math.max(today, yesterday, 1);
  const bars = [
    { label: 'Bugun', v: today, dashed: false },
    { label: 'Kecha shu vaqtgacha', v: yesterday, dashed: true },
  ];
  return (
    <div className="flex h-[200px] items-end justify-center gap-10 px-4 pb-1 sm:gap-16">
      {bars.map((b) => (
        <div key={b.label} className="flex h-full w-[96px] flex-col items-center justify-end gap-2 sm:w-[140px]">
          <span className="text-[15px] font-extrabold tabular-nums text-foreground">{fmtInt(b.v)}</span>
          <div className={cn('w-full rounded-t-[12px]', b.dashed ? 'border-2 border-dashed' : '')}
            style={{
              height: `${Math.max(2, (b.v / max) * 130)}px`,
              background: b.dashed ? 'transparent' : 'var(--primary)',
              borderColor: b.dashed ? 'var(--text-soft)' : undefined,
              borderBottomWidth: b.dashed ? 2 : undefined,
            }} />
          <span className="flex h-[34px] items-start text-center text-[12px] font-semibold leading-[1.4] text-muted">{b.label}</span>
        </div>
      ))}
    </div>
  );
}
