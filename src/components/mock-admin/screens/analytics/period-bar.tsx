'use client';
/**
 * Period row (§2.4): Dashboard's `ma-seg s-32` + `ma-select` pattern. "Oraliq" shows date + hour inputs
 * left of the segment; no apply button — a valid change goes to the URL after 400 ms, an invalid one
 * shows its error and sends nothing (the old data stays).
 */
import { useEffect, useRef, useState } from 'react';
import { addDays, tashkentDay, tashkentHour } from '@/lib/admin-mock/format';
import { Segmented } from '../../ui/controls';
import { customError, defaultCustom, nowEndStamp, TAB_PERIODS, TRACKER_TABS, type Period, type RangeOpt, type TabKey } from './period';
import { T } from './texts';

const pad = (n: number) => String(n).padStart(2, '0');
const muted = { fontSize: 12, fontWeight: 600, color: 'var(--mut)' } as const;

/** "YYYY-MM-DDTHH" → date + hour; the "hozir" end of hour 23 is shown as today + 24 */
function split(s: string, today: string): { date: string; hour: number } {
  const date = s.slice(0, 10), hour = Number(s.slice(11, 13));
  if (hour === 0 && date === addDays(today, 1)) return { date: today, hour: 24 };
  return { date, hour };
}
const join = (date: string, hour: number) => (hour === 24 ? `${addDays(date, 1)}T00` : `${date}T${pad(hour)}`);

export function PeriodBar({ tab, period, onRange, onCustom, mob, children }: {
  tab: TabKey;
  period: Period;
  onRange: (r: RangeOpt) => void;
  onCustom: (from: string, to: string) => void;
  mob: boolean;
  /** tab filters (right side on desktop, below on phones) */
  children?: React.ReactNode;
}) {
  const opts = TAB_PERIODS[tab] ?? [];
  const pick = (r: RangeOpt) => {
    if (r === 'custom' && period.range !== 'custom') {
      const d = defaultCustom();
      onCustom(d.from, d.to);
    } else onRange(r);
  };
  const seg = (
    <div className={mob ? 'ma-an-seg-full' : undefined}>
      <Segmented small label={T.period.label} value={period.range} onChange={pick} options={opts.map((o) => ({ value: o, label: T.period[o] }))} />
    </div>
  );
  const tz = <span style={muted}>{T.period.tz}</span>;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: mob ? 12 : 8 }}>
      <div style={{ display: 'flex', alignItems: mob ? 'stretch' : 'center', gap: 12, flexWrap: 'wrap', flexDirection: mob ? 'column' : 'row' }}>
        {period.range === 'custom' && !mob && <CustomInputs period={period} onCustom={onCustom} mob={false} />}
        {seg}
        {period.range === 'custom' && mob && <CustomInputs period={period} onCustom={onCustom} mob />}
        {tz}
        {children && <div style={mob ? { display: 'flex', flexDirection: 'column', gap: 10 } : { marginLeft: 'auto', display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>{children}</div>}
      </div>
    </div>
  );
}

function CustomInputs({ period, onCustom, mob }: { period: Period; onCustom: (from: string, to: string) => void; mob: boolean }) {
  const today = tashkentDay();
  const curHour = tashkentHour();
  const [from, setFrom] = useState(period.from);
  const [to, setTo] = useState(period.to);
  // the URL changed from outside (back button, another tab of the section)
  useEffect(() => { setFrom(period.from); setTo(period.to); }, [period.from, period.to]);
  const error = customError(from, to, Date.now(), TRACKER_TABS.includes(period.tab));
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => {
    window.clearTimeout(timer.current);
    if (error || (from === period.from && to === period.to)) return;
    timer.current = window.setTimeout(() => onCustom(from, to), 400);
    return () => window.clearTimeout(timer.current);
  }, [from, to, error, period.from, period.to, onCustom]);

  const f = split(from, today), t = split(to, today);
  const nowEnd = split(nowEndStamp(), today);
  const date = (v: string, set: (d: string) => void, label: string) => (
    <input type="date" className="ma-select" style={{ width: mob ? '100%' : 'auto', height: 40, minWidth: 0 }} value={v} max={today} aria-label={label}
      aria-invalid={error ? true : undefined} onChange={(e) => e.target.value && set(e.target.value)} />
  );
  const hour = (v: number, set: (h: number) => void, label: string, isTo: boolean, day: string) => {
    const hours = Array.from({ length: isTo && day === today && nowEnd.hour === 24 ? 25 : 24 }, (_, h) => h);
    return (
      <select className="ma-select" style={{ width: 92, height: 40 }} value={v} aria-label={label} aria-invalid={error ? true : undefined}
        onChange={(e) => set(Number(e.target.value))}>
        {hours.map((h) => {
          const isNow = isTo && day === today && h === nowEnd.hour;
          const disabled = day === today && (isTo ? h > nowEnd.hour : h > curHour);
          return <option key={h} value={h} disabled={disabled}>{isNow ? T.period.now : `${pad(h % 24)}:00`}</option>;
        })}
      </select>
    );
  };
  const lab = { fontSize: 13, fontWeight: 700, color: 'var(--ink2)' } as const;
  const fromRow = (
    <>
      {date(f.date, (d) => setFrom(join(d, f.hour)), T.period.fromDate)}
      {hour(f.hour, (h) => setFrom(join(f.date, h)), T.period.fromHour, false, f.date)}
    </>
  );
  const toRow = (
    <>
      {date(t.date, (d) => setTo(join(d, d === today ? Math.min(t.hour, nowEnd.hour) : t.hour === 24 ? 0 : t.hour)), T.period.toDate)}
      {hour(t.hour, (h) => setTo(join(t.date, h)), T.period.toHour, true, t.date)}
    </>
  );
  const err = error && <span role="alert" style={{ fontSize: 12, fontWeight: 700, color: 'var(--err)' }}>{error}</span>;
  if (mob) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <span style={lab}>{T.period.from}</span>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 92px', gap: 8 }}>{fromRow}</div>
        <span style={lab}>{T.period.to}</span>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 92px', gap: 8 }}>{toRow}</div>
        {err}
      </div>
    );
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <span style={lab}>{T.period.from}</span>
        {fromRow}
        <span style={{ color: 'var(--mut)', fontWeight: 700 }}>–</span>
        <span style={lab}>{T.period.to}</span>
        {toRow}
      </div>
      {err}
    </div>
  );
}
