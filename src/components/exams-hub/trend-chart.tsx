'use client';
/** TrendChart (§5): own progress only; best point marked; keyboard tooltips; hidden table for screen readers. */
import { useEffect, useState } from 'react';
import type { ExamFamily } from '@/lib/exam/hub-types';
import { ht } from '@/lib/exam/i18n/hub';
import { buildTrend, TH, TW } from '@/lib/exam/trend-path';

export interface TrendDatum { v: number; text: string; mock: string; date: string; tip: string }

function useCompact() {
  const [c, setC] = useState(false);
  useEffect(() => {
    const on = () => setC(window.innerWidth < 640);
    on();
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, []);
  return c;
}

export function TrendChart({ data, family, section }: { data: TrendDatum[]; family: ExamFamily; section: string }) {
  const compact = useCompact();
  const [hover, setHover] = useState<number | null>(null);
  const t = buildTrend(data.map((d) => d.v), family);
  const best = Math.max(...data.map((d) => d.v));
  const bestIdx = data.findIndex((d) => d.v === best);

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${TW} ${TH}`} className="h-auto w-full" role="img" aria-label={section}>
        <defs>
          <linearGradient id="exam-trend" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#2E6BE6" stopOpacity="0.14" />
            <stop offset="100%" stopColor="#2E6BE6" stopOpacity="0" />
          </linearGradient>
        </defs>
        {t.ticks.map((k) => <line key={k.v} x1={40} x2={TW - 40} y1={k.y} y2={k.y} stroke="#D5DCE6" strokeDasharray="3 4" />)}
        {t.levels.map((l) => (
          <g key={l.label}>
            <line x1={40} x2={TW - 40} y1={l.y} y2={l.y} stroke="#9aa6b8" strokeDasharray="6 4" />
            <text x={TW - 40} y={l.y - 5} textAnchor="end" fontSize="10.5" fontWeight={700} fill="#7A8699">{l.label}</text>
          </g>
        ))}
        <path d={t.area} fill="url(#exam-trend)" />
        <path d={t.line} fill="none" stroke="#2E6BE6" strokeWidth={2.5} />
        {t.points.map((p) => {
          const isBest = p.i === bestIdx && data.length > 1;
          const showX = !compact || p.i === 0 || p.i === data.length - 1;
          return (
            <g key={p.i}>
              <circle
                cx={p.x}
                cy={p.y}
                r={isBest ? 6 : 4}
                fill="#fff"
                stroke="#2E6BE6"
                strokeWidth={2}
                tabIndex={0}
                aria-label={data[p.i].tip}
                onMouseEnter={() => setHover(p.i)}
                onMouseLeave={() => setHover(null)}
                onFocus={() => setHover(p.i)}
                onBlur={() => setHover(null)}
                className="cursor-pointer outline-none focus:stroke-[#1F55C4]"
              />
              {isBest ? <text x={p.x} y={p.y - 12} textAnchor="middle" fontSize="11" fontWeight={700} fill="#1E2A3A">{ht('results.personal_best')}</text> : null}
              {showX ? (
                <text x={p.x} y={TH - 18} textAnchor="middle" fontSize="11" fontWeight={700} fill="#7A8699">
                  {data[p.i].mock}
                  <tspan x={p.x} dy="13" fontWeight={600}>{data[p.i].date}</tspan>
                </text>
              ) : null}
            </g>
          );
        })}
      </svg>
      {hover != null ? (
        <div
          className="pointer-events-none absolute -translate-x-1/2 -translate-y-full rounded-[10px] bg-[#1E2A3A] px-2.5 py-1.5 text-[12px] font-bold text-white"
          style={{ left: `${(t.points[hover].x / TW) * 100}%`, top: `calc(${(t.points[hover].y / TH) * 100}% - 10px)` }}
        >
          {data[hover].tip}
        </div>
      ) : null}
      <table className="sr-only">
        <caption>{section}</caption>
        <tbody>{data.map((d, i) => <tr key={i}><td>{d.mock}</td><td>{d.date}</td><td>{d.text}</td></tr>)}</tbody>
      </table>
    </div>
  );
}
