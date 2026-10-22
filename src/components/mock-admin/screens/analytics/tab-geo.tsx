'use client';
/**
 * §8 "Geografiya": countries + cities (no map, no district, no ISP); Tashkent routing note.
 * Each list pages on its own (contract §5 `list=countries|cities`).
 */
import { adminApi } from '@/lib/admin-mock/api';
import { cnt, flag, pct } from '@/lib/admin-mock/format';
import type { AnCityRow, AnCountryRow, AnGeoRes } from '@/lib/admin-mock/types';
import { SkeletonRows, Table, TableWrap } from '../../ui/table';
import { BeforeTracking, Card, Dim, Note, NotTracked, QueryError } from './blocks';
import { AnalyticsFooter } from './footer';
import { usePaged } from './paged';
import { shorterThan, trackState, type Period } from './period';
import { T } from './texts';
import { TopTable } from './top-table';

export function TabGeo({ period, mob, show30 }: { period: Period; mob: boolean; show30: () => void }) {
  const qc = usePaged<AnGeoRes>('geo-countries', adminApi.anGeo, period.query ? { ...period.query, list: 'countries' } : null, mob, (r) => r.countries?.nextCursor);
  const qi = usePaged<AnGeoRes>('geo-cities', adminApi.anGeo, period.query ? { ...period.query, list: 'cities' } : null, mob, (r) => r.cities?.nextCursor);
  if (qc.q.isError && !qc.first && qi.q.isError && !qi.first) return <QueryError q={qc.q} />;
  const head = qc.first ?? qi.first;
  const ts = head ? trackState(head.trackingSince, period) : 'ok';
  if (ts === 'none') return <><NotTracked /><AnalyticsFooter kind="tracker" /></>;
  const before = ts === 'before';
  const empty = { title: T.ov.empty, action: shorterThan(period, 30) ? { label: T.state.show30, onClick: show30 } : undefined };
  const skel = <TableWrap><Table><tbody><SkeletonRows cols={3} n={5} /></tbody></Table></TableWrap>;
  const countries = before ? [] : qc.pages.flatMap((p) => p.countries?.rows ?? []);
  const cities = before ? [] : qi.pages.flatMap((p) => p.cities?.rows ?? []);
  return (
    <Dim on={qc.dim || qi.dim}>
      {before && head?.trackingSince && <BeforeTracking since={head.trackingSince} />}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,420px),1fr))', gap: mob ? 16 : 20, alignItems: 'start' }}>
        <Card title={T.geo.countries}>
          {qc.q.isError && !qc.first ? <QueryError q={qc.q} flat /> : !qc.first ? skel : (
            <TopTable<AnCountryRow> mob={mob} rows={countries} rowKey={(r, i) => `${r.code ?? 'xx'}-${i}`} more={qc.more} empty={empty} bar={(r) => r.people}
              name={{ label: T.col.country, render: (r) => ({ title: r.code ? `${flag(r.code)} ${r.label}` : r.label || T.geo.unknown }) }}
              cols={[
                { key: 'people', label: T.col.people, num: true, render: (r) => cnt(r.people) },
                ...(mob ? [] : [{ key: 'share', label: T.col.share, num: true, render: (r: AnCountryRow) => (r.share === null || r.people === '<5' ? '—' : pct(r.share)) }]),
              ]} />
          )}
        </Card>
        <Card title={T.geo.cities}>
          {qi.q.isError && !qi.first ? <QueryError q={qi.q} flat /> : !qi.first ? skel : (
            <TopTable<AnCityRow> mob={mob} rows={cities} rowKey={(r, i) => `${r.city ?? '-'}-${r.country ?? '-'}-${i}`} more={qi.more} empty={empty} bar={(r) => r.people}
              name={{ label: T.col.city, render: (r) => ({ title: r.city ?? T.geo.noCity }) }}
              cols={[
                ...(mob ? [] : [{ key: 'country', label: T.col.country, render: (r: AnCityRow) => r.countryLabel || T.geo.unknown }]),
                { key: 'people', label: T.col.people, num: true, render: (r) => cnt(r.people) },
              ]} />
          )}
          <Note>{T.geo.tashkentNote}</Note>
        </Card>
      </div>
      <AnalyticsFooter kind="tracker" botFiltered={head?.botFiltered} />
    </Dim>
  );
}
