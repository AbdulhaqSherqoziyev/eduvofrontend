'use client';
/**
 * §4 "Hozir": 4 live numbers (never summed), home pages, today's mini funnel + stop card, right-now
 * lists, recent activity (no city / auth / exam / ids), tracker status. Polls every 30 s while the
 * page is visible (React Query pauses hidden tabs and refetches on return); no animation.
 */
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/admin-mock/api';
import { ago, cnt, examLabel, groupNum, hms, timeOnly } from '@/lib/admin-mock/format';
import type { AnLiveRes, AnRecent, AnSite } from '@/lib/admin-mock/types';
import { Skeleton } from '../../ui/table';
import { useNow } from '../hooks';
import { Card, eyebrow, InfoPop, Note, NotTracked, Pill, QueryError } from './blocks';
import { AnalyticsFooter } from './footer';
import { LiveCard } from './live-card';
import { Steps } from './steps';
import { StopCard } from './stop-card';
import { T } from './texts';

export const LIVE_KEY = ['am', 'an', 'live'] as const;
export const SITE_NAME: Record<AnSite, string> = { mock: 'mock.eduvo.uz', landing: 'eduvo.uz' };
const SITE_SHORT: Record<AnSite, string> = { mock: 'mock', landing: 'eduvo.uz' };
const STALE_MS = 2 * 60_000;

export function useLive(enabled = true) {
  return useQuery({
    queryKey: LIVE_KEY,
    queryFn: adminApi.anLive,
    enabled,
    refetchInterval: 30_000,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
    placeholderData: (p) => p,
  });
}

export function TabNow({ mob }: { mob: boolean }) {
  const q = useLive();
  const now = useNow(5000);
  if (q.isError && !q.data) return <QueryError q={q} />;
  if (!q.data) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: mob ? 16 : 20 }} aria-busy="true">
        <div className="ma-an-live4">{[0, 1, 2, 3].map((i) => <Skeleton key={i} height={120} radius={20} />)}</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: mob ? 12 : 20 }}><Skeleton height={96} radius={20} /><Skeleton height={96} radius={20} /></div>
        <Skeleton height={260} />
        <Skeleton height={220} />
      </div>
    );
  }
  const d = q.data;
  const shown = hms(d.serverNow ?? d.updatedAt);
  const stale = now - q.dataUpdatedAt > STALE_MS;
  const nobody = d.site.guests + d.site.learners === 0;
  const tracked = d.trackingSince !== null;
  const gap = mob ? 16 : 20;

  const updated = stale ? (
    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--warn)', display: 'inline-flex', gap: 6, alignItems: 'center' }}>
      <b aria-hidden="true" style={{ width: 16, height: 16, borderRadius: 999, background: 'var(--warnBg)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 11 }}>!</b>
      {T.now.stale(shown)}
    </span>
  ) : <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--mut)' }}>{T.now.updated(shown)}</span>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div className="ma-an-live4">
          <LiveCard mob={mob} label={T.now.guests} value={d.site.guests} foot={T.now.last5} def={T.now.defGuests} />
          <LiveCard mob={mob} label={T.now.learners} value={d.site.learners} foot={T.now.last5} def={T.now.defLearners} />
          <LiveCard mob={mob} label={T.now.inExam} value={d.exam.active} foot={T.now.last5} def={T.now.defInExam} />
          <LiveCard mob={mob} label={T.now.paidToday} value={d.paidToday} foot={T.now.sinceMidnight} def={T.now.defPaidToday} />
        </div>
        {nobody && (
          <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: 'var(--ink2)', display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
            <span>{T.now.empty}{d.usualThisHour !== null && <> · {T.now.usual(groupNum(d.usualThisHour))}</>}</span>
            {d.usualThisHour !== null && <InfoPop text={T.now.usualDef} />}
          </p>
        )}
        <div style={{ display: 'flex', gap: mob ? 4 : 12, flexWrap: 'wrap', flexDirection: mob ? 'column' : 'row', fontSize: 12, fontWeight: 600, color: 'var(--mut)' }}>
          <span>{T.now.note}</span>
          {!mob && <span aria-hidden="true">·</span>}
          {updated}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <span style={eyebrow}>{T.now.homes}</span>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: mob ? 12 : 20 }}>
          <LiveCard small mob={mob} label={T.now.eduvo} value={d.landing.eduvo} foot={T.now.eduvoFoot} def={T.now.defEduvo} />
          <LiveCard small mob={mob} label={T.now.mockHome} value={d.landing.mockHome} foot={T.now.mockHomeFoot} def={T.now.defMockHome} />
        </div>
      </div>

      <div className="ma-an-g21">
        <Card title={T.now.funnelTitle} right={<Pill>{T.now.funnelRange}</Pill>}>
          <Steps steps={[
            { key: 'people', label: T.funnel.visited, value: d.funnelToday.people, source: T.funnel.byVisits, dashTitle: T.state.notTrackedTitle },
            { key: 'signups', label: T.funnel.signedUp, value: d.funnelToday.signups, source: T.funnel.byDb, overflowTitle: T.funnel.overflow, dashTitle: T.state.loadErr },
            { key: 'payers', label: T.funnel.cohortPaid, value: d.funnelToday.cohortPayers, source: `${T.funnel.byDb} · ${T.funnel.todayCohort}`, overflowTitle: T.funnel.overflow, dashTitle: T.state.loadErr },
          ]} />
          <Note>{T.funnel.note}</Note>
        </Card>
        <StopCard transitions={[
          { from: T.funnel.visited, to: T.funnel.signedUp, num: d.funnelToday.signups, den: d.funnelToday.people },
          { from: T.funnel.signedUp, to: T.funnel.cohortPaid, num: d.funnelToday.cohortPayers, den: d.funnelToday.signups },
        ]} />
      </div>

      {tracked ? (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,280px),1fr))', gap }}>
            <ListCard title={T.now.pages} empty={nobody || !d.pages.length ? T.now.listsEmpty : null}
              rows={d.pages.slice(0, 5).map((p) => ({ k: `${p.site}${p.path}`, l: `${SITE_SHORT[p.site]} · ${p.label ?? p.path}`, n: cnt(p.n) }))} />
            <ListCard title={T.now.sources} empty={nobody || !d.sources.length ? T.now.listsEmpty : null}
              rows={d.sources.slice(0, 5).map((s) => ({ k: s.key, l: s.label, n: cnt(s.n) }))} />
            <ListCard title={T.now.exams} empty={d.exam.dbError || d.exam.active === null ? T.state.loadErr : d.exam.active === 0 ? T.now.examsEmpty : null}
              rows={d.exam.byExam.map((e) => ({ k: e.exam, l: e.label || examLabel(e.exam), n: groupNum(e.n) }))} />
          </div>
          {d.recent.length > 0 && <Recent rows={mob ? d.recent.slice(0, 10) : d.recent} mob={mob} />}
        </>
      ) : <NotTracked />}

      <TrackerStatus d={d} now={now} />
      <AnalyticsFooter kind="now" />
    </div>
  );
}

function ListCard({ title, rows, empty }: { title: string; rows: Array<{ k: string; l: string; n: string }>; empty: string | null }) {
  return (
    <Card title={title} gap={6}>
      {empty ? <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--mut)', padding: '8px 0' }}>{empty}</span> : (
        <div>
          {rows.map((r) => (
            <div key={r.k} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '8px 0', borderBottom: '1px solid var(--line)', fontSize: 13 }}>
              <span style={{ fontWeight: 600, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.l}</span>
              <b style={{ fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>{r.n}</b>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function Recent({ rows, mob }: { rows: AnLiveRes['recent']; mob: boolean }) {
  return (
    <Card title={T.now.recent} gap={6}>
      <div>
        {rows.map((r, i) => {
          const what = `${SITE_NAME[r.site]} · ${r.event ? T.event[r.event] ?? r.label ?? r.path : r.label ?? r.path}`;
          const meta = [r.deviceLabel, r.browserLabel, r.countryLabel, sourceText(r)].filter(Boolean).join(' · ');
          return (
            <div key={`${r.at}-${i}`} style={{ display: 'flex', flexDirection: mob ? 'column' : 'row', gap: mob ? 2 : 14, padding: '9px 0', borderBottom: '1px solid var(--line)', fontSize: 13 }}>
              <span style={{ display: 'flex', gap: 10, minWidth: 0, flex: mob ? undefined : '1 1 0' }}>
                <span style={{ fontWeight: 700, color: 'var(--mut)', fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>{timeOnly(r.at)}</span>
                <span style={{ fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{what}</span>
              </span>
              <span style={{ color: mob ? 'var(--mut)' : 'var(--ink2)', fontWeight: 600, fontSize: mob ? 12 : 13, paddingLeft: mob ? 50 : 0, textAlign: mob ? 'left' : 'right', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: mob ? 'normal' : 'nowrap' }}>{meta}</span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

/** §4.6: "Telegram'dan", "UTM: kuz-aksiya orqali", "To'g'ridan (manba noma'lum)" */
function sourceText(r: AnRecent) {
  const l = r.sourceLabel;
  if (!l) return '';
  if (l === T.src.direct) return l;
  if (l.startsWith('UTM: ')) return T.src.utm(l.slice(5));
  return T.src.from(l);
}

function TrackerStatus({ d, now }: { d: AnLiveRes; now: number }) {
  if (!d.tracker.length) return null;
  return (
    <div style={{ display: 'flex', gap: '6px 20px', flexWrap: 'wrap', fontSize: 12, fontWeight: 600, color: 'var(--mut)' }}>
      {d.tracker.map((t) => {
        const name = SITE_NAME[t.site] ?? t.site;
        if (!t.lastEventAt) return <span key={t.site}>{T.now.neverTracked(name)}</span>;
        if (t.silent) {
          const h = t.silentHours ?? Math.floor((now - Date.parse(t.lastEventAt)) / 3_600_000);
          return <span key={t.site} className="ma-chip t-warn" title={T.now.silentHint}>{T.now.silent(name, h)}</span>;
        }
        return <span key={t.site}>{T.now.lastEvent(name, ago(t.lastEventAt, now))}</span>;
      })}
    </div>
  );
}
