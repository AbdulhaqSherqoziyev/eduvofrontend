'use client';
/**
 * §5.3 trend: Dashboard RevenueChart frame (SVG 600×220, 3 guide lines). People = blue line + 10% area,
 * Visits = ai line; "Bugun" adds yesterday-until-now as a dashed muted line. Points before tracking
 * started are not drawn. Hover/focus columns show a small tooltip card; an sr-only table repeats the data.
 */
import { useState } from 'react';
import { dayLabel, groupNum, hourRange, tashkentDay, tashkentHour, weekday, addDays } from '@/lib/admin-mock/format';
import { axisLabels, niceMax } from '../../ui/chart';
import { mutedText, sinceLabel } from './blocks';
import { T } from './texts';

/** contract §2: `people`/`visits` null = before tracking (not drawn) */
export interface TrendPoint { t: string; people: number | null; visits: number | null }
type Bucket = 'hour' | 'day' | 'week';

/** bucket start → { day, hour } in Tashkent ("YYYY-MM-DD", "YYYY-MM-DDTHH" or an ISO instant) */
function at(t: string): { day: string; hour: number } {
  if (/^\d{4}-\d{2}-\d{2}$/.test(t)) return { day: t, hour: 0 };
  if (/^\d{4}-\d{2}-\d{2}T\d{2}$/.test(t)) return { day: t.slice(0, 10), hour: Number(t.slice(11, 13)) };
  const d = new Date(t);
  return { day: tashkentDay(d), hour: tashkentHour(d) };
}

export function pointLabel(t: string, bucket: Bucket) {
  const a = at(t);
  if (bucket === 'hour') return `${dayLabel(a.day)}, ${hourRange(a.hour)}`;
  if (bucket === 'week') return `${dayLabel(a.day)} – ${dayLabel(addDays(a.day, 6))}`;
  return `${weekday(a.day)}, ${dayLabel(a.day)}`;
}
const axisLabel = (t: string, bucket: Bucket) => (bucket === 'hour' ? `${String(at(t).hour).padStart(2, '0')}:00` : dayLabel(at(t).day));

const W = 600;
/**
 * Line (or area) through the non-null values; a null breaks the line into separate segments (contract v1.1:
 * before tracking / hours without a rollup). x scale from `scaleN` buckets (yesterday's line uses today's scale).
 */
function path(vals: Array<number | null>, max: number, H: number, close = false, scaleN = vals.length) {
  const n = scaleN;
  const xs = (i: number) => (n === 1 ? W / 2 : (i / (n - 1)) * W);
  const y = (v: number) => (H - 10 - (v / max) * (H - 30)).toFixed(1);
  const out: string[] = [];
  let seg: number[] = [];
  const flush = () => {
    if (!seg.length) return;
    const d = `M${seg.map((i) => `${xs(i).toFixed(1)} ${y(vals[i] as number)}`).join('L')}`;
    out.push(close ? `${d}L${xs(seg[seg.length - 1]).toFixed(1)} ${H}L${xs(seg[0]).toFixed(1)} ${H}Z` : d);
    seg = [];
  };
  vals.forEach((v, i) => { if (v === null) flush(); else seg.push(i); });
  flush();
  return out.join('');
}

export function TrendChart({ points, prevPoints, bucket, trackingSince, periodLabel, mob }: {
  points: TrendPoint[]; prevPoints?: TrendPoint[]; bucket: Bucket; trackingSince: string | null; periodLabel: string; mob: boolean;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const H = mob ? 180 : 220;
  // points before tracking started come as null: the lines start at the first tracked bucket
  let first = points.findIndex((p) => p.people !== null || p.visits !== null);
  if (first < 0) first = points.length;
  const people = points.map((p) => p.people), visits = points.map((p) => p.visits);
  const prevPeople = prevPoints?.map((p) => p.people) ?? [];
  const nums = (a: Array<number | null>) => a.filter((v): v is number => v !== null);
  const max = niceMax(Math.max(1, ...nums(people), ...nums(visits), ...nums(prevPeople)));
  const allZero = points.slice(first).every((p) => !p.people && !p.visits);
  const title = bucket === 'hour' ? T.ov.byHour : bucket === 'week' ? T.ov.byWeek : T.ov.byDay;
  const peak = points.slice(first).reduce<TrendPoint | null>((b, p) => (!b || (p.people ?? 0) > (b.people ?? 0) ? p : b), null);
  const aria = peak && !allZero
    ? `${T.ov.people} va ${T.ov.visits.toLowerCase()}, ${periodLabel}. Eng ko'p: ${pointLabel(peak.t, bucket)} — ${groupNum(peak.people ?? 0)} odam.`
    : `${T.ov.people} va ${T.ov.visits.toLowerCase()}, ${periodLabel}.`;
  const tip = (i: number) => `${pointLabel(points[i].t, bucket)} · ${T.ov.people} ${people[i] === null ? '—' : groupNum(people[i] as number)} · ${T.ov.visits} ${visits[i] === null ? '—' : groupNum(visits[i] as number)}`;
  const n = points.length;
  const xPct = (i: number) => (n === 1 ? 50 : (i / (n - 1)) * 100);
  const legend = (c: string, l: string, dashed?: boolean) => (
    <span style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
      <i style={{ width: 10, height: 3, borderRadius: 2, background: dashed ? `repeating-linear-gradient(90deg, ${c} 0 3px, transparent 3px 5px)` : c }} />{l}
    </span>
  );
  return (
    <section style={{ borderRadius: 24, boxShadow: 'var(--raise)', padding: 20, display: 'flex', flexDirection: 'column', gap: 14, minWidth: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, flex: 1 }}>{title}</h3>
        <div style={{ display: 'flex', gap: 12, fontSize: 12, fontWeight: 700, color: 'var(--ink2)', flexWrap: 'wrap' }}>
          {legend('var(--blue)', T.ov.people)}
          {legend('var(--ai)', T.ov.visits)}
          {prevPoints && legend('var(--mut)', T.ov.yesterday, true)}
        </div>
      </div>
      {(first > 0 || allZero) && (
        <span style={mutedText}>{first > 0 && trackingSince ? T.state.trackedSince(sinceLabel(trackingSince)) : T.ov.empty}</span>
      )}
      <div style={{ position: 'relative' }} onMouseLeave={() => setHover(null)}>
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ width: '100%', height: H, display: 'block' }} role="img" aria-label={aria}>
          <path d={`M0 ${H / 4}H${W}M0 ${H / 2}H${W}M0 ${(3 * H) / 4}H${W}`} stroke="var(--line)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          {prevPeople.length > 0 && (
            <path d={path(prevPeople.slice(0, Math.max(1, n)), max, H, false, Math.max(n, prevPeople.length))}
              fill="none" stroke="var(--mut)" strokeWidth="2" strokeDasharray="4 4" vectorEffect="non-scaling-stroke" />
          )}
          <path d={path(people, max, H, true)} fill="var(--blue)" opacity="0.10" />
          <path d={path(people, max, H)} fill="none" stroke="var(--blue)" strokeWidth="2.5" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
          <path d={path(visits, max, H)} fill="none" stroke="var(--ai)" strokeWidth="2.5" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
          {hover !== null && hover >= first && <path d={`M${(xPct(hover) / 100) * W} 0V${H}`} stroke="var(--line)" strokeWidth="1" vectorEffect="non-scaling-stroke" />}
        </svg>
        {/* invisible full-height hit columns (hover + keyboard focus) */}
        <div style={{ position: 'absolute', inset: 0, display: 'flex' }}>
          {points.map((p, i) => (
            <span key={p.t} tabIndex={i >= first ? 0 : -1} aria-label={i >= first ? tip(i) : undefined}
              onMouseEnter={() => setHover(i)} onFocus={() => setHover(i)} onBlur={() => setHover(null)}
              style={{ flex: 1, height: '100%', outlineOffset: -2 }} />
          ))}
        </div>
        {hover !== null && hover >= first && (
          <span className="ma-filter-menu" role="presentation" aria-hidden="true"
            style={{ top: 4, left: `clamp(0px, calc(${xPct(hover)}% - 110px), calc(100% - 220px))`, minWidth: 0, width: 220, fontSize: 12, fontWeight: 700, color: 'var(--ink2)', padding: '8px 10px', pointerEvents: 'none' }}>
            {tip(hover)}
          </span>
        )}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 700, color: 'var(--mut)' }}>
        {axisLabels(points, (p) => axisLabel(p.t, bucket), mob ? 2 : 5).map((l, i) => <span key={i}>{l}</span>)}
      </div>
      <table className="ma-sr">
        <caption>{title}</caption>
        <thead><tr><th scope="col">{periodLabel}</th><th scope="col">{T.ov.people}</th><th scope="col">{T.ov.visits}</th></tr></thead>
        <tbody>{points.slice(first).map((p) => <tr key={p.t}><th scope="row">{pointLabel(p.t, bucket)}</th><td>{p.people ?? 0}</td><td>{p.visits ?? 0}</td></tr>)}</tbody>
      </table>
    </section>
  );
}
