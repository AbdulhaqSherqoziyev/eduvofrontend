'use client';
/**
 * Progress charts (Dashboard.dc.html line chart, Mobile App bar chart). Always LTR (README: charts
 * stay LTR); labels are HTML, not SVG text (README §5).
 */
import { fmtDayMonth, fmtMonthShort, fmtScore } from '@/lib/mock/format';
import { sx } from '@/lib/mock/sx';

export interface Pt { at: string; value: number }

/** y-domain around the data and the target: IELTS steps of 1 band, SAT steps of 100. */
export function domain(values: number[], target: number | null, exam: string): { lo: number; hi: number; ticks: number[] } {
  const all = [...values, ...(target != null ? [target] : [])];
  if (exam === 'sat') {
    const lo = Math.max(400, Math.floor((Math.min(...all) - 100) / 100) * 100);
    const hi = Math.min(1600, Math.ceil((Math.max(...all) + 100) / 100) * 100);
    const step = hi - lo > 600 ? 200 : 100;
    const ticks: number[] = [];
    for (let v = Math.ceil(lo / step) * step; v <= hi; v += step) ticks.push(v);
    return { lo, hi, ticks };
  }
  const lo = Math.max(0, Math.floor(Math.min(...all)) - 0.5);
  const hi = Math.min(9, Math.ceil(Math.max(...all)) + 1);
  const ticks: number[] = [];
  for (let v = Math.ceil(lo); v <= hi; v++) ticks.push(v);
  return { lo, hi, ticks };
}

export function LineChart({ pts, target, exam, lang }: { pts: Pt[]; target: number | null; exam: string; lang: string }) {
  const d = domain(pts.map((p) => p.value), target, exam);
  const y = (v: number) => 150 - ((v - d.lo) / (d.hi - d.lo)) * 130;
  const n = pts.length;
  const x = (i: number) => (n <= 1 ? 216 : 48 + (i * 336) / (n - 1));
  const P = pts.map((p, i) => ({ x: x(i), y: y(p.value), v: fmtScore(p.value, exam), d: fmtDayMonth(lang, p.at) }));
  return (
    <div dir="ltr" style={sx('position:relative;width:100%;aspect-ratio:400 / 180')}>
      <svg viewBox="0 0 400 180" preserveAspectRatio="none" style={sx('position:absolute;inset:0;width:100%;height:100%;overflow:visible')} aria-hidden>
        {d.ticks.map((g) => <line key={g} x1="28" x2="392" y1={y(g)} y2={y(g)} stroke="var(--line)" strokeWidth="1" vectorEffect="non-scaling-stroke" />)}
        {target != null && <line x1="28" x2="392" y1={y(target)} y2={y(target)} stroke="var(--ok)" strokeWidth="1.5" strokeDasharray="4 4" vectorEffect="non-scaling-stroke" />}
        <polyline points={P.map((p) => `${p.x},${p.y}`).join(' ')} fill="none" stroke="var(--blue)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      </svg>
      {d.ticks.map((g) => (
        <span key={g} style={{ ...sx('position:absolute;left:0;transform:translateY(-50%);font-size:11px;font-weight:700;color:var(--mut)'), top: `${(y(g) / 180) * 100}%` }}>{fmtScore(g, exam)}</span>
      ))}
      {P.map((p, i) => (
        <span key={i}>
          <span style={{ ...sx('position:absolute;width:11px;height:11px;border-radius:50%;background:var(--bg);border:2.5px solid var(--blue);transform:translate(-50%,-50%)'), left: `${(p.x / 400) * 100}%`, top: `${(p.y / 180) * 100}%` }} />
          <span style={{ ...sx('position:absolute;transform:translate(-50%,-160%);font-size:12px;font-weight:800;color:var(--ink)'), left: `${(p.x / 400) * 100}%`, top: `${(p.y / 180) * 100}%` }}>{p.v}</span>
          <span style={{ ...sx('position:absolute;bottom:-4px;transform:translateX(-50%);font-size:11px;font-weight:700;color:var(--mut);white-space:nowrap'), left: `${(p.x / 400) * 100}%` }}>{p.d}</span>
        </span>
      ))}
    </div>
  );
}

/** Phone bars: last bar gradient, others --hover; dashed target line (Mobile App `home` / `progress`). */
export function BarChart({ pts, target, exam, lang, height = 130 }: { pts: Pt[]; target: number | null; exam: string; lang: string; height?: number }) {
  const d = domain(pts.map((p) => p.value), target, exam);
  const yh = (v: number) => ((v - d.lo) / (d.hi - d.lo)) * 100;
  return (
    <div dir="ltr" style={{ ...sx('display:flex;align-items:flex-end;gap:10px;position:relative;padding-top:18px'), height }}>
      {target != null && <span style={{ ...sx('position:absolute;left:0;right:0;border-top:2px dashed var(--ok)'), bottom: `calc(${yh(target) * 0.78}% + 20px)` }} />}
      {pts.map((p, i) => (
        <div key={i} style={sx('flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;height:100%;justify-content:flex-end')}>
          <span style={sx('font-size:12px;font-weight:800')}>{fmtScore(p.value, exam)}</span>
          <div style={{ ...sx('width:100%;max-width:34px;border-radius:10px 10px 6px 6px'), height: `${yh(p.value) * 0.78}%`, background: i === pts.length - 1 ? 'linear-gradient(180deg,#5B8DEF,#2E6BE6)' : 'var(--hover)' }} />
          <span style={sx('font-size:10px;color:var(--mut);font-weight:700')}>{fmtMonthShort(lang, p.at)}</span>
        </div>
      ))}
    </div>
  );
}
