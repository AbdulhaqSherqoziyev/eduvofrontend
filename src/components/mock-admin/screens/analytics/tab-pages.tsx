'use client';
/** §6 "Sahifalar": all / entry / exit views, language filter; phones: views=all, 3 columns, top-5. */
import { adminApi } from '@/lib/admin-mock/api';
import { cnt, duration, ratioView } from '@/lib/admin-mock/format';
import type { AnPageRow, AnPagesRes, Ratio } from '@/lib/admin-mock/types';
import { LOCALE_NAMES, isLocale } from '@/i18n/locales';
import { Segmented } from '../../ui/controls';
import { FilterOptions, FilterPill } from '../../ui/filters';
import { SkeletonRows, Table, TableWrap } from '../../ui/table';
import { BeforeTracking, Card, DesktopOnly, Dim, mutedText, NotTracked, QueryError, reasonTitle } from './blocks';
import { AnalyticsFooter } from './footer';
import { usePaged } from './paged';
import { nullTitle, shorterThan, trackState, type Period } from './period';
import { T } from './texts';
import { TopTable, type Col } from './top-table';

export type PagesView = 'all' | 'entry' | 'exit';
const asView = (v: string): PagesView => (v === 'entry' || v === 'exit' ? v : 'all');

const ratio = (r: Ratio | null | undefined) => {
  if (!r) return '—';
  const v = ratioView(r.num, r.den);
  return v.pct ?? v.frac;
};

export function TabPages({ period, mob, view: viewParam, lang, set, show30 }: {
  period: Period; mob: boolean; view: string; lang: string;
  set: (p: { view?: string; lang?: string }) => void; show30: () => void;
}) {
  const view = mob ? 'all' : asView(viewParam);
  const query = period.query ? { ...period.query, view, lang: lang || undefined } : null;
  const { q, first, pages, more, dim, hasMore } = usePaged<AnPagesRes>('pages', adminApi.anPages, query, mob);
  if (q.isError && !first) return <QueryError q={q} />;
  const rows = pages.flatMap((p) => p.rows);
  const ts = first ? trackState(first.trackingSince, period) : 'ok';
  if (ts === 'none') return <><NotTracked /><AnalyticsFooter kind="tracker" botFiltered={first?.botFiltered} /></>;
  const time = (v: number | null | undefined, reason?: string) => (v === null || v === undefined ? <span title={reason ? reasonTitle(reason, first?.trackingSince) : nullTitle(period)}>—</span> : duration(v));
  const COLS: Record<PagesView, Col<AnPageRow>[]> = {
    all: [
      { key: 'views', label: T.col.views, num: true, render: (r) => cnt(r.views) },
      { key: 'people', label: T.col.people, num: true, render: (r) => cnt(r.people) },
      { key: 'time', label: T.col.pageTime, num: true, render: (r) => time(r.medianPageTimeSec, r.medianReason) },
      { key: 'entries', label: T.col.entries, num: true, render: (r) => cnt(r.entries) },
      { key: 'exits', label: T.col.exits, num: true, render: (r) => cnt(r.exits) },
    ],
    entry: [
      { key: 'entries', label: T.col.entries, num: true, render: (r) => cnt(r.entries) },
      { key: 'single', label: T.col.single, num: true, render: (r) => ratio(r.singlePage) },
      { key: 'vtime', label: T.col.visitTime, num: true, render: (r) => time(r.medianVisitTimeSec, r.medianReason) },
    ],
    exit: [
      { key: 'exits', label: T.col.exits, num: true, render: (r) => cnt(r.exits) },
      { key: 'rate', label: T.col.exitRate, num: true, render: (r) => ratio(r.exitRate) },
    ],
  };
  const cols = mob ? COLS.all.slice(0, 2) : COLS[view];
  const langs = first?.languages ?? [];
  const langName = (k: string) => (isLocale(k) ? LOCALE_NAMES[k] : k);
  const controls = !mob && (
    <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
      <Segmented small label={T.pages.title} value={view} onChange={(v) => set({ view: v === 'all' ? '' : v })}
        options={[{ value: 'all', label: T.pages.all }, { value: 'entry', label: T.pages.entry }, { value: 'exit', label: T.pages.exit }]} />
      <FilterPill label={T.pages.lang} value={lang ? langName(lang) : T.pages.allLangs} active={!!lang} align="right">
        {(close) => (
          <FilterOptions value={lang || 'all'} onPick={(v) => { set({ lang: v === 'all' ? '' : v }); close(); }}
            options={[{ value: 'all', label: T.pages.allLangs }, ...langs.map((l) => ({ value: l, label: langName(l) }))]} />
        )}
      </FilterPill>
    </div>
  );
  return (
    <Dim on={dim}>
      {ts === 'before' && first?.trackingSince && <BeforeTracking since={first.trackingSince} />}
      <Card title={T.pages.title} right={controls}>
        {!first ? (
          <TableWrap><Table><tbody><SkeletonRows cols={mob ? 3 : cols.length + 1} n={5} /></tbody></Table></TableWrap>
        ) : (
          <TopTable mob={mob} rows={ts === 'before' ? [] : rows} rowKey={(r) => r.path} minWidth={760} more={more} bar={(r) => (view === 'all' ? r.people : view === 'entry' ? r.entries : r.exits)}
            other={hasMore ? null : pages[pages.length - 1]?.other}
            name={{ label: T.col.page, render: (r) => ({ title: r.label ?? r.path, sub: r.label ? r.path : undefined }) }}
            cols={cols}
            empty={{ title: T.pages.empty, action: shorterThan(period, 30) ? { label: T.state.show30, onClick: show30 } : undefined }} />
        )}
        {mob && <DesktopOnly>{T.pages.mobile}</DesktopOnly>}
      </Card>
      <p style={{ ...mutedText, margin: 0 }}>{T.pages.examNote}</p>
      <AnalyticsFooter kind="tracker" botFiltered={first?.botFiltered} />
    </Dim>
  );
}
