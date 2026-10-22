'use client';
/** §7 "Manbalar": sites (domain only) / UTM campaigns; phones: sites, 3 columns, top-5. */
import { adminApi } from '@/lib/admin-mock/api';
import { cnt, duration, ratioView } from '@/lib/admin-mock/format';
import type { AnCampaignRow, AnSourceRow, AnSourcesRes } from '@/lib/admin-mock/types';
import { Segmented } from '../../ui/controls';
import { SkeletonRows, Table, TableWrap } from '../../ui/table';
import { BeforeTracking, Card, DesktopOnly, Dim, InfoPop, mutedText, NotTracked, QueryError, reasonTitle } from './blocks';
import { AnalyticsFooter } from './footer';
import { usePaged } from './paged';
import { nullTitle, shorterThan, trackState, type Period } from './period';
import { T } from './texts';
import { TopTable } from './top-table';

/** classifier key of "To'g'ridan (manba noma'lum)" */
const DIRECT_KEYS = new Set(['direct', '(direct)', '']);

export function TabSources({ period, mob, view: viewParam, set, show30 }: {
  period: Period; mob: boolean; view: string; set: (p: { view?: string }) => void; show30: () => void;
}) {
  const view = !mob && viewParam === 'campaign' ? 'campaign' : 'source';
  const query = period.query ? { ...period.query, view } : null;
  const { q, first, pages, more, dim } = usePaged<AnSourcesRes>('sources', adminApi.anSources, query, mob);
  if (q.isError && !first) return <QueryError q={q} />;
  const ts = first ? trackState(first.trackingSince, period) : 'ok';
  if (ts === 'none') return <><NotTracked /><AnalyticsFooter kind="tracker" botFiltered={first?.botFiltered} /></>;
  const rows = ts === 'before' ? [] : pages.flatMap((p) => p.rows);
  const controls = !mob && (
    <Segmented small label={T.src.title} value={view} onChange={(v) => set({ view: v === 'source' ? '' : v })}
      options={[{ value: 'source', label: T.src.sites }, { value: 'campaign', label: T.src.campaigns }]} />
  );
  const empty = { title: view === 'campaign' ? T.src.noUtm : T.ov.empty, action: shorterThan(period, 30) ? { label: T.state.show30, onClick: show30 } : undefined };
  const skeleton = <TableWrap><Table><tbody><SkeletonRows cols={mob ? 3 : 6} n={5} /></tbody></Table></TableWrap>;
  return (
    <Dim on={dim}>
      {ts === 'before' && first?.trackingSince && <BeforeTracking since={first.trackingSince} />}
      <Card title={T.src.title} right={controls}>
        {!first ? skeleton : view === 'source' ? (
          <TopTable<AnSourceRow> mob={mob} rows={rows as AnSourceRow[]} rowKey={(r) => r.key} minWidth={680} more={more} empty={empty} bar={(r) => r.people}
            name={{
              label: T.col.source,
              render: (r) => ({ title: DIRECT_KEYS.has(r.key) || r.label === T.src.direct ? <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>{r.label}<InfoPop text={T.src.directHint} /></span> : r.label }),
            }}
            cols={[
              { key: 'visits', label: T.col.visits, num: true, render: (r) => cnt(r.visits) },
              { key: 'people', label: T.col.people, num: true, render: (r) => cnt(r.people) },
              ...(mob ? [] : [
                { key: 'single', label: T.col.single, num: true, render: (r: AnSourceRow) => { const v = ratioView(r.singlePage.num, r.singlePage.den); return v.pct ?? v.frac; } },
                { key: 'pricing', label: T.col.pricing, num: true, render: (r: AnSourceRow) => cnt(r.pricingPeople) },
              ]),
            ]} />
        ) : (
          <TopTable<AnCampaignRow> mob={mob} rows={rows as AnCampaignRow[]} rowKey={(r, i) => `${r.campaign}|${r.source}|${r.medium}|${i}`} minWidth={760} more={more} empty={empty} bar={(r) => r.people}
            name={{ label: T.col.campaign, render: (r) => ({ title: r.campaign, hint: r.content ? T.src.contentTitle(r.content) : undefined }) }}
            cols={[
              { key: 'source', label: T.col.source, render: (r) => r.source ?? '—' },
              { key: 'medium', label: T.col.channel, render: (r) => r.medium ?? '—' },
              { key: 'visits', label: T.col.visits, num: true, render: (r) => cnt(r.visits) },
              { key: 'people', label: T.col.people, num: true, render: (r) => cnt(r.people) },
              { key: 'time', label: T.col.visitTime, num: true, render: (r) => (r.medianVisitTimeSec === null ? <span title={r.medianReason ? reasonTitle(r.medianReason, first?.trackingSince) : nullTitle(period)}>—</span> : duration(r.medianVisitTimeSec)) },
            ]} />
        )}
        {mob && <DesktopOnly>{T.src.mobile}</DesktopOnly>}
      </Card>
      {!mob && <p style={{ ...mutedText, margin: 0 }}>{T.src.builderNote}</p>}
      <AnalyticsFooter kind="tracker" botFiltered={first?.botFiltered} />
    </Dim>
  );
}
