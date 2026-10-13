'use client';
/**
 * Learner dashboard — Dashboard.dc.html (≥520) and Mobile App.dc.html `home` (<520), from one
 * GET /mock/dashboard (D1). Skeleton after 300 ms, error banner with retry, empty state when
 * `isEmpty`.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { getDashboard, resendVerification } from '@/lib/mock/api/endpoints';
import type { AttemptListItem, Dashboard, ExamCredits, OpenExamSlug, SectionKey, SeriesKey } from '@/lib/mock/api/types';
import { fmtDate, fmtDateLong, fmtDayMonthLong, fmtScore } from '@/lib/mock/format';
import { useDelayedFlag } from '@/lib/mock/hooks/use-delayed';
import { useLang } from '@/lib/mock/hooks/use-lang';
import { useLearner } from '@/lib/mock/hooks/use-learner';
import { sx } from '@/lib/mock/sx';
import { BarChart, LineChart } from '../charts';
import { Segmented } from '../segmented';

const EXAM_NAME: Record<OpenExamSlug, string> = { ielts: 'IELTS', sat: 'SAT' };
const SKEL = sx('background:linear-gradient(90deg,var(--hover) 0,var(--bg) 50%,var(--hover) 100%);background-size:1200px 100%;animation:m-shimmer 1.4s infinite linear');

function partOfDay(): 'morning' | 'afternoon' | 'evening' {
  const h = new Date().getHours();
  return h < 12 ? 'morning' : h < 18 ? 'afternoon' : 'evening';
}

export function DashboardView() {
  const t = useTranslations('dashboard');
  const tq = useTranslations('qtypes');
  const tc = useTranslations('common');
  const { lang, href } = useLang();
  const learner = useLearner();
  const [data, setData] = useState<Dashboard | null>(null);
  const [err, setErr] = useState(false);
  const [sec, setSec] = useState<SeriesKey>('overall');
  const [resent, setResent] = useState(false);
  const [pod, setPod] = useState<'morning' | 'afternoon' | 'evening'>('afternoon');
  useEffect(() => setPod(partOfDay()), []);

  const load = useCallback(() => {
    setErr(false);
    const ac = new AbortController();
    getDashboard(ac.signal).then(setData).catch((e: unknown) => { if ((e as Error)?.name !== 'AbortError') setErr(true); });
    return ac;
  }, []);
  useEffect(() => { if (!learner) return; const ac = load(); return () => ac.abort(); }, [learner, load]);
  const slow = useDelayedFlag(!data && !err);

  const name = (data?.learner.displayName || learner?.displayName || learner?.email?.split('@')[0] || '').trim();
  const typeLabel = (k: string) => (tq.has(`types.${k}`) ? tq(`types.${k}`) : k.replace(/_/g, ' ').replace(/^./, (c) => c.toUpperCase()));
  const secName = (k: SectionKey | 'overall') => t(`tab.${k}`);

  const series = data?.progress;
  const seriesKeys: SeriesKey[] = series?.exam === 'sat' ? ['overall', 'reading_writing', 'math'] : ['overall', 'listening', 'reading', 'writing'];
  const pts = useMemo(() => (series?.series[sec] ?? []).slice(-8).map((p) => ({ at: p.at, value: p.value })), [series, sec]);

  /* ---------- loading / error ---------- */
  if (err) {
    return (
      <main style={sx('max-width:1200px;margin:0 auto;padding:clamp(20px,4vw,40px) 20px 56px')}>
        <div className="m-banner m-banner--err" role="alert" style={sx('align-items:center')}><span style={sx('flex:1')}>{t('loadError')}</span><button type="button" className="m-btn m-btn--soft m-btn--sm" onClick={() => load()}>{t('retry')}</button></div>
      </main>
    );
  }
  if (!data) {
    return (
      <main style={sx('max-width:1200px;margin:0 auto;padding:clamp(20px,4vw,40px) 20px 56px')} aria-busy="true">
        {slow && (
          <div style={sx('display:flex;flex-direction:column;gap:24px')}>
            <div style={{ ...sx('height:40px;width:min(360px,80%);border-radius:12px'), ...SKEL }} />
            <div style={sx('display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,280px),1fr));gap:24px')}>
              <div className="m-card" style={sx('height:180px')} /><div className="m-card" style={sx('height:180px')} /><div className="m-card" style={sx('height:180px')} />
            </div>
            <div className="m-card" style={sx('height:280px')} />
          </div>
        )}
      </main>
    );
  }

  const d = data;
  const goal = d.learner.goal;
  const greet = t(`greet.${pod}`, { name });
  const subline = d.isEmpty
    ? goal ? (goal.examDate ? t('welcomeGoal', { exam: EXAM_NAME[goal.exam], score: fmtScore(goal.targetScore, goal.exam), date: fmtDayMonthLong(lang, goal.examDate) }) : t('welcomeGoalNoDate', { exam: EXAM_NAME[goal.exam], score: fmtScore(goal.targetScore, goal.exam) })) : t('welcome')
    : d.stats.lastMockAt ? t('subline', { n: d.stats.mocksTaken, date: fmtDayMonthLong(lang, d.stats.lastMockAt) }) : t('sublineNone');

  /* ---------- next step ---------- */
  const ns = d.nextStep;
  const code = (c: string) => function Code() { return <bdi dir="ltr">{c}</bdi>; };
  const next = (() => {
    switch (ns.kind) {
      case 'resume': {
        const mins = ns.remainingSec != null ? Math.max(1, Math.round(ns.remainingSec / 60)) : null;
        const done = ns.doneSections.filter((x) => x.score != null).map((x) => t('doneItem', { section: secName(x.key), score: fmtScore(x.score, ns.exam) })).join('');
        return {
          title: mins != null ? t('resumeTitle', { section: secName(ns.sectionKey), n: mins }) : t('resumeTitleNoTime', { section: secName(ns.sectionKey) }),
          sub: t.rich('resumeSub', { exam: `${EXAM_NAME[ns.exam]}`, mode: ns.mode === 'full' ? t('full').toLowerCase() : secName(ns.sectionKey), done, code: code(ns.testCode) }),
          phoneSub: t.rich('resumePhoneSub', { exam: EXAM_NAME[ns.exam], mode: ns.mode === 'full' ? t('full').toLowerCase() : secName(ns.sectionKey), left: mins != null ? t('minutesLeft', { n: mins }) : '', code: code(ns.testCode) }),
          cta: t('resumeCta'), href: href(`/exam/${ns.attemptId}`), progress: null as number | null,
        };
      }
      case 'verify_email': return { title: t('verifyTitle'), sub: t.rich('verifySub', { email: () => <bdi dir="ltr">{learner?.email ?? ''}</bdi> }), cta: resent ? t('verifySent') : t('verifyCta'), onClick: () => { void resendVerification().finally(() => setResent(true)); } };
      case 'free_section': return { title: t('freeTitle', { exam: EXAM_NAME[ns.exams[0] ?? 'ielts'] }), sub: t('freeSub'), cta: t('freeCta'), href: href(`/start/${ns.exams[0] ?? 'ielts'}?mode=section`) };
      case 'writing_grading': return { title: t('gradingTitle'), sub: t('gradingSub'), cta: t('gradingCta'), href: href(`/results/${ns.attemptId}`) };
      case 'take_mock': return ns.hasCredit
        ? { title: t('takeTitle', { exam: EXAM_NAME[ns.exam] }), sub: t('takeSub'), cta: t('takeCta'), href: href(`/start/${ns.exam}?mode=full`) }
        : { title: t('buyTitle', { exam: EXAM_NAME[ns.exam] }), sub: t('buySub', { exam: EXAM_NAME[ns.exam] }), cta: t('buyCta'), href: href(`/pricing?exam=${ns.exam}`) };
      case 'review_result': return { title: t('reviewTitle'), sub: t.rich('reviewSub', { exam: EXAM_NAME[ns.exam], code: code('') }), cta: t('reviewCta'), href: href(`/results/${ns.attemptId}`) };
    }
  })() as { title: string; sub: React.ReactNode; phoneSub?: React.ReactNode; cta: string; href?: string; onClick?: () => void };

  /* ---------- target ---------- */
  const tg = d.target;
  const scale = (v: number, exam: OpenExamSlug) => (exam === 'sat' ? (v - 400) / 1200 : v / 9) * 100;
  const below = tg?.belowTargetSections.map((k) => secName(k)) ?? [];

  /* ---------- credits ---------- */
  const creditTiles = (d.credits as ExamCredits[]).flatMap((c) => {
    const out: Array<{ v: number | string; label: string }> = [];
    if (c.unlimitedUntil && new Date(c.unlimitedUntil) > new Date(d.serverNow)) out.push({ v: '∞', label: t('creditUnl', { exam: EXAM_NAME[c.exam], date: fmtDate(lang, c.unlimitedUntil) }) });
    if (c.fullMocks > 0) out.push({ v: c.fullMocks, label: t('creditFull', { exam: EXAM_NAME[c.exam], n: c.fullMocks }) });
    if (c.sections > 0) out.push({ v: c.sections, label: t('creditSection', { exam: EXAM_NAME[c.exam], n: c.sections }) });
    if (c.freeSectionAvailable) out.push({ v: 1, label: t('creditFree', { exam: EXAM_NAME[c.exam] }) });
    return out;
  });
  const totalCredits = d.credits.reduce((s, c) => s + c.fullMocks + c.sections, 0);

  /* ---------- mocks ---------- */
  const mockRow = (m: AttemptListItem) => {
    const nm = `${m.mode === 'full' ? t('full') : t('section', { section: secName(m.sectionKey ?? 'reading') })} · `;
    const date = fmtDate(lang, m.finishedAt ?? m.startedAt);
    const meta = m.status === 'in_progress' ? t('metaStarted', { date }) : m.status === 'grading' ? t('metaGrading', { date }) : m.status === 'expired' ? t('metaExpired', { date }) : date;
    const action = m.status === 'in_progress' ? t('resume') : m.status === 'expired' ? '' : t('openResult');
    const to = m.status === 'in_progress' ? href(`/exam/${m.attemptId}`) : href(`/results/${m.attemptId}`);
    const score = m.score?.label ?? (m.score?.value != null ? fmtScore(m.score.value, m.exam) : '—');
    return { ...m, nm, meta, action, to, score };
  };
  const mocks = d.mocks.map(mockRow);

  const weakBasis = d.weakestBasis ? t('weakBasis', { n: d.weakestBasis.attempts, exam: EXAM_NAME[d.weakestBasis.exam] }) : null;

  return (
    <>
      {/* ================= ≥520 ================= */}
      <main className="m-desk" style={sx('max-width:1200px;margin:0 auto;padding:clamp(20px,4vw,40px) 20px 56px;display:flex;flex-direction:column;gap:24px')}>
        <div style={sx('display:flex;justify-content:space-between;align-items:end;gap:16px;flex-wrap:wrap')}>
          <div style={sx('display:flex;flex-direction:column;gap:6px')}><h1 className="m-h1" style={sx('font-size:clamp(26px,3.2vw,36px);letter-spacing:var(--ls-h)')}>{greet}</h1><span style={sx('color:var(--ink2);font-size:15px')}>{subline}</span></div>
        </div>

        {d.isEmpty ? (
          <div className="m-card" style={sx('padding:clamp(24px,4vw,40px);display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,320px),1fr));gap:28px;align-items:center')}>
            <div style={sx('display:flex;flex-direction:column;gap:14px')}>
              <span className="m-pill m-pill--ok" style={sx('align-self:flex-start;padding:5px 12px')}>{tc('chips.free')}</span>
              <span style={sx('font-size:clamp(22px,2.6vw,30px);font-weight:800;letter-spacing:var(--ls-t)')}>{t('emptyTitle')}</span>
              <span style={sx('color:var(--ink2);font-size:15px;line-height:var(--lh-body)')}>{t('emptyBody')}</span>
              {ns.kind === 'verify_email' && <div className="m-banner m-banner--warn" style={sx('align-items:center')}><span style={sx('flex:1')}>{t('verifyTitle')}</span><button type="button" className="m-btn m-btn--soft m-btn--sm" onClick={next.onClick}>{next.cta}</button></div>}
              <div style={sx('display:flex;gap:10px;flex-wrap:wrap')}>
                <a className="m-btn m-btn--primary" href={href('/start/ielts?mode=section')} style={sx('height:52px;padding:0 22px')}>{t('freeIelts')}</a>
                <a className="m-btn m-btn--soft" href={href('/start/sat?mode=section')} style={sx('height:52px;padding:0 20px')}>{t('freeSat')}</a>
              </div>
            </div>
            <div style={sx('border-radius:20px;box-shadow:var(--inset);padding:24px;display:flex;flex-direction:column;gap:12px')}>
              <span style={sx('font-size:13px;font-weight:800;color:var(--mut)')}>{t('emptyChart')}</span>
              <div style={sx('height:120px;border-radius:12px;background:repeating-linear-gradient(0deg,var(--line) 0 1px,transparent 1px 30px)')} />
            </div>
          </div>
        ) : (
          <>
            <div style={sx('display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr));gap:24px')}>
              <div className="m-card" style={sx('padding:24px;display:flex;flex-direction:column;gap:12px')}>
                <span className="m-eyebrow" style={sx('color:var(--blue)')}>{t('next')}</span>
                <span style={sx('font-size:22px;font-weight:800;letter-spacing:var(--ls-t);line-height:1.25')}>{next.title}</span>
                <span style={sx('color:var(--ink2);font-size:14px;line-height:1.55')}>{next.sub}</span>
                {next.href
                  ? <a className="m-btn m-btn--primary" href={next.href} style={sx('margin-top:auto;align-self:flex-start;height:50px;padding:0 22px')}>{next.cta}</a>
                  : <button type="button" className="m-btn m-btn--primary" onClick={next.onClick} style={sx('margin-top:auto;align-self:flex-start;height:50px;padding:0 22px')}>{next.cta}</button>}
              </div>
              <div className="m-card" style={sx('padding:24px;display:flex;flex-direction:column;gap:14px')}>
                <span style={sx('font-size:13px;font-weight:700;color:var(--ink2)')}>{tg?.exam === 'sat' ? t('targetSat') : t('target')}</span>
                {tg ? (
                  <>
                    <div style={sx('display:flex;align-items:baseline;gap:12px')}>
                      <span style={sx('font-size:48px;font-weight:800;letter-spacing:var(--ls-score);line-height:1')}><bdi dir="ltr">{fmtScore(tg.current, tg.exam)}</bdi></span>
                      <span style={sx('font-size:18px;color:var(--mut);font-weight:800')}><bdi dir="ltr">→ {fmtScore(tg.target, tg.exam)}</bdi></span>
                    </div>
                    <div style={sx('height:10px;border-radius:99px;box-shadow:var(--inset);position:relative')}>
                      {tg.current != null && <div style={{ ...sx('position:absolute;inset-block:0;inset-inline-start:0;border-radius:99px;background:linear-gradient(90deg,#5B8DEF,#2E6BE6)'), width: `${Math.min(100, scale(tg.current, tg.exam))}%` }} />}
                      <div style={{ ...sx('position:absolute;top:-4px;bottom:-4px;width:3px;border-radius:2px;background:var(--ink)'), insetInlineStart: `${Math.min(100, scale(tg.target, tg.exam))}%` }} />
                    </div>
                    <span style={sx('font-size:13px;color:var(--mut);font-weight:600')}>
                      {tg.gap != null && tg.gap > 0 ? t('toGo', { gap: fmtScore(tg.gap, tg.exam) }) : tg.gap != null ? t('onTarget') : ''}
                      {below.length > 0 && ` · ${t('belowSections', { list: below.join(', '), n: below.length })}`}
                    </span>
                  </>
                ) : <a href={href('/onboarding')} style={sx('font-size:14px;font-weight:700;margin-top:auto')}>{t('setTarget')}</a>}
              </div>
              <div className="m-card" style={sx('padding:24px;display:flex;flex-direction:column;gap:10px')}>
                <span style={sx('font-size:13px;font-weight:700;color:var(--ink2)')}>{t('countdown')}</span>
                {d.countdown ? (
                  <>
                    <div style={sx('display:flex;align-items:baseline;gap:8px')}><span style={sx('font-size:48px;font-weight:800;letter-spacing:var(--ls-score);line-height:1')}><bdi dir="ltr">{d.countdown.days}</bdi></span><span style={sx('font-size:16px;color:var(--mut);font-weight:800')}>{t('days', { n: d.countdown.days })}</span></div>
                    <span style={sx('font-size:13px;color:var(--mut);font-weight:600')}>{d.countdown.exam === 'ielts' ? 'IELTS Academic' : 'Digital SAT'} · {fmtDateLong(lang, d.countdown.examDate)}</span>
                    <a href={href('/onboarding')} style={sx('font-size:13px;font-weight:700;margin-top:auto')}>{t('changeDate')}</a>
                  </>
                ) : <a href={href('/onboarding')} style={sx('font-size:14px;font-weight:700;margin-top:auto')}>{t('addDate')}</a>}
              </div>
            </div>

            <div style={sx('display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,420px),1fr));gap:24px')}>
              <div className="m-card" style={sx('padding:24px;display:flex;flex-direction:column;gap:16px;min-width:0')}>
                <div style={sx('display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap')}>
                  <span style={sx('display:flex;align-items:center;gap:12px;flex-wrap:wrap')}>
                    <span style={sx('font-weight:800;font-size:18px')}>{series?.exam === 'sat' ? t('progressSat') : t('progress')}</span>
                    {series?.target != null && <span style={sx('display:flex;align-items:center;gap:6px;font-size:12px;font-weight:800;color:var(--ok)')}><span style={sx('width:16px;border-top:2px dashed var(--ok)')} />{t('targetLegend', { v: fmtScore(series.target, series.exam) })}</span>}
                  </span>
                  <Segmented label={t('progress')} value={sec} onChange={setSec} style={sx('padding:4px;border-radius:12px')} btnStyle={sx('height:34px;padding:0 12px;border-radius:9px;font-size:12px')}
                    items={seriesKeys.map((k) => ({ key: k, label: t(`tab.${k}`) }))} />
                </div>
                {pts.length ? <LineChart pts={pts} target={series?.target ?? null} exam={series?.exam ?? 'ielts'} lang={lang} />
                  : <div style={sx('border-radius:16px;box-shadow:var(--inset);padding:24px;display:flex;flex-direction:column;gap:12px')}><span style={sx('font-size:13px;font-weight:800;color:var(--mut)')}>{t('noProgress')}</span><div style={sx('height:120px;border-radius:12px;background:repeating-linear-gradient(0deg,var(--line) 0 1px,transparent 1px 30px)')} /></div>}
                <a href={href('/progress')} style={sx('font-size:14px;font-weight:700')}>{t('openProgress')}</a>
              </div>
              <div className="m-card" style={sx('padding:24px;display:flex;flex-direction:column;gap:14px')}>
                <span style={sx('font-weight:800;font-size:18px')}>{t('weak')}</span>
                {d.weakestTypes.length ? d.weakestTypes.map((a) => (
                  <div key={a.type} style={sx('display:grid;grid-template-columns:minmax(0,1fr) auto;gap:6px 12px;align-items:center')}>
                    <span style={sx('font-size:14px;font-weight:600;color:var(--ink2)')}>{typeLabel(a.type)}</span><span style={sx('font-size:13px;font-weight:800')}><bdi dir="ltr">{a.pct}%</bdi></span>
                    <div className="m-bar" style={sx('grid-column:1 / -1')}><span className="is-low" style={{ width: `${a.pct}%` }} /></div>
                  </div>
                )) : <span style={sx('font-size:14px;color:var(--ink2);line-height:1.5')}>{t('weakEmpty')}</span>}
                {weakBasis && <span style={sx('font-size:13px;color:var(--mut);line-height:1.5')}>{weakBasis}</span>}
              </div>
            </div>

            <div style={sx('display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,420px),1fr));gap:24px;align-items:start')}>
              <div className="m-card" style={sx('padding:24px;display:flex;flex-direction:column;gap:12px;min-width:0')}>
                <span style={sx('font-weight:800;font-size:18px;margin-bottom:4px')}>{t('mocks')}</span>
                {mocks.length === 0 && <span style={sx('font-size:14px;color:var(--ink2)')}>{t('mocksEmpty')}</span>}
                {mocks.map((m) => (
                  <a key={m.attemptId} href={m.to} style={sx('display:grid;grid-template-columns:minmax(0,1fr) auto;gap:4px 16px;align-items:center;padding:14px 16px;border-radius:16px;box-shadow:var(--inset);color:var(--ink)')}>
                    <span style={sx('display:flex;gap:8px;align-items:center;min-width:0;flex-wrap:wrap')}>
                      <span style={{ ...sx('font-size:11px;font-weight:800;letter-spacing:.05em'), color: `var(--${m.exam})` }} lang="en">{EXAM_NAME[m.exam]}</span>
                      <span style={sx('font-weight:700;font-size:15px')}>{m.nm}<bdi dir="ltr">{m.testCode}</bdi></span>
                    </span>
                    <span style={sx('font-weight:800;font-size:18px;text-align:end')}><bdi dir="ltr">{m.score}</bdi></span>
                    <span style={sx('font-size:13px;color:var(--mut);font-weight:600')}>{m.meta}</span>
                    <span style={{ ...sx('font-size:13px;font-weight:800;text-align:end'), color: m.status === 'in_progress' ? 'var(--blue)' : 'var(--ink2)' }}>{m.action}</span>
                  </a>
                ))}
              </div>
              <div className="m-card" style={sx('padding:24px;display:flex;flex-direction:column;gap:14px')}>
                <span style={sx('font-weight:800;font-size:18px')}>{t('credits')}</span>
                {creditTiles.length ? (
                  <div style={sx('display:grid;grid-template-columns:1fr 1fr;gap:12px')}>
                    {creditTiles.map((c, i) => (
                      <div key={i} style={sx('padding:16px;border-radius:16px;box-shadow:var(--inset);display:flex;flex-direction:column;gap:4px')}><span style={sx('font-size:32px;font-weight:800')}><bdi dir="ltr">{c.v}</bdi></span><span style={sx('font-size:12px;color:var(--mut);font-weight:700')}>{c.label}</span></div>
                    ))}
                  </div>
                ) : <span style={sx('font-size:14px;color:var(--ink2)')}>{t('creditsNone')}</span>}
                {d.recentPurchases.length > 0 && (
                  <div style={sx('display:flex;flex-direction:column;gap:8px;font-size:13px')}>
                    {d.recentPurchases.map((p) => (
                      <div key={p.orderId} style={sx('display:flex;justify-content:space-between;gap:8px;color:var(--ink2);align-items:center')}>
                        <span>{p.title.kind === 'bundle' ? t('purchase.bundle', { n: p.title.qty }) : t(`purchase.${p.title.kind}`)}</span>
                        <span style={sx('display:flex;gap:8px;align-items:center')}>
                          {p.status === 'PENDING' && <><span className="m-pill m-pill--warn" style={sx('padding:2px 8px;font-size:11px')}>{tc('chips.pending')}</span><a href={href(`/checkout/orders/${p.orderId}`)} style={sx('font-weight:700')}>{t('open')}</a></>}
                          {p.status !== 'PENDING' && <span>{fmtDate(lang, p.paidAt)}</span>}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                <a className="m-btn m-btn--soft" href={href('/pricing')} style={sx('height:48px;font-weight:800;font-size:16px')}>{t('buyMore')}</a>
              </div>
            </div>
          </>
        )}
      </main>

      {/* ================= <520 (Mobile App `home`) ================= */}
      <main className="m-phone m-with-tabs-phone" style={sx('padding:4px 16px 24px;display:flex;flex-direction:column;gap:20px')}>
        <div style={sx('display:flex;align-items:center;gap:12px')}>
          <div style={sx('flex:1;display:flex;flex-direction:column;gap:2px;min-width:0')}><span style={sx('font-size:14px;color:var(--ink2);font-weight:700')}>{t(`greetShort.${pod}`)}</span><span style={sx('font-size:28px;font-weight:800;letter-spacing:var(--ls-h);overflow:hidden;text-overflow:ellipsis')}>{name}</span></div>
          <a href={href('/account')} className="m-avatar" style={sx('width:44px;height:44px;font-size:16px')}>{name.charAt(0).toUpperCase()}</a>
        </div>
        {d.isEmpty ? (
          <>
            <div style={sx('border-radius:24px;background:linear-gradient(150deg,#5B8DEF,#2E6BE6);color:#fff;padding:22px;display:flex;flex-direction:column;gap:12px')}>
              <span style={sx('align-self:flex-start;padding:4px 10px;border-radius:999px;background:rgba(255,255,255,.2);font-size:12px;font-weight:800')}>{tc('chips.free')}</span>
              <b style={sx('font-size:22px;line-height:1.25')}>{t('emptyTitle')}</b>
              <span style={sx('font-size:14px;line-height:1.5')}>{t('phone.emptyBody')}</span>
              <a href={href('/start/ielts?mode=section')} style={sx('height:50px;border-radius:14px;background:#fff;color:#2E6BE6;font-weight:800;font-size:15px;margin-top:4px;display:grid;place-items:center')}>{t('phone.emptyCta')}</a>
            </div>
            <div style={sx('border-radius:20px;box-shadow:var(--inset);padding:18px;display:flex;flex-direction:column;gap:8px')}><b style={sx('font-size:15px')}>{t('phone.emptyHint')}</b><span style={sx('font-size:13px;color:var(--ink2);line-height:1.5')}>{t('phone.emptyHintBody')}</span></div>
          </>
        ) : (
          <>
            {(() => {
              const inner = (
                <>
                  <span className="m-eyebrow" style={sx('font-size:11px;letter-spacing:.08em')}>{t('phone.next')}</span>
                  <b style={sx('font-size:21px;line-height:1.25')}>{next.title}</b>
                  <span style={sx('font-size:13px;line-height:1.5')}>{next.phoneSub ?? next.sub}</span>
                </>
              );
              const style = sx('border:0;cursor:pointer;text-align:start;border-radius:24px;background:linear-gradient(150deg,#5B8DEF,#2E6BE6);color:#fff;padding:20px;display:flex;flex-direction:column;gap:10px;box-shadow:0 16px 30px -16px rgba(46,107,230,.8)');
              return !next.href
                ? <button type="button" style={style} onClick={next.onClick}>{inner}</button>
                : <a href={next.href} style={style}>{inner}</a>;
            })()}
            <div className="m-carousel" style={sx('padding:6px 16px 12px')}>
              {tg && (
                <div className="m-card" style={sx('flex:none;width:150px;border-radius:20px;padding:16px;display:flex;flex-direction:column;gap:4px')}>
                  <span style={sx('font-size:12px;font-weight:700;color:var(--ink2)')}>{tg.exam === 'sat' ? t('phone.score') : t('phone.band')}</span>
                  <span style={sx('font-size:30px;font-weight:800;letter-spacing:var(--ls-h)')}><bdi dir="ltr">{fmtScore(tg.current, tg.exam)} <span style={sx('font-size:15px;color:var(--mut)')}>→ {fmtScore(tg.target, tg.exam)}</span></bdi></span>
                  <span style={sx('font-size:12px;color:var(--mut);font-weight:600')}>{tg.gap != null && tg.gap > 0 ? t('phone.toGo', { gap: fmtScore(tg.gap, tg.exam) }) : t('onTarget')}</span>
                </div>
              )}
              {d.countdown && (
                <div className="m-card" style={sx('flex:none;width:130px;border-radius:20px;padding:16px;display:flex;flex-direction:column;gap:4px')}>
                  <span style={sx('font-size:12px;font-weight:700;color:var(--ink2)')}>{t('phone.examIn')}</span>
                  <span style={sx('font-size:30px;font-weight:800;letter-spacing:var(--ls-h)')}><bdi dir="ltr">{d.countdown.days}</bdi><span style={sx('font-size:15px;color:var(--mut)')}>{t('phone.d')}</span></span>
                  <span style={sx('font-size:12px;color:var(--mut);font-weight:600')}>{fmtDate(lang, d.countdown.examDate)}</span>
                </div>
              )}
              <a href={href('/pricing')} className="m-card" style={sx('flex:none;width:130px;border-radius:20px;padding:16px;display:flex;flex-direction:column;gap:4px;color:var(--ink)')}>
                <span style={sx('font-size:12px;font-weight:700;color:var(--ink2)')}>{t('phone.credits')}</span>
                <span style={sx('font-size:30px;font-weight:800;letter-spacing:var(--ls-h)')}><bdi dir="ltr">{totalCredits}</bdi></span>
                <span style={sx('font-size:12px;color:var(--blue);font-weight:800')}>{t('phone.buyMore')}</span>
              </a>
            </div>
            <div className="m-card" style={sx('padding:18px;display:flex;flex-direction:column;gap:14px')}>
              <div style={sx('display:flex;justify-content:space-between;align-items:center')}><b style={sx('font-size:16px')}>{series?.exam === 'sat' ? t('progressSat') : t('progress')}</b><a href={href('/progress')} style={sx('font-weight:800;font-size:13px')}>{t('phone.details')}</a></div>
              {(series?.series.overall ?? []).length
                ? <BarChart pts={(series?.series.overall ?? []).slice(-5)} target={series?.target ?? null} exam={series?.exam ?? 'ielts'} lang={lang} />
                : <span style={sx('font-size:13px;color:var(--ink2)')}>{t('noProgress')}</span>}
              {series?.target != null && <span style={sx('display:flex;align-items:center;gap:6px;font-size:12px;font-weight:800;color:var(--ok)')}><span style={sx('width:16px;border-top:2px dashed var(--ok)')} />{t('targetLegend', { v: fmtScore(series.target, series.exam) })}</span>}
            </div>
            {d.weakestTypes.length > 0 && (
              <div style={sx('display:flex;flex-direction:column;gap:10px')}>
                <b style={sx('font-size:16px')}>{t('weak')}</b>
                <div className="m-rows">
                  {d.weakestTypes.slice(0, 3).map((w) => (
                    <div key={w.type} style={sx('padding:14px 16px;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:8px 12px;align-items:center')}>
                      <span style={sx('font-size:14px;font-weight:700')}>{typeLabel(w.type)}</span><span style={sx('font-size:13px;font-weight:800;color:var(--warn)')}><bdi dir="ltr">{w.pct}%</bdi></span>
                      <div style={sx('grid-column:1 / -1;height:6px;border-radius:99px;box-shadow:var(--inset);overflow:hidden')}><div style={{ ...sx('height:100%;background:var(--warn);border-radius:99px'), width: `${w.pct}%` }} /></div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div style={sx('display:flex;flex-direction:column;gap:10px')}>
              <div style={sx('display:flex;justify-content:space-between;align-items:center')}><b style={sx('font-size:16px')}>{t('phone.recent')}</b><a href={href('/mocks')} style={sx('font-weight:800;font-size:13px')}>{t('phone.all')}</a></div>
              <div className="m-rows">
                {mocks.slice(0, 3).map((m) => (
                  <a key={m.attemptId} href={m.to} style={sx('width:100%;color:var(--ink);padding:14px 16px;display:flex;align-items:center;gap:12px;text-align:start')}>
                    <span style={{ ...sx('width:40px;height:40px;border-radius:12px;box-shadow:var(--inset);display:grid;place-items:center;font-size:10px;font-weight:800;flex:none'), color: `var(--${m.exam})` }} lang="en">{EXAM_NAME[m.exam]}</span>
                    <span style={sx('flex:1;display:flex;flex-direction:column;gap:2px;min-width:0')}><b style={sx('font-size:14px')}>{m.nm}<bdi dir="ltr">{m.testCode}</bdi></b><span style={sx('font-size:12px;color:var(--mut);font-weight:600')}>{m.meta}</span></span>
                    <b style={sx('font-size:17px')}><bdi dir="ltr">{m.score}</bdi></b>
                  </a>
                ))}
                {mocks.length === 0 && <span style={sx('padding:14px 16px;font-size:14px;color:var(--ink2)')}>{t('mocksEmpty')}</span>}
              </div>
            </div>
          </>
        )}
      </main>
    </>
  );
}
