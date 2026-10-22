'use client';
/**
 * Results — Results.dc.html (≥520) and Mobile App.dc.html `results` (<520).
 * Data: R1 GET /mock/attempts/:id/result (EXAM §1.10 body + `mock` extension). Writing grading is
 * polled every 10 s; the overall shows "—" until it is ready. No hedging words about scores.
 * Share = R2 + client-side card image (share-modal.tsx); PDF is not built yet → "Soon" (contract Q3).
 */
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import type { ResultResp, ReviewRow } from '@/lib/exam/types';
import { MockApiError } from '@/lib/mock/api/client';
import { getResult } from '@/lib/mock/api/endpoints';
import type { MockResultExt, OpenExamSlug, Recommendation, ResultWriting, SectionKey } from '@/lib/mock/api/types';
import { fmtDateLong, fmtScore } from '@/lib/mock/format';
import { useDelayedFlag } from '@/lib/mock/hooks/use-delayed';
import { useLang } from '@/lib/mock/hooks/use-lang';
import { sx } from '@/lib/mock/sx';
import { AppBar } from '../app-bar';
import { BottomSheet } from '../bottom-sheet';
import { Segmented } from '../segmented';
import { StickyCta } from '../sticky-cta';
import { useToast } from '../toast';
import { CancelledCard } from '../cancelled-card';
import { ShareModal } from './share-modal';
import { B2cSpeaking } from './speaking-section';

export type FullResult = ResultResp & { mock: MockResultExt };
const POLL_MS = 10_000;

const answerText = (v: unknown): string => {
  if (v == null || v === '') return '';
  if (Array.isArray(v)) return v.map(answerText).filter(Boolean).join(', ');
  if (typeof v === 'object') return Object.values(v as Record<string, unknown>).map(answerText).filter(Boolean).join(', ');
  return String(v);
};

export function ResultsView({ attemptId, sample }: { attemptId?: string; sample?: FullResult }) {
  const t = useTranslations('results');
  const tq = useTranslations('qtypes');
  const tc = useTranslations('common');
  const toast = useToast();
  const router = useRouter();
  const { lang, href } = useLang();
  const [res, setRes] = useState<FullResult | null>(sample ?? null);
  const [err, setErr] = useState<'notfound' | 'load' | null>(null);
  const [cancelled, setCancelled] = useState<null | { refunded: boolean }>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [wtab, setWtab] = useState(0);
  const [rtab, setRtab] = useState<string>('');
  const [filter, setFilter] = useState<'all' | 'wrong'>('all');
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [ev, setEv] = useState<Record<string, boolean>>({});
  const [ptab, setPtab] = useState<'overview' | 'writing' | 'speaking' | 'review'>('overview');
  const [essayOpen, setEssayOpen] = useState(false);
  const [sheetQ, setSheetQ] = useState<number | null>(null);
  const wasGrading = useRef(false);

  const load = useCallback(async () => {
    if (!attemptId) return;
    try {
      const r = (await getResult(attemptId)) as unknown as FullResult;
      setRes(r); setErr(null);
    } catch (e) {
      if (e instanceof MockApiError && e.code === 'ATTEMPT_NOT_FINISHED') { router.replace(href(`/exam/${attemptId}`)); return; }
      if (e instanceof MockApiError && e.code === 'ATTEMPT_CANCELLED') { setCancelled({ refunded: e.body.refunded !== false }); return; }
      setErr(e instanceof MockApiError && (e.status === 404 || e.code === 'ATTEMPT_NOT_FOUND') ? 'notfound' : 'load');
    }
  }, [attemptId, router, href]);
  useEffect(() => { if (!sample) void load(); }, [load, sample]);

  const spGrading = ['received', 'transcribing', 'scoring'].includes(res?.speaking?.status ?? '');
  const grading = !!res && (res.mock.writing.some((w) => w.status === 'GRADING') || !!res.overallBand?.pending || spGrading);
  useEffect(() => {
    if (sample || !grading) {
      if (wasGrading.current && !grading && res) toast(t('toastGraded'));
      wasGrading.current = grading;
      return;
    }
    wasGrading.current = true;
    const id = window.setInterval(() => { if (document.visibilityState === 'visible') void load(); }, POLL_MS);
    return () => window.clearInterval(id);
  }, [grading, sample, load, res, toast, t]);

  const slow = useDelayedFlag(!res && !err);

  /* ---------- derived ---------- */
  const m = res?.mock;
  const exam: OpenExamSlug = m?.exam ?? 'ielts';
  const ielts = exam === 'ielts';
  const SEC: Record<string, string> = { listening: 'Listening', reading: 'Reading', writing: 'Writing', speaking: 'Speaking', reading_writing: 'Reading and Writing', math: 'Math' };
  const sName = (k: string) => SEC[k.replace(/_m\d+$/, '')] ?? k;
  const typeLabel = (k: string) => (tq.has(`types.${k}`) ? tq(`types.${k}`) : k.replace(/_/g, ' ').replace(/^./, (c) => c.toUpperCase()));
  const recText = (r: Recommendation) => {
    const p: Record<string, string | number> = { ...r.params };
    if (typeof p.type === 'string') p.type = typeLabel(p.type);
    if (typeof p.section === 'string') p.section = sName(p.section);
    if (typeof p.criterion === 'string') p.criterion = t.has(`crit.${p.criterion}`) ? t(`crit.${p.criterion}` as 'crit.TA') : p.criterion;
    if (typeof p.task === 'string') p.task = p.task === 'task1' ? t('task', { n: 1 }) : p.task === 'task2' ? t('task', { n: 2 }) : p.task;
    if (typeof p.gap === 'number') p.gap = fmtScore(p.gap, exam);
    const key = r.code === 'section_focus' && exam === 'sat' ? 'section_focus_sat' : r.code;
    return tq.has(`rec.${key}`) ? tq(`rec.${key}`, p) : tq('rec.generic');
  };

  const full = m?.mode === 'full';
  const overallVal = full ? (res?.overallBand?.pending ? null : res?.overallBand?.value ?? null) : m?.sectionCards[0]?.score ?? null;
  const overallShown = overallVal == null ? '—' : fmtScore(overallVal, exam);
  const overallLabel = full ? (ielts ? t('overallBand') : t('totalScore')) : ielts ? t('sectionBand', { section: sName(m?.sectionKey ?? '') }) : t('sectionScore', { section: sName(m?.sectionKey ?? '') });
  const scaleMax = ielts ? '9.0' : full ? '1600' : '800';
  const unavailable = !!(res?.overallBand as { unavailable?: string } | null | undefined)?.unavailable;
  const targetLine = !m ? '' : full && unavailable ? t('overallUnavailable') : full && res?.overallBand?.pending ? t('targetPending') : m.target
    ? (m.target.gap == null ? t('targetOnly', { target: fmtScore(m.target.value, exam) }) : m.target.gap > 0 ? t('targetGap', { target: fmtScore(m.target.value, exam), gap: fmtScore(m.target.gap, exam) }) : t('targetAhead', { target: fmtScore(m.target.value, exam) }))
    : t('targetNone');
  const dateStr = m?.finishedAt ? fmtDateLong(lang, m.finishedAt) : '';
  const modeStr = full ? t('full') : t('section', { section: sName(m?.sectionKey ?? '') });

  const writing: ResultWriting[] = m?.writing ?? [];
  const essay = writing[wtab] ?? writing[0];
  const writingDetail = () => {
    const b = (w?: ResultWriting) => (w?.band != null ? fmtScore(w.band, 'ielts') : '—');
    if (writing.length >= 2) return t('tasks', { t1: b(writing[0]), t2: b(writing[1]) });
    if (writing.length === 1) return t('taskOne', { n: writing[0].taskKey === 'task1' ? 1 : 2, band: b(writing[0]) });
    return '';
  };

  /* review */
  const review = useMemo(() => res?.review ?? [], [res]);
  const reviewSections = useMemo(() => Array.from(new Set(review.map((r) => r.sectionKey.replace(/_m\d+$/, '')))), [review]);
  useEffect(() => { if (!rtab && reviewSections.length) setRtab(reviewSections[0]); }, [reviewSections, rtab]);
  const inTab = review.filter((r) => r.sectionKey.replace(/_m\d+$/, '') === rtab);
  const wrongCount = inTab.filter((r) => !r.isCorrect).length;
  const rows = filter === 'wrong' ? inTab.filter((r) => !r.isCorrect) : inTab;
  const extra = (r: ReviewRow) => m?.reviewExtra[r.questionId];
  const rowNo = (r: ReviewRow) => { const mm = /_m(\d+)$/.exec(r.stageKey ?? r.sectionKey); return mm ? `M${mm[1]}·${r.no}` : String(r.no); };

  const pdf = () => toast(t('pdfSoonToast'));
  const share = () => setShareOpen(true);
  const shareView = {
    label: overallLabel,
    score: overallShown,
    sub: ielts
      ? (full ? `IELTS Academic${m?.cefr ? ` · CEFR ${m.cefr}` : ''}` : `IELTS Academic · ${sName(m?.sectionKey ?? '')}`)
      : (full ? ['Digital SAT', ...(m?.sectionCards ?? []).filter((c) => c.score != null).map((c) => `${c.key === 'reading_writing' ? 'R&W' : sName(c.key)} ${fmtScore(c.score, 'sat')}`)].join(' · ') : `Digital SAT · ${sName(m?.sectionKey ?? '')}`),
  };
  const anotherHref = sample ? href('/signup?next=free') : href(`/start/${exam}?mode=full`);

  /* ---------- states ---------- */
  if (cancelled) return <CancelledCard refunded={cancelled.refunded} />;
  if (err) {
    return (
      <main style={sx('max-width:1200px;margin:0 auto;padding:clamp(20px,4vw,40px) 20px 40px')}>
        <div className={`m-banner ${err === 'notfound' ? 'm-banner--warn' : 'm-banner--err'}`} role="alert" style={sx('align-items:center')}>
          <span style={sx('flex:1')}>{err === 'notfound' ? t('notFound') : t('loadError')}</span>
          {err === 'load' ? <button type="button" className="m-btn m-btn--soft m-btn--sm" onClick={() => void load()}>{t('retry')}</button> : <Link className="m-btn m-btn--soft m-btn--sm" href={href('/dashboard')}>{t('toDashboard')}</Link>}
        </div>
      </main>
    );
  }
  if (!res || !m) {
    return (
      <main style={sx('max-width:1200px;margin:0 auto;padding:clamp(20px,4vw,40px) 20px 40px')} aria-busy="true">
        {slow && <div style={sx('display:flex;flex-direction:column;gap:24px')}><div className="m-skel" style={sx('height:40px;width:min(360px,80%);border-radius:12px')} /><div className="m-card" style={sx('height:220px')} /><div className="m-card" style={sx('height:280px')} /></div>}
      </main>
    );
  }

  const acc = m.accuracyByType;
  // Speaking-only attempt (Sevara final review): no question-type accuracy, no question review, no "review your mistakes" step
  const spOnly = !full && m.sectionKey === 'speaking';
  const steps = spOnly ? m.nextSteps.filter((x) => x.code !== 'review_mistakes' && x.code !== 'generic' && tq.has(`rec.${x.code}`)) : m.nextSteps;
  const speaking = res.speaking ?? null;
  const sectionCards = m.sectionCards;
  const sectionCard = (s: MockResultExt['sectionCards'][number], phone = false) => {
    const pct = s.correct != null && s.total ? Math.round((s.correct / s.total) * 100) : s.score != null ? Math.round((s.score / (ielts ? 9 : 800)) * 100) : 0;
    const detail = s.key === 'speaking' ? '' : s.aiGraded ? writingDetail() : s.correct != null && s.total != null ? t('correctOf', { correct: s.correct, total: s.total }) : '';
    const name = <span style={sx(`font-size:${phone ? 11 : 14}px;font-weight:700;color:var(--ink2);display:flex;gap:${phone ? 4 : 6}px;align-items:center`)}>{sName(s.key)}{s.aiGraded && <span className="m-ai" style={sx(phone ? '' : 'padding:2px 7px;border-radius:6px;font-size:11px')}>{tc('chips.ai')}</span>}</span>;
    if (phone) {
      return (
        <div key={s.key} style={sx('padding:12px;border-radius:16px;box-shadow:var(--inset);display:flex;flex-direction:column;gap:2px;min-width:0')}>
          {name}
          {s.status === 'GRADING' ? <span className="m-skel" style={sx('height:26px;width:48px;border-radius:8px')} /> : <b style={sx('font-size:22px')}><bdi dir="ltr">{fmtScore(s.score, exam)}</bdi></b>}
          <span style={sx('font-size:10px;color:var(--mut);font-weight:700')}>{s.status === 'GRADING' ? t('grading') : s.correct != null ? `${s.correct} / ${s.total}` : detail}</span>
        </div>
      );
    }
    return (
      <div key={s.key} className="m-card" style={sx('padding:24px;display:flex;flex-direction:column;gap:10px')}>
        {name}
        {s.status === 'GRADING' ? (
          <>
            <div className="m-skel" style={sx('height:48px;width:90px;border-radius:12px')} />
            <span style={sx('font-size:14px;color:var(--ai);font-weight:700')}>{t('grading')}</span>
            <span style={sx('font-size:12px;color:var(--mut)')}>{t('gradingNote')}</span>
          </>
        ) : s.status === 'NOT_GRADED' ? (
          <span style={sx('font-size:14px;color:var(--warn);font-weight:700;line-height:1.5')}>{m.notGraded?.refunded === false ? t('notGradedNoRefund') : t('notGraded')}</span>
        ) : s.status === 'NOT_TAKEN' ? (
          <span style={sx('font-size:14px;color:var(--mut);font-weight:700')}>{t('notTaken')}</span>
        ) : (
          <>
            <span style={sx('font-size:48px;font-weight:800;letter-spacing:var(--ls-score);line-height:1')}><bdi dir="ltr">{fmtScore(s.score, exam)}</bdi></span>
            <span style={sx('font-size:14px;color:var(--mut);font-weight:600')}>{detail}</span>
            <div className="m-bar" style={sx('margin-top:auto')}><span className={s.aiGraded ? '' : ''} style={{ width: `${pct}%` }} /></div>
          </>
        )}
      </div>
    );
  };

  const accRows = acc.map((a) => (
    <div key={`${a.section}-${a.type}`} style={sx('display:grid;grid-template-columns:minmax(0,1fr) auto;gap:6px 12px;align-items:center')}>
      <span style={sx('font-size:14px;font-weight:600;color:var(--ink2)')}>{typeLabel(a.type)}</span>
      <span style={sx('font-size:13px;font-weight:800')}><bdi dir="ltr">{t('frac', { correct: a.correct, total: a.total, pct: a.pct })}</bdi></span>
      <div className="m-bar" style={sx('grid-column:1 / -1')}><span className={a.pct < 65 ? 'is-low' : ''} style={{ width: `${a.pct}%`, ...(a.pct < 65 ? {} : { background: 'var(--blue)' }) }} /></div>
    </div>
  ));

  const essayBlock = essay && (
    essay.status === 'GRADING' ? (
      <div style={sx('padding:28px;border-radius:16px;box-shadow:var(--inset);display:flex;flex-direction:column;gap:12px;align-items:flex-start')}>
        <span style={sx('font-weight:800;color:var(--ai)')}>{t('grading')}</span>
        <span style={sx('color:var(--ink2);font-size:14px;line-height:var(--lh-body)')}>{t('writingPendingBody')}</span>
        <div style={sx('width:100%;max-width:420px;height:8px;border-radius:99px;box-shadow:var(--inset);overflow:hidden')}><div className="m-skel" style={sx('height:100%;width:100%;border-radius:99px')} /></div>
      </div>
    ) : essay.status === 'NOT_GRADED' ? (
      <div className="m-banner m-banner--warn">{m.notGraded?.refunded === false ? t('notGradedNoRefund') : t('notGraded')}</div>
    ) : (
      <>
        <div style={sx('display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,360px),1fr));gap:24px')}>
          <div style={sx('display:flex;flex-direction:column;gap:10px;min-width:0')}>
            <div dir="ltr" lang="en" style={sx('font-size:13px;font-weight:700;color:var(--mut);text-align:start')}>{essay.prompt}</div>
            <div className="m-serif" dir="ltr" lang="en" style={sx('padding:22px 24px;border-radius:16px;background:var(--paper);font-size:16px;line-height:1.75;white-space:pre-line;max-height:440px;overflow:auto;text-align:start')}>{essay.essay}</div>
            <span style={sx('font-size:12px;color:var(--mut);font-weight:700')}>{t('words', { n: essay.words })}</span>
          </div>
          <div style={sx('display:flex;flex-direction:column;gap:12px;min-width:0')}>
            <div style={sx('display:flex;justify-content:space-between;align-items:baseline')}><span style={sx('font-weight:800')}>{t('taskBand')}</span><span style={sx('font-size:32px;font-weight:800')}><bdi dir="ltr">{fmtScore(essay.band, 'ielts')}</bdi></span></div>
            {(essay.criteria ?? []).map((c) => (
              <div key={c.code} style={sx('padding:14px 16px;border-radius:16px;box-shadow:var(--inset);display:flex;flex-direction:column;gap:6px')}>
                <div style={sx('display:flex;justify-content:space-between;gap:8px')}><span style={sx('font-weight:800;font-size:14px')}>{t(`crit.${c.code}`)}</span><span style={sx('font-weight:800;font-size:18px')}><bdi dir="ltr">{fmtScore(c.score, 'ielts')}</bdi></span></div>
                <span style={sx('font-size:14px;color:var(--ink2);line-height:1.55')}>{c.feedback}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={sx('display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr));gap:16px')}>
          <div style={sx('padding:18px;border-radius:16px;background:var(--okBg);display:flex;flex-direction:column;gap:8px')}><span style={sx('font-weight:800;color:var(--ok);font-size:13px')}>{t('strengths')}</span>{essay.strengths.map((g, i) => <span key={i} style={sx('font-size:14px;line-height:1.5;color:var(--ink)')}>{g}</span>)}</div>
          <div style={sx('padding:18px;border-radius:16px;background:var(--aiBg);display:flex;flex-direction:column;gap:8px')}><span style={sx('font-weight:800;color:var(--ai);font-size:13px')}>{t('wNext')}</span>{essay.nextSteps.map((g, i) => <span key={i} style={sx('font-size:14px;line-height:1.5;color:var(--ink)')}>{g}</span>)}</div>
        </div>
      </>
    )
  );

  const segReview = reviewSections.length > 1 && (
    <Segmented label={t('review')} value={rtab} onChange={setRtab} btnStyle={sx('height:36px;padding:0 14px;font-size:13px')} items={reviewSections.map((k) => ({ key: k, label: sName(k) }))} />
  );
  const segFilter = (
    <Segmented label={t('review')} value={filter} onChange={setFilter} btnStyle={sx('height:36px;padding:0 14px;font-size:13px')}
      items={[{ key: 'all', label: t('all') }, { key: 'wrong', label: t('wrongOnly', { n: wrongCount }) }]} />
  );
  const sheetRow = sheetQ != null ? rows[sheetQ] : null;

  return (
    <>
      <AppBar left="back" title={t('phone.title')} backHref={href(sample ? '' : '/dashboard')} share={share} />
      {/* ================= ≥520 ================= */}
      <main className="m-desk" style={sx('max-width:1200px;margin:0 auto;padding:clamp(20px,4vw,40px) 20px 40px;display:flex;flex-direction:column;gap:28px')}>
        <div style={sx('display:flex;justify-content:space-between;align-items:end;gap:16px;flex-wrap:wrap')}>
          <div style={sx('display:flex;flex-direction:column;gap:6px')}>
            <span style={sx('display:flex;gap:8px;align-items:center')}><span className="m-eyebrow" style={{ ...sx('font-size:13px;letter-spacing:.05em'), color: `var(--${exam})` }} lang="en">{ielts ? 'IELTS ACADEMIC' : 'DIGITAL SAT'}</span>{sample && <span className="m-pill m-pill--warn">{t('sampleBadge')}</span>}</span>
            <h1 className="m-h1" style={sx('font-size:clamp(26px,3.2vw,38px);letter-spacing:var(--ls-h)')}>{sample ? t('sampleTitle') : t('title')}</h1>
            <span style={sx('font-size:14px;color:var(--ink2);font-weight:600')}>{t.rich('metaLine', { mode: modeStr, date: dateStr, code: () => <bdi dir="ltr">{m.testCode}</bdi> })}</span>
          </div>
          <div style={sx('display:flex;gap:10px;flex-wrap:wrap')}>
            <button type="button" className="m-btn m-btn--soft" onClick={share} style={sx('height:46px;padding:0 16px;border-radius:13px;font-size:14px')}>{t('share')}</button>
            <button type="button" className="m-btn m-btn--soft" aria-disabled="true" onClick={pdf} title={t('pdfSoonTip')} style={sx('height:46px;padding:0 16px;border-radius:13px;font-size:14px;color:var(--mut);opacity:.7;cursor:not-allowed')}>{t('pdf')} <span className="m-soon">{tc('chips.soon')}</span></button>
            <Link className="m-btn m-btn--primary" href={anotherHref} style={sx('height:46px;padding:0 18px;border-radius:13px;font-weight:700;font-size:14px;box-shadow:0 8px 18px -8px rgba(46,107,230,.7)')}>{t('another')}</Link>
          </div>
        </div>

        <div style={sx('display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr));gap:24px')}>
          <div className="m-card" style={sx('padding:28px;display:flex;flex-direction:column;gap:16px')}>
            <div style={sx('display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap')}><span style={sx('font-size:14px;font-weight:700;color:var(--ink2)')}>{overallLabel}</span>{m.cefr && <span className="m-pill m-pill--ok" style={sx('padding:6px 12px;font-size:13px')}>CEFR {m.cefr}</span>}</div>
            <div style={sx('display:flex;align-items:baseline;gap:12px;flex-wrap:wrap')}><span style={sx('font-size:clamp(72px,9vw,104px);font-weight:800;letter-spacing:var(--ls-score-xl);line-height:.9')}><bdi dir="ltr">{overallShown}</bdi></span><span style={sx('font-size:15px;color:var(--mut);font-weight:700')}>{t('ofScale', { max: scaleMax })}</span></div>
            <div style={sx('padding:12px 14px;border-radius:14px;box-shadow:var(--inset);font-size:14px;font-weight:600;color:var(--ink2)')}>{targetLine}{!m.target && !sample && <> <Link href={href('/onboarding')} style={sx('font-weight:700')}>{t('setTarget')}</Link></>}</div>
          </div>
          {full && sectionCards.map((s) => sectionCard(s))}
        </div>

        <div style={sx('display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,420px),1fr));gap:24px')}>
          {!spOnly && (
            <div className="m-card" style={sx('padding:28px;display:flex;flex-direction:column;gap:14px')}>
              <div style={sx('font-weight:800;font-size:18px')}>{t('byType')}</div>
              {acc.length ? accRows : <span style={sx('font-size:14px;color:var(--ink2)')}>{t('noTypes')}</span>}
            </div>
          )}
          <div className="m-card" style={sx('padding:28px;display:flex;flex-direction:column;gap:18px')}>
            {(m.strongest.length > 0 || m.weakest.length > 0) && (
              <div style={sx('display:grid;grid-template-columns:1fr 1fr;gap:12px')}>
                <div style={sx('padding:16px;border-radius:16px;background:var(--okBg);display:flex;flex-direction:column;gap:4px')}><span style={sx('font-size:12px;font-weight:800;color:var(--ok)')}>{t('strong')}</span><span style={sx('font-weight:800;font-size:15px;color:var(--ink)')}>{m.strongest.map(typeLabel).join(', ') || '—'}</span></div>
                <div style={sx('padding:16px;border-radius:16px;background:var(--warnBg);display:flex;flex-direction:column;gap:4px')}><span style={sx('font-size:12px;font-weight:800;color:var(--warn)')}>{t('weak')}</span><span style={sx('font-weight:800;font-size:15px;color:var(--ink)')}>{m.weakest.map(typeLabel).join(', ') || '—'}</span></div>
              </div>
            )}
            <div style={sx('font-weight:800;font-size:18px')}>{t('next')}</div>
            {steps.map((s, i) => (
              <div key={i} style={sx('display:flex;gap:14px;align-items:flex-start')}><span style={sx('width:28px;height:28px;border-radius:9px;box-shadow:var(--inset);display:grid;place-items:center;color:var(--blue);font-weight:800;font-size:13px;flex:none')}>{i + 1}</span><span style={sx('font-size:15px;line-height:1.55;padding-top:3px')}>{recText(s)}</span></div>
            ))}
          </div>
        </div>

        {writing.length > 0 && (
          <section className="m-card" style={sx('padding:clamp(20px,3vw,32px);display:flex;flex-direction:column;gap:22px')}>
            <div style={sx('display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap')}>
              <div style={sx('display:flex;gap:10px;align-items:center')}><span style={sx('font-weight:800;font-size:20px')}>{t('writing')}</span><span className="m-ai" style={sx('padding:3px 8px;border-radius:7px;font-size:12px')}>{tc('chips.ai')}</span></div>
              {writing.length > 1 && <Segmented label={t('writing')} value={String(wtab)} onChange={(k) => setWtab(Number(k))} btnStyle={sx('height:38px;padding:0 16px;font-size:13px')}
                items={writing.map((w, i) => ({ key: String(i), label: t('task', { n: w.taskKey === 'task1' ? 1 : 2 }) }))} />}
            </div>
            {essayBlock}
          </section>
        )}

        {speaking && <B2cSpeaking sp={speaking} attemptId={attemptId} sample={!!sample} onChanged={() => void load()} />}

        {!spOnly && (
        <section className="m-card" style={sx('padding:clamp(20px,3vw,32px);display:flex;flex-direction:column;gap:18px')}>
          <div style={sx('display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap')}>
            <span style={sx('font-weight:800;font-size:20px')}>{t('review')}</span>
            <div style={sx('display:flex;gap:10px;flex-wrap:wrap')}>{segReview}{segFilter}</div>
          </div>
          {inTab.length ? <div style={sx('font-size:13px;color:var(--mut);font-weight:600')}>{t('revNote', { section: sName(rtab), from: inTab[0].no, to: inTab[inTab.length - 1].no, total: inTab.length })}</div>
            : <div style={sx('font-size:14px;color:var(--ink2)')}>{t('noReview')}</div>}
          <div style={sx('display:flex;flex-direction:column;gap:10px')}>
            {rows.map((r) => {
              const ok = r.isCorrect;
              const o = !!open[r.questionId];
              const x = extra(r);
              const evText = x?.evidence?.text;
              return (
                <div key={r.questionId} style={{ ...sx('border-radius:16px;overflow:hidden'), boxShadow: o ? 'var(--inset)' : 'var(--raise-sm)' }}>
                  <button type="button" aria-expanded={o} onClick={() => setOpen((s) => ({ ...s, [r.questionId]: !s[r.questionId] }))}
                    style={sx('width:100%;border:0;background:transparent;color:var(--ink);cursor:pointer;text-align:start;padding:14px 16px;display:grid;grid-template-columns:36px minmax(0,1fr) auto;gap:6px 14px;align-items:center')}>
                    <span style={{ ...sx('width:32px;height:32px;border-radius:9px;display:grid;place-items:center;font-weight:800;font-size:13px'), background: ok ? 'var(--okBg)' : 'var(--warnBg)', color: ok ? 'var(--ok)' : 'var(--warn)' }}>{rowNo(r)}</span>
                    <span style={sx('display:flex;flex-direction:column;gap:3px;min-width:0')}><span dir="ltr" lang="en" style={sx('font-size:14px;font-weight:700;line-height:1.4;text-align:start')}>{x?.prompt ?? `${sName(r.sectionKey)} ${r.no}`}</span><span style={sx('font-size:12px;color:var(--mut);font-weight:700')}>{typeLabel(x?.typeLabelKey ?? r.type)}</span></span>
                    <span className={`m-pill ${ok ? 'm-pill--ok' : 'm-pill--warn'}`}>{ok ? t('correct') : t('wrong')}</span>
                  </button>
                  {o && (
                    <div style={sx('padding:0 16px 16px;display:flex;flex-direction:column;gap:12px;padding-inline-start:66px')}>
                      <div style={sx('display:flex;gap:10px;flex-wrap:wrap')}>
                        <span style={sx('padding:8px 12px;border-radius:10px;box-shadow:var(--inset);font-size:13px;font-weight:700')}>{t('yourAnswer')}<bdi dir="ltr" style={{ color: ok ? 'var(--ok)' : 'var(--warn)' }}>{answerText(r.yours) || t('noAnswer')}</bdi></span>
                        <span style={sx('padding:8px 12px;border-radius:10px;box-shadow:var(--inset);font-size:13px;font-weight:700')}>{t('correctAnswer')}<bdi dir="ltr" style={sx('color:var(--ok)')}>{r.correct.join(' / ')}</bdi></span>
                      </div>
                      {r.explanation && <div style={sx('font-size:14px;line-height:var(--lh-body);color:var(--ink2)')}>{r.explanation}</div>}
                      {evText && (
                        <>
                          <button type="button" onClick={() => setEv((s) => ({ ...s, [r.questionId]: !s[r.questionId] }))} style={sx('align-self:flex-start;border:0;background:transparent;color:var(--blue);font-weight:800;font-size:13px;cursor:pointer;padding:0')}>{ev[r.questionId] ? t('hideText') : t('showText')}</button>
                          {ev[r.questionId] && <div className="m-serif" dir="ltr" lang="en" style={sx('padding:14px 16px;border-radius:12px;background:var(--paper);font-size:15px;line-height:1.7;text-align:start')}><span style={sx('color:var(--mut);font-family:var(--font-ui);font-size:12px;font-weight:800;margin-inline-end:8px')}>{x?.evidence?.paragraph}</span><span className="m-hl">{evText}</span></div>}
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
        )}
        <div style={sx('font-size:12px;color:var(--mut);line-height:1.5;text-align:center')}>{tc('legalLine')}</div>
      </main>

      {/* ================= <520 ================= */}
      <main className="m-phone m-with-cta-phone" style={sx('padding:8px 16px 0;display:flex;flex-direction:column;gap:16px')}>
        <div className="m-card" style={sx('padding:20px;display:flex;flex-direction:column;gap:12px')}>
          <div style={sx('display:flex;justify-content:space-between;align-items:center;gap:8px')}><span className="m-eyebrow" style={{ ...sx('letter-spacing:.05em'), color: `var(--${exam})` }} lang="en">{ielts ? 'IELTS ACADEMIC' : 'DIGITAL SAT'}</span>{m.cefr && <span className="m-pill m-pill--ok">CEFR {m.cefr}</span>}{sample && <span className="m-pill m-pill--warn">{t('sampleBadge')}</span>}</div>
          <div style={sx('display:flex;align-items:baseline;gap:10px')}><span style={sx('font-size:76px;font-weight:800;letter-spacing:var(--ls-score-xl);line-height:.95')}><bdi dir="ltr">{overallShown}</bdi></span><span style={sx('font-size:14px;color:var(--mut);font-weight:700')}>{full ? (ielts ? t('phone.overallBand') : t('totalScore').toLowerCase()) : overallLabel}</span></div>
          <span style={sx('font-size:13px;color:var(--ink2);font-weight:600')}>{t.rich('phone.metaLine', { mode: modeStr, date: dateStr, code: () => <bdi dir="ltr">{m.testCode}</bdi> })}{m.target ? t('phone.targetShort', { v: fmtScore(m.target.value, exam) }) : ''}</span>
          {full && <div style={{ ...sx('display:grid;gap:8px'), gridTemplateColumns: sectionCards.length > 3 ? 'repeat(2,minmax(0,1fr))' : `repeat(${sectionCards.length},1fr)` }}>{sectionCards.map((s) => sectionCard(s, true))}</div>}
        </div>
        <div style={sx('position:sticky;top:52px;z-index:3;background:var(--bg);padding:8px 0')}>
          <Segmented grid label={t('title')} value={ptab} onChange={setPtab} style={sx('border-radius:16px')} btnStyle={sx(`height:40px;border-radius:12px;font-weight:800;font-size:${writing.length && speaking ? '12px;padding:0 4px;min-width:0' : '13px'}`)}
            items={[{ key: 'overview', label: t('phone.overview') }, ...(writing.length ? [{ key: 'writing' as const, label: t('writing') }] : []), ...(speaking ? [{ key: 'speaking' as const, label: t('speaking') }] : []), ...(spOnly ? [] : [{ key: 'review' as const, label: t('phone.review') }])]} />
        </div>
        {ptab === 'overview' && (
          <div style={sx('display:flex;flex-direction:column;gap:16px;padding-bottom:24px')}>
            {(m.strongest.length > 0 || m.weakest.length > 0) && (
              <div style={sx('display:grid;grid-template-columns:1fr 1fr;gap:10px')}>
                <div style={sx('padding:14px;border-radius:16px;background:var(--okBg);display:flex;flex-direction:column;gap:4px')}><span className="m-eyebrow" style={sx('font-size:11px;color:var(--ok)')}>{t('phone.strongest')}</span><b style={sx('font-size:14px;line-height:1.3')}>{m.strongest.map(typeLabel).join(', ') || '—'}</b></div>
                <div style={sx('padding:14px;border-radius:16px;background:var(--warnBg);display:flex;flex-direction:column;gap:4px')}><span className="m-eyebrow" style={sx('font-size:11px;color:var(--warn)')}>{t('phone.needs')}</span><b style={sx('font-size:14px;line-height:1.3')}>{m.weakest.map(typeLabel).join(', ') || '—'}</b></div>
              </div>
            )}
            {acc.length > 0 && !spOnly && <div className="m-card" style={sx('border-radius:20px;padding:16px;display:flex;flex-direction:column;gap:12px')}><b style={sx('font-size:15px')}>{t('byType')}</b>{accRows}</div>}
            {steps.length > 0 && (
              <div className="m-card" style={sx('border-radius:20px;padding:16px;display:flex;flex-direction:column;gap:12px')}>
                <b style={sx('font-size:15px')}>{t('next')}</b>
                {steps.map((s, i) => <div key={i} style={sx('display:flex;gap:12px')}><span style={sx('width:26px;height:26px;border-radius:8px;box-shadow:var(--inset);display:grid;place-items:center;font-size:12px;font-weight:800;color:var(--blue);flex:none')}>{i + 1}</span><span style={sx('font-size:14px;line-height:1.5')}>{recText(s)}</span></div>)}
              </div>
            )}
            <div style={sx('font-size:11px;color:var(--mut);line-height:1.5;text-align:center')}>{tc('legalLine')}</div>
          </div>
        )}
        {ptab === 'writing' && essay && (
          <div style={sx('display:flex;flex-direction:column;gap:14px;padding-bottom:24px')}>
            <div style={sx('display:flex;gap:6px;align-items:center')}>
              {writing.map((w, i) => (
                <button key={w.taskKey} type="button" onClick={() => setWtab(i)} style={{ ...sx('height:38px;padding:0 16px;border-radius:999px;border:0;cursor:pointer;font-weight:800;font-size:13px'), background: wtab === i ? 'var(--ink)' : 'var(--bg)', color: wtab === i ? 'var(--bg)' : 'var(--ink2)', boxShadow: wtab === i ? 'none' : 'var(--raise-sm)' }}>{t('task', { n: w.taskKey === 'task1' ? 1 : 2 })}</button>
              ))}
              <span className="m-ai" style={sx('margin-inline-start:auto;padding:4px 9px;border-radius:7px;font-size:12px')}>{tc('chips.ai')}</span>
            </div>
            {essay.status === 'READY' ? (
              <>
                <div style={sx('display:flex;align-items:baseline;justify-content:space-between;gap:8px')}><b dir="ltr" lang="en" style={sx('font-size:15px;text-align:start')}>{essay.prompt.slice(0, 80)}</b><b style={sx('font-size:28px')}><bdi dir="ltr">{fmtScore(essay.band, 'ielts')}</bdi></b></div>
                {(essay.criteria ?? []).map((c) => (
                  <div key={c.code} style={sx('border-radius:16px;box-shadow:var(--raise-sm);padding:14px;display:flex;flex-direction:column;gap:6px')}><div style={sx('display:flex;justify-content:space-between;gap:8px')}><b style={sx('font-size:14px')}>{t(`crit.${c.code}`)}</b><b style={sx('font-size:17px')}><bdi dir="ltr">{fmtScore(c.score, 'ielts')}</bdi></b></div><span style={sx('font-size:13px;color:var(--ink2);line-height:1.55')}>{c.feedback}</span></div>
                ))}
                <button type="button" onClick={() => setEssayOpen(!essayOpen)} style={sx('min-height:52px;border-radius:16px;border:0;background:var(--bg);box-shadow:var(--inset);color:var(--ink);font-weight:800;font-size:14px;cursor:pointer;display:flex;align-items:center;justify-content:space-between;padding:0 16px')}><span>{essayOpen ? t('phone.hideEssay') : t('phone.readEssay')}</span><span style={sx('color:var(--mut);font-weight:700')}>{t('words', { n: essay.words })}</span></button>
                {essayOpen && <div className="m-serif" dir="ltr" lang="en" style={sx('padding:18px;border-radius:16px;background:var(--paper);font-size:16px;line-height:1.7;white-space:pre-line;text-align:start')}>{essay.essay}</div>}
                <div style={sx('padding:16px;border-radius:16px;background:var(--okBg);display:flex;flex-direction:column;gap:6px')}><b style={sx('font-size:13px;color:var(--ok)')}>{t('strengths')}</b>{essay.strengths.map((g, i) => <span key={i} style={sx('font-size:14px;line-height:1.5')}>{g}</span>)}</div>
                <div style={sx('padding:16px;border-radius:16px;background:var(--aiBg);display:flex;flex-direction:column;gap:6px')}><b style={sx('font-size:13px;color:var(--ai)')}>{t('wNext')}</b>{essay.nextSteps.map((g, i) => <span key={i} style={sx('font-size:14px;line-height:1.5')}>{g}</span>)}</div>
              </>
            ) : essayBlock}
          </div>
        )}
        {ptab === 'speaking' && speaking && <B2cSpeaking phone sp={speaking} attemptId={attemptId} sample={!!sample} onChanged={() => void load()} />}
        {ptab === 'review' && (
          <div style={sx('display:flex;flex-direction:column;gap:12px;padding-bottom:24px')}>
            <div style={sx('display:flex;gap:6px;flex-wrap:wrap')}>
              {[...reviewSections.map((k) => ({ k, label: sName(k), on: rtab === k, go: () => setRtab(k) })), { k: 'all', label: t('all'), on: filter === 'all', go: () => setFilter('all') }, { k: 'wrong', label: t('wrongOnly', { n: wrongCount }), on: filter === 'wrong', go: () => setFilter('wrong') }].map((c) => (
                <button key={c.k} type="button" onClick={c.go} style={{ ...sx('height:36px;padding:0 14px;border-radius:999px;border:0;cursor:pointer;font-weight:800;font-size:13px'), background: c.on ? 'var(--ink)' : 'var(--bg)', color: c.on ? 'var(--bg)' : 'var(--ink2)', boxShadow: c.on ? 'none' : 'var(--raise-sm)' }}>{c.label}</button>
              ))}
            </div>
            <span style={sx('font-size:12px;color:var(--mut);font-weight:700')}>{t('phone.tapHint', { section: sName(rtab) })}</span>
            <div className="m-rows">
              {rows.map((r, i) => (
                <button key={r.questionId} type="button" onClick={() => setSheetQ(i)} style={sx('width:100%;border:0;background:transparent;cursor:pointer;color:var(--ink);padding:14px 16px;display:flex;align-items:center;gap:12px;text-align:start')}>
                  <span style={{ ...sx('width:32px;height:32px;border-radius:9px;display:grid;place-items:center;font-weight:800;font-size:13px;flex:none'), background: r.isCorrect ? 'var(--okBg)' : 'var(--warnBg)', color: r.isCorrect ? 'var(--ok)' : 'var(--warn)' }}>{rowNo(r)}</span>
                  <span style={sx('flex:1;display:flex;flex-direction:column;gap:2px;min-width:0')}><span dir="ltr" lang="en" style={sx('font-size:14px;font-weight:700;line-height:1.35;overflow:hidden;text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;text-align:start')}>{extra(r)?.prompt ?? `${sName(r.sectionKey)} ${r.no}`}</span><span style={sx('font-size:12px;color:var(--mut);font-weight:600')}>{typeLabel(extra(r)?.typeLabelKey ?? r.type)}</span></span>
                  <span style={{ ...sx('font-size:12px;font-weight:800'), color: r.isCorrect ? 'var(--ok)' : 'var(--warn)' }}>{r.isCorrect ? t('correct') : t('wrong')}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </main>
      <BottomSheet open={!!sheetRow} title={sheetRow ? t('phone.question', { n: rowNo(sheetRow) }) : ''} onClose={() => setSheetQ(null)}>
        {sheetRow && (
          <>
            <span dir="ltr" lang="en" style={sx('font-size:15px;font-weight:700;line-height:1.5;text-align:start')}>{extra(sheetRow)?.prompt}</span>
            <div style={sx('display:grid;grid-template-columns:1fr 1fr;gap:10px')}>
              <div style={sx('padding:12px;border-radius:14px;box-shadow:var(--inset);display:flex;flex-direction:column;gap:2px')}><span className="m-eyebrow" style={sx('font-size:11px;color:var(--mut)')}>{t('phone.yourAnswer')}</span><b dir="ltr" style={{ ...sx('font-size:15px'), color: sheetRow.isCorrect ? 'var(--ok)' : 'var(--warn)' }}>{answerText(sheetRow.yours) || t('noAnswer')}</b></div>
              <div style={sx('padding:12px;border-radius:14px;box-shadow:var(--inset);display:flex;flex-direction:column;gap:2px')}><span className="m-eyebrow" style={sx('font-size:11px;color:var(--mut)')}>{t('phone.correct')}</span><b dir="ltr" style={sx('font-size:15px;color:var(--ok)')}>{sheetRow.correct.join(' / ')}</b></div>
            </div>
            {sheetRow.explanation && <span style={sx('font-size:14px;line-height:1.6;color:var(--ink2)')}>{sheetRow.explanation}</span>}
            {extra(sheetRow)?.evidence?.text && (
              <>
                <span className="m-eyebrow" style={sx('font-size:12px;color:var(--mut)')}>{t('phone.inText', { p: extra(sheetRow)!.evidence!.paragraph })}</span>
                <div className="m-serif" dir="ltr" lang="en" style={sx('padding:14px;border-radius:14px;background:var(--paper);font-size:16px;line-height:1.65;text-align:start')}><span className="m-hl">{extra(sheetRow)!.evidence!.text}</span></div>
              </>
            )}
            <div style={sx('display:grid;grid-template-columns:1fr 1fr;gap:10px')}>
              <button type="button" className="m-btn m-btn--soft" disabled={sheetQ === 0} onClick={() => setSheetQ((q) => Math.max(0, (q ?? 0) - 1))} style={sx('height:48px;font-weight:800')}>{t('phone.previous')}</button>
              <button type="button" className="m-btn m-btn--soft" disabled={sheetQ === rows.length - 1} onClick={() => setSheetQ((q) => Math.min(rows.length - 1, (q ?? 0) + 1))} style={sx('height:48px;font-weight:800')}>{t('phone.next')}</button>
            </div>
          </>
        )}
      </BottomSheet>
      <StickyCta secondary={{ label: <>{t('phone.pdf')} <span className="m-soon">{tc('chips.soon')}</span></>, onClick: pdf }} primary={{ label: t('another'), href: anotherHref }} />
      <ShareModal open={shareOpen} onClose={() => setShareOpen(false)} view={shareView} attemptId={sample ? undefined : attemptId} ready={overallVal != null}
        sampleUrl={sample && typeof window !== 'undefined' ? `${window.location.origin}${href('/sample-result')}` : undefined} />
    </>
  );
}
