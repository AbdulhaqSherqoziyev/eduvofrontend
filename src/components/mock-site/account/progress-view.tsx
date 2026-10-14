'use client';
/**
 * /progress — Mobile App.dc.html `progress` (section pills, latest + change, bar chart, history,
 * recommendations card); desktop per README §9 spec: line chart, history table, weak types,
 * recommendations. D2 GET /mock/progress?exam=.
 */
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { getProgress, type ProgressResp } from '@/lib/mock/api/endpoints';
import type { OpenExamSlug, Recommendation, SeriesKey } from '@/lib/mock/api/types';
import { fmtDate, fmtMonthShort, fmtScore } from '@/lib/mock/format';
import { useDelayedFlag } from '@/lib/mock/hooks/use-delayed';
import { useLang } from '@/lib/mock/hooks/use-lang';
import { useLearner } from '@/lib/mock/hooks/use-learner';
import { sx } from '@/lib/mock/sx';
import { BarChart, LineChart } from '../charts';
import { Segmented } from '../segmented';

const SEC: Record<string, string> = { listening: 'Listening', reading: 'Reading', writing: 'Writing', reading_writing: 'Reading and Writing', math: 'Math' };

export function ProgressView() {
  const t = useTranslations('account.progress');
  const td = useTranslations('dashboard');
  const tq = useTranslations('qtypes');
  const { lang, href } = useLang();
  const learner = useLearner();
  const [exam, setExam] = useState<OpenExamSlug>('ielts');
  const [sec, setSec] = useState<SeriesKey>('overall');
  const [data, setData] = useState<ProgressResp | null>(null);
  const [err, setErr] = useState(false);
  const [reload, setReload] = useState(0);
  useEffect(() => { if (learner?.goal?.exam) setExam(learner.goal.exam); }, [learner?.goal?.exam]);
  useEffect(() => {
    if (!learner) return;
    const ac = new AbortController();
    setData(null); setErr(false); setSec('overall');
    getProgress(exam, ac.signal).then(setData).catch((e: unknown) => { if ((e as Error)?.name !== 'AbortError') setErr(true); });
    return () => ac.abort();
  }, [learner, exam, reload]);
  const slow = useDelayedFlag(!data && !err);

  const keys: SeriesKey[] = exam === 'sat' ? ['overall', 'reading_writing', 'math'] : ['overall', 'listening', 'reading', 'writing'];
  const pts = (data?.series.series[sec] ?? []).map((p) => ({ at: p.at, value: p.value }));
  const last = pts[pts.length - 1]; const first = pts[0];
  const delta = last && first && pts.length > 1 ? last.value - first.value : null;
  const typeLabel = (k: string) => (tq.has(`types.${k}`) ? tq(`types.${k}`) : k.replace(/_/g, ' '));
  const recText = (r: Recommendation) => {
    const p: Record<string, string | number> = { ...r.params };
    if (typeof p.type === 'string') p.type = typeLabel(p.type);
    if (typeof p.section === 'string') p.section = SEC[p.section] ?? p.section;
    return tq.has(`rec.${r.code}`) ? tq(`rec.${r.code}`, p) : tq('rec.generic');
  };
  const histName = (h: ProgressResp['history'][number]) => `${h.mode === 'full' ? td('full') : td('section', { section: SEC[h.sectionKey ?? 'reading'] })} · `;
  const histScore = (h: ProgressResp['history'][number]) => fmtScore(h.overall ?? (h.sectionKey ? h.sections[h.sectionKey] ?? null : null), exam);

  const examSeg = (
    <Segmented label={t('title')} value={exam} onChange={setExam} items={[{ key: 'ielts', label: t('examTab.ielts') }, { key: 'sat', label: t('examTab.sat') }]} btnStyle={sx('font-weight:800')} />
  );
  const errBox = err && <div className="m-banner m-banner--err" role="alert" style={sx('align-items:center')}><span style={sx('flex:1')}>{td('loadError')}</span><button type="button" className="m-btn m-btn--soft m-btn--sm" onClick={() => setReload((n) => n + 1)}>{td('retry')}</button></div>;
  const empty = data && !pts.length;

  return (
    <>
      <main className="m-desk" style={sx('max-width:1200px;margin:0 auto;padding:clamp(20px,4vw,40px) 20px 56px;display:flex;flex-direction:column;gap:24px')}>
        <div style={sx('display:flex;justify-content:space-between;align-items:end;gap:16px;flex-wrap:wrap')}>
          <h1 className="m-h1" style={sx('font-size:clamp(26px,3.2vw,36px);letter-spacing:var(--ls-h)')}>{t('title')}</h1>
          {examSeg}
        </div>
        {errBox}
        {!data && slow && <div className="m-card" style={sx('height:320px')} />}
        {data && (
          <>
            <div className="m-card" style={sx('padding:24px;display:flex;flex-direction:column;gap:16px')}>
              <div style={sx('display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap')}>
                <span style={sx('display:flex;align-items:baseline;gap:12px')}>
                  <span style={sx('font-size:40px;font-weight:800;letter-spacing:var(--ls-score)')}><bdi dir="ltr">{last ? fmtScore(last.value, exam) : '—'}</bdi></span>
                  {delta != null && <span style={{ ...sx('font-size:13px;font-weight:800'), color: delta >= 0 ? 'var(--ok)' : 'var(--warn)' }}><bdi dir="ltr">{t('since', { delta: `${delta >= 0 ? '+' : ''}${fmtScore(delta, exam)}`, month: fmtMonthShort(lang, first.at) })}</bdi></span>}
                </span>
                <Segmented label={t('title')} value={sec} onChange={setSec} style={sx('padding:4px;border-radius:12px')} btnStyle={sx('height:34px;padding:0 12px;border-radius:9px;font-size:12px')} items={keys.map((k) => ({ key: k, label: td(`tab.${k}`) }))} />
              </div>
              {empty ? <span style={sx('font-size:14px;color:var(--ink2)')}>{t('empty')}</span> : <LineChart pts={pts} target={data.series.target} exam={exam} lang={lang} />}
              {data.series.target != null && <span style={sx('display:flex;align-items:center;gap:6px;font-size:12px;font-weight:800;color:var(--ok)')}><span style={sx('width:16px;border-top:2px dashed var(--ok)')} />{td('targetLegend', { v: fmtScore(data.series.target, exam) })}</span>}
            </div>
            <div style={sx('display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,420px),1fr));gap:24px;align-items:start')}>
              <div className="m-card" style={sx('padding:24px;display:flex;flex-direction:column;gap:12px;overflow:auto')}>
                <span style={sx('font-weight:800;font-size:18px')}>{t('history')}</span>
                <table className="m-table">
                  <thead><tr><th>{t('colDate')}</th><th>{t('colMock')}</th><th style={sx('text-align:end')}>{t('colScore')}</th></tr></thead>
                  <tbody>
                    {data.history.map((h) => (
                      <tr key={h.attemptId}><td style={sx('font-weight:400;color:var(--ink)')}>{fmtDate(lang, h.at)}</td><td><Link href={href(`/results/${h.attemptId}`)} style={sx('color:var(--ink)')}>{histName(h)}<bdi dir="ltr">{h.testCode}</bdi></Link></td><td style={sx('text-align:end;font-weight:800;color:var(--ink)')}><bdi dir="ltr">{histScore(h)}</bdi></td></tr>
                    ))}
                  </tbody>
                </table>
                {!data.history.length && <span style={sx('font-size:14px;color:var(--ink2)')}>{t('empty')}</span>}
              </div>
              <div style={sx('display:flex;flex-direction:column;gap:24px')}>
                <div className="m-card" style={sx('padding:24px;display:flex;flex-direction:column;gap:14px')}>
                  <span style={sx('font-weight:800;font-size:18px')}>{t('weak')}</span>
                  {data.weakestTypes.length ? data.weakestTypes.map((a) => (
                    <div key={a.type} style={sx('display:grid;grid-template-columns:minmax(0,1fr) auto;gap:6px 12px;align-items:center')}>
                      <span style={sx('font-size:14px;font-weight:600;color:var(--ink2)')}>{typeLabel(a.type)}</span><span style={sx('font-size:13px;font-weight:800')}><bdi dir="ltr">{a.pct}%</bdi></span>
                      <div className="m-bar" style={sx('grid-column:1 / -1')}><span className="is-low" style={{ width: `${a.pct}%` }} /></div>
                    </div>
                  )) : <span style={sx('font-size:14px;color:var(--ink2)')}>{td('weakEmpty')}</span>}
                </div>
                {data.recommendations.length > 0 && (
                  <div style={sx('border-radius:20px;background:var(--aiBg);padding:18px;display:flex;flex-direction:column;gap:8px')}>
                    <b style={sx('font-size:14px;color:var(--ai)')}>{t('rec')}</b>
                    {data.recommendations.map((r, i) => <span key={i} style={sx('font-size:14px;line-height:1.55')}>{recText(r)}</span>)}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </main>

      <main className="m-phone m-with-tabs-phone" style={sx('padding:4px 16px 24px;display:flex;flex-direction:column;gap:18px')}>
        <div style={sx('display:flex;justify-content:space-between;align-items:center;gap:8px')}><h1 style={sx('margin:0;font-size:30px;font-weight:800;letter-spacing:var(--ls-h)')}>{t('title')}</h1>{examSeg}</div>
        {errBox}
        <div className="m-carousel" style={sx('gap:6px;padding:4px 16px')}>
          {keys.map((k) => (
            <button key={k} type="button" onClick={() => setSec(k)} style={{ ...sx('flex:none;height:38px;padding:0 16px;border-radius:999px;border:0;cursor:pointer;font-weight:800;font-size:13px'), background: sec === k ? 'var(--ink)' : 'var(--bg)', color: sec === k ? 'var(--bg)' : 'var(--ink2)', boxShadow: sec === k ? 'none' : 'var(--raise-sm)' }}>{td(`tab.${k}`)}</button>
          ))}
        </div>
        {!data && slow && <div className="m-card" style={sx('height:220px')} />}
        {data && (
          <>
            <div className="m-card" style={sx('padding:18px;display:flex;flex-direction:column;gap:12px')}>
              <div style={sx('display:flex;align-items:baseline;gap:10px')}>
                <span style={sx('font-size:40px;font-weight:800;letter-spacing:var(--ls-score)')}><bdi dir="ltr">{last ? fmtScore(last.value, exam) : '—'}</bdi></span>
                {delta != null && <span style={{ ...sx('font-size:13px;font-weight:800'), color: delta >= 0 ? 'var(--ok)' : 'var(--warn)' }}><bdi dir="ltr">{t('since', { delta: `${delta >= 0 ? '+' : ''}${fmtScore(delta, exam)}`, month: fmtMonthShort(lang, first.at) })}</bdi></span>}
              </div>
              {empty ? <span style={sx('font-size:14px;color:var(--ink2)')}>{t('empty')}</span> : <BarChart pts={pts.slice(-5)} target={data.series.target} exam={exam} lang={lang} height={150} />}
            </div>
            <b style={sx('font-size:16px')}>{t('history')}</b>
            <div className="m-rows">
              {data.history.map((h) => (
                <Link key={h.attemptId} href={href(`/results/${h.attemptId}`)} style={sx('padding:14px 16px;display:flex;align-items:center;gap:12px;color:var(--ink)')}>
                  <span style={sx('flex:1;display:flex;flex-direction:column;gap:2px')}><b style={sx('font-size:14px')}>{histName(h)}<bdi dir="ltr">{h.testCode}</bdi></b><span style={sx('font-size:12px;color:var(--mut);font-weight:600')}>{fmtDate(lang, h.at)}</span></span>
                  <b style={sx('font-size:16px')}><bdi dir="ltr">{histScore(h)}</bdi></b>
                </Link>
              ))}
              {!data.history.length && <span style={sx('display:block;padding:14px 16px;font-size:14px;color:var(--ink2)')}>{t('empty')}</span>}
            </div>
            {data.recommendations.length > 0 && (
              <div style={sx('border-radius:20px;background:var(--aiBg);padding:18px;display:flex;flex-direction:column;gap:8px')}>
                <b style={sx('font-size:14px;color:var(--ai)')}>{t('rec')}</b>
                {data.recommendations.map((r, i) => <span key={i} style={sx('font-size:14px;line-height:1.55')}>{recText(r)}</span>)}
              </div>
            )}
          </>
        )}
      </main>
    </>
  );
}
