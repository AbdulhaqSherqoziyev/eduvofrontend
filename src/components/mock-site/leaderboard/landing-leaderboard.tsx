'use client';
/**
 * Landing "Most active learners" block (leaderboard-design.md §3 + §13). Names never reach the SSR
 * HTML: the server renders an empty hidden <section>; L1 is fetched only when the block is ~600px
 * from the viewport, and the block carries `data-nosnippet`. The server decides visibility
 * (`landing.visible` / `defaultPeriod`); loading, error and "fewer than 3" all render nothing.
 */
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ensureSession } from '@/lib/mock/api/client';
import type { LbExam, LbPeriod } from '@/lib/mock/api/types';
import { useLang } from '@/lib/mock/hooks/use-lang';
import { useSession } from '@/lib/mock/hooks/use-session';
import { sx } from '@/lib/mock/sx';
import { Chevron } from '../landing/landing-phone-parts';
import { EXAM_LABEL } from './lb-format';
import { LbFilterEmpty, LbList } from './lb-list';
import { ExamFilter, LbChampions, LbCountdown, PeriodSeg } from './lb-parts';
import { PointsHowSheet } from './points-how';
import { useLeaderboard } from './use-leaderboard';

const SEC = sx('max-width:1280px;margin:0 auto;padding:clamp(40px,5vw,72px) 20px');
const H_PHONE = sx('margin:0;font-size:22px;font-weight:800;letter-spacing:-0.025em;text-wrap:balance');
const HEAD = sx('font-size:11px;font-weight:800;color:var(--mut);letter-spacing:var(--ls-eyebrow-sm);text-transform:var(--tt-eyebrow)');

type Phase = 'idle' | 'deciding' | 'shown' | 'gone';

export function LandingLeaderboard({ phone }: { phone?: boolean }) {
  const t = useTranslations('leaderboard');
  const { href } = useLang();
  const session = useSession();
  const learner = session.status === 'learner';
  const sentinel = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);
  const [phase, setPhase] = useState<Phase>('idle');
  const [period, setPeriod] = useState<LbPeriod>('week');
  const [exam, setExam] = useState<LbExam>('all');
  const [how, setHow] = useState(false);

  useEffect(() => {
    const el = sentinel.current;
    if (!el || typeof IntersectionObserver === 'undefined') { setNear(true); return; }
    const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { setNear(true); io.disconnect(); } }, { rootMargin: '600px 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const lb = useLeaderboard({ enabled: near && phase !== 'gone', period, exam, timeoutMs: 4000, before: ensureSession });

  // first answer (week/all) decides: hidden, monthly default, or shown
  useEffect(() => {
    if (phase === 'shown' || phase === 'gone' || !near) return;
    if (lb.error) { setPhase('gone'); return; }
    const d = lb.data;
    if (!d || d.period !== period || d.exam !== exam) return;
    if (!d.landing.visible) setPhase('gone');
    else if (d.landing.defaultPeriod === 'month' && period === 'week') { setPeriod('month'); setPhase('deciding'); }
    else setPhase('shown');
  }, [lb.data, lb.error, phase, near, period, exam]);

  const shown = phase === 'shown' && !!lb.data;
  const d = lb.data;
  const slotCta = learner ? { label: t('slotCtaLearner'), href: href('/start') } : { label: t('slotCtaGuest'), href: href('/signup?next=free') };
  const title = t(period === 'week' ? 'titleLanding' : 'titleLandingMonth');

  const list = !d ? null : lb.error ? (
    <div className="m-banner m-banner--info" role="alert" style={sx('align-items:center;margin:8px 12px')}>
      <span style={sx('flex:1')}>{t('loadError')}</span>
      <button type="button" className="m-btn m-btn--soft m-btn--sm" onClick={lb.retry}>{t('retry')}</button>
    </div>
  ) : d.rows.length === 0 && exam !== 'all' ? (
    <div style={phone ? undefined : sx('padding:8px 12px')}>
      <LbFilterEmpty text={t(period === 'week' ? 'emptyFilterWeek' : 'emptyFilterMonth', { exam: EXAM_LABEL[exam] })}
        cta={learner ? { label: t('emptyFilterCtaLearner', { exam: EXAM_LABEL[exam] }), href: href(`/start/${exam}?mode=section`) } : { label: t('emptyFilterCtaGuest', { exam: EXAM_LABEL[exam] }), href: href(`/signup?next=free&exam=${exam}`) }} />
    </div>
  ) : (
    <LbList rows={d.rows} phone={phone} plain={!phone} slots={3} slotCta={slotCta} busy={lb.loading} skel={lb.skel} label={t('listLabel')} />
  );

  const howLink = (size: number) => (
    <button type="button" className="m-lb-ghost" style={{ fontSize: size }} onClick={() => setHow(true)}>{t('howLink')}<Chevron size={7} w={2} /></button>
  );
  const cabinet = learner && <Link href={href('/dashboard#leaderboard')} className="m-lb-ghost">{t('seeInCabinet')}<Chevron size={7} w={2} /></Link>;

  return (
    <>
      <div ref={sentinel} aria-hidden style={sx('height:1px')} />
      {phone ? (
        <section id="leaderboard-m" data-nosnippet="" hidden={!shown} aria-label={title} style={sx('padding:36px 18px 0;display:flex;flex-direction:column;gap:12px;animation:m-fade-in .2s')}>
          {shown && d && (
            <>
              <h2 style={H_PHONE}>{title}</h2>
              <p style={sx('margin:0;font-size:13px;line-height:1.5;color:var(--ink2)')}>{t('disclaimer')}</p>
              <PeriodSeg value={period} onChange={setPeriod} phone />
              <ExamFilter value={exam} onChange={setExam} phone />
              <LbCountdown period={d.period} newPeriod={d.newPeriod} endsAt={d.periodEndsAt} serverNow={d.serverNow} receivedAt={lb.receivedAt} size={12} />
              {list}
              <LbChampions list={d.champions} period={d.period} scroll />
              <div>{howLink(14)}</div>
              <span style={sx('font-size:11px;color:var(--mut);line-height:1.5;font-weight:600')}>{t('privacyNote')}</span>
              {cabinet}
            </>
          )}
        </section>
      ) : (
        <section id="leaderboard" data-nosnippet="" hidden={!shown} aria-label={title} style={{ ...SEC, animation: 'm-fade-in .2s' }}>
          {shown && d && (
            <>
              <div style={sx('display:flex;justify-content:space-between;align-items:flex-end;gap:16px;flex-wrap:wrap;margin-bottom:12px')}>
                <h2 className="m-h2" style={sx('text-wrap:balance')}>{title}</h2>
                <div style={sx('display:flex;gap:10px;flex-wrap:wrap')}>
                  <PeriodSeg value={period} onChange={setPeriod} />
                  <ExamFilter value={exam} onChange={setExam} />
                </div>
              </div>
              <div style={sx('display:flex;gap:6px 16px;flex-wrap:wrap;align-items:baseline;margin-bottom:28px')}>
                <p className="m-lead">{t('disclaimer')}</p>
                {howLink(15)}
              </div>
              <div className="m-lb-grid">
                <div className="m-card" style={sx('padding:8px 0 12px;min-width:0')}>
                  {d.rows.length > 0 && !lb.error && (
                    <div className="m-lb-row" aria-hidden style={sx('min-height:0;padding-top:12px;padding-bottom:10px;border-bottom:1px solid var(--line)')}>
                      <span style={{ ...HEAD, gridColumn: '1 / 3' }}>{t('colRank')}</span>
                      <span style={HEAD}>{t('colName')}</span>
                      <span style={{ ...HEAD, gridColumn: '4 / 6', textAlign: 'end' }}>{t('colPoints')}</span>
                    </div>
                  )}
                  {list}
                </div>
                <div style={sx('display:flex;flex-direction:column;gap:20px;min-width:0')}>
                  <div style={sx('border-radius:20px;box-shadow:var(--inset);padding:18px')}>
                    <LbCountdown period={d.period} newPeriod={d.newPeriod} endsAt={d.periodEndsAt} serverNow={d.serverNow} receivedAt={lb.receivedAt} reset />
                  </div>
                  {d.champions.length > 0 && <div className="m-card" style={sx('padding:18px')}><LbChampions list={d.champions} period={d.period} stack /></div>}
                  <span style={sx('font-size:12px;color:var(--mut);line-height:1.5;font-weight:600')}>{t('privacyNote')}</span>
                  {cabinet}
                </div>
              </div>
            </>
          )}
        </section>
      )}
      <PointsHowSheet open={how} onClose={() => setHow(false)} />
    </>
  );
}
