'use client';
/** §5 "Umumiy": 4 KPI cards with deltas, trend (hour/day/week), top sources + top pages (top-5, "Hammasi →"). */
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/admin-mock/api';
import { cnt, duration, groupNum, pct, ratioView } from '@/lib/admin-mock/format';
import type { AnOverviewRes } from '@/lib/admin-mock/types';
import { Skeleton, SkeletonRows, Table, TableWrap } from '../../ui/table';
import { BeforeTracking, Card, Dim, NotTracked, QueryError, sinceLabel } from './blocks';
import { AnalyticsFooter } from './footer';
import { AnKpi, countDelta, ppDelta } from './kpi';
import { nullTitle, trackState, type Period, type TabKey } from './period';
import { T } from './texts';
import { TopTable } from './top-table';
import { TrendChart } from './trend-chart';

export function TabOverview({ period, mob, go }: { period: Period; mob: boolean; go: (tab: TabKey) => void }) {
  const q = useQuery({
    queryKey: ['am', 'an', 'overview', period.query],
    queryFn: () => adminApi.anOverview(period.query!),
    enabled: !!period.query,
    placeholderData: (p) => p,
  });
  if (q.isError && !q.data) return <QueryError q={q} />;
  if (!q.data) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }} aria-busy="true">
        <div className="ma-an-kpis">{[0, 1, 2, 3].map((i) => <Skeleton key={i} height={120} radius={20} />)}</div>
        <Skeleton height={260} />
        <div className="ma-an-g2">
          {[0, 1].map((i) => <TableWrap key={i}><Table><tbody><SkeletonRows cols={3} n={5} /></tbody></Table></TableWrap>)}
        </div>
      </div>
    );
  }
  const d = q.data;
  const ts = trackState(d.trackingSince, period);
  if (ts === 'none') return <><NotTracked /><AnalyticsFooter kind="tracker" botFiltered={d.botFiltered} /></>;
  return (
    <Dim on={q.isFetching && q.isPlaceholderData}>
      {ts === 'before' && d.trackingSince && <BeforeTracking since={d.trackingSince} />}
      <Kpis d={d} period={period} before={ts === 'before'} />
      {ts === 'ok' && <TrendChart points={d.trend.points} prevPoints={period.range === 'today' ? d.trend.prevPoints ?? undefined : undefined} bucket={d.trend.bucket} trackingSince={d.trackingSince} periodLabel={period.label} mob={mob} />}
      {ts === 'ok' && (
        <div className="ma-an-g2">
          <Card title={T.ov.topSources} right={<LinkBtn onClick={() => go('sources')} />}>
            <TopTable mob={mob} rows={d.topSources} rowKey={(r) => r.key} empty={{ title: T.ov.empty }} bar={(r) => r.people}
              name={{ label: T.col.source, render: (r) => ({ title: r.label }) }}
              cols={[
                { key: 'people', label: T.col.people, num: true, render: (r) => cnt(r.people) },
                { key: 'share', label: T.col.share, num: true, render: (r) => (r.share === null || r.people === '<5' ? '—' : pct(r.share)) },
              ]} />
          </Card>
          <Card title={T.ov.topPages} right={<LinkBtn onClick={() => go('pages')} />}>
            <TopTable mob={mob} rows={d.topPages} rowKey={(r) => r.path} empty={{ title: T.ov.empty }} bar={(r) => r.views}
              name={{ label: T.col.page, render: (r) => ({ title: r.label ?? r.path }) }}
              cols={[
                { key: 'views', label: T.col.views, num: true, render: (r) => cnt(r.views) },
                { key: 'people', label: T.col.people, num: true, render: (r) => cnt(r.people) },
              ]} />
          </Card>
        </div>
      )}
      <AnalyticsFooter kind="tracker" botFiltered={d.botFiltered} />
    </Dim>
  );
}

function LinkBtn({ onClick }: { onClick: () => void }) {
  return <button type="button" onClick={onClick} style={{ border: 0, background: 'transparent', padding: 0, color: 'var(--blue)', fontSize: 13, fontWeight: 700 }}>{T.table.all}</button>;
}

function Kpis({ d, period, before }: { d: AnOverviewRes; period: Period; before: boolean }) {
  const k = d.kpis;
  const dashTitle = before && d.trackingSince ? T.state.trackedSince(sinceLabel(d.trackingSince)) : nullTitle(period);
  const val = (v: number | null, f: (n: number) => string) => (before || v === null ? '—' : f(v));
  const sp = k.singlePage.cur;
  const spView = sp ? ratioView(sp.num, sp.den) : null;
  const spPrev = k.singlePage.prev ? ratioView(k.singlePage.prev.num, k.singlePage.prev.den) : null;
  const spDelta = before || !spView ? null
    : k.singlePage.prev === null ? 'na' as const
    : spView.rate !== null && spPrev?.rate !== null && spPrev ? ppDelta(spView.rate, spPrev.rate as number) : null;
  return (
    <div className="ma-an-kpis">
      <AnKpi label={T.ov.visits} def={T.ov.visitsDef} judged value={val(k.visits.cur, groupNum)} valueTitle={k.visits.cur === null || before ? dashTitle : undefined}
        delta={before ? null : countDelta(k.visits.cur, k.visits.prev)} note={period.deltaNote} />
      <AnKpi label={T.ov.people} def={T.ov.peopleDef} judged value={val(k.people.cur, groupNum)} valueTitle={k.people.cur === null || before ? dashTitle : undefined}
        delta={before ? null : countDelta(k.people.cur, k.people.prev)} note={period.deltaNote} />
      <AnKpi label={T.ov.time} def={T.ov.timeDef} judged={false} value={val(k.medianVisitTimeSec.cur, duration)} valueTitle={k.medianVisitTimeSec.cur === null || before ? dashTitle : undefined}
        delta={before ? null : countDelta(k.medianVisitTimeSec.cur, k.medianVisitTimeSec.prev)} note={period.deltaNote} />
      <AnKpi label={T.ov.single} def={T.ov.singleDef} judged={false}
        value={before || !spView ? '—' : spView.pct ?? spView.frac} valueTitle={before || !spView ? dashTitle : undefined}
        second={!before && spView?.pct ? spView.frac : null}
        delta={spDelta} note={period.deltaNote} />
    </div>
  );
}
