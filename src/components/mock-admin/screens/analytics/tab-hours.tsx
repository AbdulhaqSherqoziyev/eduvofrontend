'use client';
/** §9 "Soatlar": weekday × hour heatmap (sums over the period) + one chosen day by hour. Site-level only (T11). */
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/admin-mock/api';
import { addDays, dayLabel, groupNum, hourLabel, tashkentDay, weekday, WEEKDAY_LONG } from '@/lib/admin-mock/format';
import type { AnHourMetric } from '@/lib/admin-mock/types';
import { Segmented } from '../../ui/controls';
import { Skeleton } from '../../ui/table';
import { Card, Dim, mutedText, NotTracked, QueryError, sinceLabel } from './blocks';
import { AnalyticsFooter } from './footer';
import { Heatmap, HeatLegend } from './heatmap';
import { HourBars } from './hour-bars';
import { stampMs, type Period } from './period';
import { T } from './texts';

export const asMetric = (v: string): AnHourMetric => (v === 'exam_starts' || v === 'paid' ? v : 'visits');

export function MetricSwitch({ metric, onChange, mob }: { metric: AnHourMetric; onChange: (m: AnHourMetric) => void; mob: boolean }) {
  return (
    <div className={mob ? 'ma-an-seg-full' : undefined}>
      <Segmented small label={T.hours.metric} value={metric} onChange={onChange}
        options={(['visits', 'exam_starts', 'paid'] as const).map((m) => ({ value: m, label: T.hours.m[m] }))} />
    </div>
  );
}

/** the custom range (or the preset) does not cover whole weeks (§18.8) */
function uneven(p: Period) {
  if (p.range !== 'custom') return p.days % 7 !== 0;
  const hours = Math.round((stampMs(p.to) - stampMs(p.from)) / 3_600_000);
  return hours % (7 * 24) !== 0;
}

export function TabHours({ period, mob, metric, day, setDay }: {
  period: Period; mob: boolean; metric: AnHourMetric; day: string; setDay: (d: string) => void;
}) {
  const heat = useQuery({
    queryKey: ['am', 'an', 'hours', period.query, metric],
    queryFn: () => adminApi.anHours({ ...period.query!, metric }),
    enabled: !!period.query,
    placeholderData: (p) => p,
  });
  const today = tashkentDay();
  const theDay = /^\d{4}-\d{2}-\d{2}$/.test(day) && day <= today ? day : today;
  const dayQ = useQuery({
    queryKey: ['am', 'an', 'hours-day', theDay, metric],
    queryFn: () => adminApi.anHoursDay({ date: theDay, metric }),
    placeholderData: (p) => p,
  });
  const unit = T.hours.u[metric];
  const tracker = metric === 'visits';
  const h = heat.data;
  const notTracked = tracker && h && h.trackingSince === null;

  let heatBody: React.ReactNode;
  if (heat.isError && !h) heatBody = <QueryError q={heat} flat />;
  else if (!h) heatBody = <Skeleton height={mob ? 760 : 300} />;
  else if (notTracked) heatBody = <NotTracked />;
  else {
    const allZero = h.cells.flat().every((v) => v === 0);
    const peakOk = h.peak && h.peak.n > 0 && h.max > 0;
    heatBody = (
      <Dim on={heat.isFetching && heat.isPlaceholderData} style={{ gap: 12 }}>
        {(h.unevenWeekdays ?? uneven(period)) && <span style={mutedText}>{T.hours.uneven}</span>}
        {allZero ? <span style={{ ...mutedText, fontSize: 13 }}>{T.hours.allZero(unit)}</span>
          : peakOk && h.peak && (
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink2)' }}>
              {T.hours.peak(WEEKDAY_LONG[h.peak.dow], hourLabel(h.peak.hour), hourLabel(h.peak.hour + 1), groupNum(h.period?.days ?? period.days), groupNum(h.peak.n), unit)}
            </span>
          )}
        <Heatmap cells={h.cells} unit={unit} periodLabel={period.label} mob={mob} title={T.hours.heatTitle(T.hours.m[metric])} />
        <HeatLegend periodLabel={period.label} />
      </Dim>
    );
  }

  const dd = dayQ.data;
  let dayBody: React.ReactNode;
  if (dayQ.isError && !dd) dayBody = <QueryError q={dayQ} flat />;
  else if (!dd) dayBody = <Skeleton height={220} />;
  else if (tracker && (dd.beforeTracking || dd.trackingSince === null)) {
    dayBody = <span style={{ ...mutedText, fontSize: 13, padding: '40px 0', textAlign: 'center' }}>{T.hours.noTrackDay(dd.trackingSince ? sinceLabel(dd.trackingSince) : '—')}</span>;
  } else {
    dayBody = (
      <Dim on={dayQ.isFetching && dayQ.isPlaceholderData}>
        <HourBars bars={dd.bars} unit={unit} isToday={dd.isToday} currentHour={dd.currentHour} mob={mob} />
      </Dim>
    );
  }

  const nav = (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center', width: mob ? '100%' : undefined }}>
      <button type="button" className="ma-icon-btn" aria-label={T.hours.prevDay} title={T.hours.prevDay} onClick={() => setDay(addDays(theDay, -1))}>‹</button>
      <input type="date" className="ma-select" aria-label={T.hours.day} value={theDay} max={today} style={{ width: mob ? '100%' : 'auto', height: 40, flex: mob ? 1 : undefined, minWidth: 0 }}
        onChange={(e) => e.target.value && setDay(e.target.value > today ? today : e.target.value)} />
      <button type="button" className="ma-icon-btn" aria-label={T.hours.nextDay} title={T.hours.nextDay} disabled={theDay >= today} onClick={() => setDay(addDays(theDay, 1))}>›</button>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: mob ? 16 : 20 }}>
      <Card title={T.hours.heatTitle(T.hours.m[metric])}>{heatBody}</Card>
      <Card title={T.hours.dayTitle(weekday(theDay), dayLabel(theDay))} right={mob ? undefined : nav}>
        {mob && nav}
        {dayBody}
      </Card>
      <AnalyticsFooter kind="tracker" botFiltered={h?.botFiltered} />
    </div>
  );
}
