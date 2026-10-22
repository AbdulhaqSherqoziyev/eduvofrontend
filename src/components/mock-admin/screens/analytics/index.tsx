'use client';
/**
 * admin-mock "Analitika" (.claude/specs/mock-admin/analytics-design.md v1.0 + §18): 8 tabs in one
 * screen, state in the URL (`tab`, `range`, `from`, `to` + tab filters). Switching tabs resets the period
 * to that tab's default, except an "Oraliq" (A–B) range, which is kept across tabs (§1.2).
 * No primary button, no export, no dialogs (§2.2, T8).
 */
import { useCallback, useEffect, useRef } from 'react';
import { Tabs } from '../../ui/filters';
import { useIsMobile, useUrlState } from '../hooks';
import { makePeriod, asTab, TAB_KEYS, TAB_PERIODS, type RangeOpt, type TabKey } from './period';
import { PeriodBar } from './period-bar';
import { TabExams, ExamFilters, useExams } from './tab-exams';
import { TabGeo } from './tab-geo';
import { asMetric, MetricSwitch, TabHours } from './tab-hours';
import { TabNow } from './tab-now';
import { TabOverview } from './tab-overview';
import { TabPages } from './tab-pages';
import { TabPay } from './tab-pay';
import { TabSources } from './tab-sources';
import { T } from './texts';

const DEFAULTS = { tab: 'now', range: '', from: '', to: '', view: '', lang: '', metric: 'visits', day: '', exam: '', type: 'full', pay: 'all' };

export function AnalyticsScreen() {
  const mob = useIsMobile();
  const [s, set] = useUrlState(DEFAULTS);
  const tab = asTab(s.tab);
  const period = makePeriod(tab, s.range, s.from, s.to);
  const tabsRef = useRef<HTMLDivElement>(null);

  const pickTab = (t: TabKey) => {
    if (t === tab) return;
    const keep = period.range === 'custom' && TAB_PERIODS[t] !== null;
    set({ tab: t, range: keep ? 'custom' : '', from: keep ? period.from : '', to: keep ? period.to : '', view: '', lang: '' });
  };
  /** "Hammasi →" from Umumiy: same period on the target tab */
  const go = (t: TabKey) => set({ tab: t, range: period.range === '7d' ? '' : period.range, view: '', lang: '' });
  const onRange = (r: RangeOpt) => set({ range: r, from: '', to: '' });
  const onCustom = useCallback((from: string, to: string) => set({ range: 'custom', from, to }), [set]);
  const showDays = (r: RangeOpt) => () => set({ range: r, from: '', to: '' });

  // phones: keep the active tab visible in the scrolling strip (§13)
  useEffect(() => {
    if (!mob) return;
    tabsRef.current?.querySelector<HTMLElement>('[aria-selected="true"]')?.scrollIntoView({ inline: 'nearest', block: 'nearest' });
  }, [tab, mob]);

  const metric = asMetric(s.metric);
  const examsQ = useExams(period, s.exam, s.type, s.pay, mob, tab === 'exams');

  let filters: React.ReactNode = null;
  if (tab === 'hours') filters = <MetricSwitch metric={metric} mob={mob} onChange={(m) => set({ metric: m })} />;
  if (tab === 'exams') filters = <ExamFilters data={examsQ.data} exam={s.exam} type={s.type} pay={s.pay} mob={mob} set={set} />;

  let body: React.ReactNode;
  switch (tab) {
    case 'now': body = <TabNow mob={mob} />; break;
    case 'overview': body = <TabOverview period={period} mob={mob} go={go} />; break;
    case 'pages': body = <TabPages period={period} mob={mob} view={s.view} lang={s.lang} set={set} show30={showDays('30d')} />; break;
    case 'sources': body = <TabSources period={period} mob={mob} view={s.view} set={set} show30={showDays('30d')} />; break;
    case 'geo': body = <TabGeo period={period} mob={mob} show30={showDays('30d')} />; break;
    case 'hours': body = <TabHours period={period} mob={mob} metric={metric} day={s.day} setDay={(d) => set({ day: d })} />; break;
    case 'exams': body = <TabExams q={examsQ} period={period} mob={mob} type={s.type} setExam={(e) => set({ exam: e })} show90={showDays('90d')} />; break;
    case 'pay': body = <TabPay period={period} mob={mob} />; break;
  }

  return (
    <div className="ma-an" style={{ display: 'flex', flexDirection: 'column', gap: mob ? 16 : 20, minWidth: 0 }}>
      <div ref={tabsRef} style={{ minWidth: 0, display: 'flex' }}>
        <Tabs label={T.tabsLabel} value={tab} onPick={pickTab} tabs={TAB_KEYS.map((k) => ({ value: k, label: T.tab[k] }))} />
      </div>
      {TAB_PERIODS[tab] && <PeriodBar tab={tab} period={period} onRange={onRange} onCustom={onCustom} mob={mob}>{filters}</PeriodBar>}
      <div role="tabpanel" aria-label={T.tab[tab]} style={{ minWidth: 0 }}>{body}</div>
    </div>
  );
}
