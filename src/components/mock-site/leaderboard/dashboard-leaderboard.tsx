'use client';
/**
 * Dashboard leaderboard (leaderboard-design.md §4 + §13): "Leaderboard" card + "My week" card
 * (≥520), a "Leaderboard" section and a "This week" carousel card (<520). Data: L1 (with `me`) and
 * L2; each card has its own error state so the rest of the dashboard keeps working.
 * Own-state copy follows §4.3: no participant counts, no "overtaken", no zero.
 */
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { dismissNameNotice, getGamification, markBadgesSeen, patchMe } from '@/lib/mock/api/endpoints';
import type { Gamification, Leaderboard, LbExam, LbPeriod, Learner } from '@/lib/mock/api/types';
import { fmtInt } from '@/lib/mock/format';
import { useDelayedFlag } from '@/lib/mock/hooks/use-delayed';
import { useLang } from '@/lib/mock/hooks/use-lang';
import { sx } from '@/lib/mock/sx';
import { EditModal } from '../account/account-view';
import { Chevron } from '../landing/landing-phone-parts';
import { useToast } from '../toast';
import { AchievementsSheet, BADGES, BadgeGlyph, LevelChip, levelProgress, streakLines } from './achievements';
import { EXAM_LABEL, awardMonth, awardWeekRange } from './lb-format';
import { LbFilterEmpty, LbList } from './lb-list';
import { ExamFilter, LbChampions, LbCountdown, PeriodSeg } from './lb-parts';
import { PointsHowSheet } from './points-how';
import { useLeaderboard } from './use-leaderboard';

const initialsOf = (name: string) => name.trim().split(/\s+/).slice(0, 2).map((w) => w.charAt(0).toUpperCase()).join('') || null;

/** one instance per dashboard: state shared by the desktop row, the phone section and the carousel card */
export function useDashLeaderboard(learner: Learner | null) {
  const t = useTranslations('leaderboard');
  const toast = useToast();
  const { lang } = useLang();
  const [period, setPeriod] = useState<LbPeriod>('week');
  const [exam, setExam] = useState<LbExam>('all');
  const lb = useLeaderboard({ enabled: !!learner, period, exam });
  const [g, setG] = useState<Gamification | null>(null);
  const [gErr, setGErr] = useState(false);
  const [gNonce, setGNonce] = useState(0);
  const [how, setHow] = useState(false);
  const [ach, setAch] = useState(false);
  const [editName, setEditName] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const toasted = useRef(false);

  useEffect(() => {
    if (!learner) return;
    const ac = new AbortController();
    setGErr(false);
    getGamification(ac.signal).then((x) => { setG(x); setNotice(x.nameNotice?.pending ? (x.nameNotice.name ?? learner.displayName ?? '').trim() || null : null); }).catch((e: unknown) => { if ((e as Error)?.name !== 'AbortError') setGErr(true); });
    return () => ac.abort();
  }, [learner, gNonce]);

  // new badges → one toast, then mark them seen (§4.5); no confetti
  useEffect(() => {
    if (!g || toasted.current) return;
    toasted.current = true;
    const fresh = g.badges.filter((b) => b.earnedAt && !b.seen);
    if (!fresh.length) return;
    const champ = fresh.find((b) => b.key === 'week_champ') ?? fresh.find((b) => b.key === 'month_champ');
    const last = champ?.awards?.[champ.awards.length - 1];
    if (champ && last) {
      toast(champ.key === 'week_champ' ? t('ach.toastChamp', { range: awardWeekRange(lang, last) }) : t('ach.toastChampMonth', { month: awardMonth(lang, last) }));
    } else {
      toast(fresh.length === 1 ? t('ach.toastBadge', { name: t(`badge.${fresh[0].key}.name`) }) : t('ach.toastBadges', { n: fresh.length }));
    }
    void markBadgesSeen(fresh.map((b) => b.key)).catch(() => undefined);
  }, [g, toast, t, lang]);

  const closeNotice = useCallback(() => { setNotice(null); void dismissNameNotice().catch(() => undefined); }, []);

  /** §4.6: optimistic, no confirmation (reversible), toast with Undo; API error → state restored */
  const setHidden = useCallback(async (hidden: boolean, withUndo = true): Promise<void> => {
    if (busy || !learner) return;
    setBusy(true);
    const name = (learner.displayName ?? '').trim();
    const prev: Leaderboard | null = lb.data;
    lb.patch((d) => {
      return {
        ...d,
        me: d.me ? { ...d.me, visibility: hidden ? 'hidden' : 'visible' } : d.me,
        rows: d.rows.map((r) => (r.isMe ? { ...r, hidden, name: hidden ? null : name || null, initials: hidden ? null : initialsOf(name), averages: hidden ? [] : r.averages } : r)),
      };
    });
    try {
      await patchMe({ leaderboardHidden: hidden });
      if (!hidden) lb.retry(); // averages come back from the server
      toast(t(hidden ? 'me.toastHidden' : 'me.toastShown'), withUndo ? { action: { label: t('me.undo'), onClick: () => { void setHidden(!hidden, false); } } } : undefined);
    } catch {
      if (prev) lb.patch(() => prev);
      toast(t('me.saveErr'));
    } finally { setBusy(false); }
  }, [busy, learner, lb, toast, t]);

  return { period, setPeriod, exam, setExam, lb, g, gErr, retryG: () => setGNonce((n) => n + 1), how, setHow, ach, setAch, editName, setEditName, busy, setHidden, notice, closeNotice, learner };
}
export type DashLb = ReturnType<typeof useDashLeaderboard>;

/* ---------------- shared bits ---------------- */

function Ghost({ children, onClick, href, mut, disabled }: { children: React.ReactNode; onClick?: () => void; href?: string; mut?: boolean; disabled?: boolean }) {
  const cls = `m-lb-ghost${mut ? ' m-lb-ghost--mut' : ''}`;
  if (href) return <Link href={href} className={cls}>{children}<Chevron size={7} w={2} /></Link>;
  return <button type="button" className={cls} onClick={disabled ? undefined : onClick} aria-disabled={disabled || undefined}>{children}{!mut && <Chevron size={7} w={2} />}</button>;
}

/** §4.3 own-state line (+ its ghost action) */
function MeStatus({ s, size }: { s: DashLb; size: number }) {
  const t = useTranslations('leaderboard');
  const { href } = useLang();
  const me = s.lb.data?.me;
  if (!me) return null;
  const g = s.g;
  const month = s.period === 'month';
  let text: string;
  let action: React.ReactNode = null;
  const rankLine = () => {
    if (me.band === 'zero' || me.rank == null) return t('me.zero');
    if (me.band === 'top10') return t('me.inTop', { rank: me.rank });
    if (me.band === 'near') return t('me.near', { rank: me.rank, gap: me.gapToTop10 ?? 0 });
    return me.nextLevel
      ? t(month ? 'me.farMonth' : 'me.farWeek', { pts: me.points, level: t(`ach.lvl.${me.nextLevel.key}`), gap: me.nextLevel.gap })
      : t(month ? 'me.farMaxMonth' : 'me.farMaxWeek', { pts: me.points });
  };
  switch (me.visibility) {
    case 'removed': text = t('me.removed'); action = <Ghost href={href('/help/contact')}>{t('me.removedCta')}</Ghost>; break;
    case 'no_name': text = t('me.noName'); action = <Ghost onClick={() => s.setEditName(true)}>{t('me.noNameCta')}</Ghost>; break;
    case 'name_flagged': text = t('me.nameFlagged'); action = <Ghost onClick={() => s.setEditName(true)}>{t('me.nameFlaggedCta')}</Ghost>; break;
    case 'hidden':
      text = me.rank != null && me.band !== 'zero' ? `${t('me.hiddenState')} · ${t('medalAria', { rank: me.rank })}` : t('me.hiddenState');
      action = <Ghost onClick={() => void s.setHidden(false)} disabled={s.busy}>{t('me.show')}</Ghost>;
      break;
    default:
      text = rankLine();
      if (me.band === 'zero') action = <Ghost href={href('/start')}>{t('slotCtaLearner')}</Ghost>;
  }
  return (
    <div style={sx('border-radius:16px;box-shadow:var(--inset);padding:14px 16px;display:flex;flex-direction:column;gap:8px;align-items:flex-start')}>
      <span style={{ ...sx('font-weight:700;line-height:1.45;color:var(--ink)'), fontSize: size }}>{text}</span>
      {action}
    </div>
  );
}

function NameNotice({ s }: { s: DashLb }) {
  const t = useTranslations('leaderboard');
  const name = s.notice;
  if (!name || s.lb.data?.me?.visibility !== 'visible') return null;
  return (
    <div className="m-banner m-banner--info" style={sx('align-items:flex-start')}>
      <span style={sx('flex:1;display:flex;flex-direction:column;gap:8px;min-width:0')}>
        <span>{t.rich('me.nameNotice', { name, b: (c) => <b style={sx('font-weight:800;overflow-wrap:anywhere')}>{c}</b> })}</span>
        <span style={sx('display:flex;gap:16px;flex-wrap:wrap')}>
          <button type="button" className="m-lb-ghost" onClick={() => { s.closeNotice(); s.setEditName(true); }}>{t('me.nameNoticeChange')}</button>
          <button type="button" className="m-lb-ghost" onClick={() => { s.closeNotice(); void s.setHidden(true); }}>{t('me.nameNoticeHide')}</button>
        </span>
      </span>
      <button type="button" onClick={s.closeNotice} aria-label={t('close')} style={sx('border:0;background:transparent;cursor:pointer;color:var(--ink2);font-size:20px;line-height:1;padding:0 2px;font-family:inherit')}>×</button>
    </div>
  );
}

function ListArea({ s, phone }: { s: DashLb; phone?: boolean }) {
  const t = useTranslations('leaderboard');
  const { href } = useLang();
  const d = s.lb.data;
  if (!d) return null;
  if (d.rows.length === 0 && s.exam !== 'all') {
    const ex = EXAM_LABEL[s.exam];
    return <LbFilterEmpty text={t(s.period === 'week' ? 'emptyFilterWeek' : 'emptyFilterMonth', { exam: ex })} cta={{ label: t('emptyFilterCtaLearner', { exam: ex }), href: href(`/start/${s.exam}?mode=section`) }} />;
  }
  return <LbList rows={d.rows} phone={phone} slots={1} slotCta={{ label: t('slotCtaLearner'), href: href('/start') }} busy={s.lb.loading} skel={s.lb.skel} label={t('listLabel')} />;
}

function ErrBanner({ onRetry }: { onRetry: () => void }) {
  const t = useTranslations('leaderboard');
  return (
    <div className="m-banner m-banner--err" role="alert" style={sx('align-items:center')}>
      <span style={sx('flex:1')}>{t('loadError')}</span>
      <button type="button" className="m-btn m-btn--soft m-btn--sm" onClick={onRetry}>{t('retry')}</button>
    </div>
  );
}

function HideBtn({ s }: { s: DashLb }) {
  const t = useTranslations('leaderboard');
  const v = s.lb.data?.me?.visibility;
  if (v !== 'visible' && v !== 'hidden') return null;
  return (
    <button type="button" className="m-lb-ghost m-lb-ghost--mut" aria-disabled={s.busy || undefined} onClick={s.busy ? undefined : () => void s.setHidden(v === 'visible')}>
      {t(v === 'visible' ? 'me.hide' : 'me.show')}
    </button>
  );
}

function MiniBadges({ g }: { g: Gamification }) {
  const on = new Set(g.badges.filter((b) => b.earnedAt).map((b) => b.key));
  return <span aria-hidden style={sx('display:flex;gap:6px;flex-wrap:wrap')}>{BADGES.map((k) => <BadgeGlyph key={k} k={k} size={16} on={on.has(k)} />)}</span>;
}

function ExamNear({ days }: { days: number | null }) {
  const t = useTranslations('leaderboard');
  if (days == null) return null;
  return <span style={sx('font-size:13px;font-weight:700;color:var(--ink2);line-height:1.5')}>{t('me.examNear', { n: days })}</span>;
}

/* ---------------- ≥520: two cards in one row ---------------- */

export function LbDeskRow({ s, examNearDays }: { s: DashLb; examNearDays: number | null }) {
  const t = useTranslations('leaderboard');
  const ta = useTranslations('leaderboard.ach');
  const { lang } = useLang();
  const d = s.lb.data;
  const slow = useDelayedFlag(!d && !s.lb.error);
  if (!d && !s.lb.error) {
    return slow ? <div style={sx('display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,420px),1fr));gap:24px')} aria-busy="true"><div className="m-card" style={sx('height:360px')} /><div className="m-card" style={sx('height:360px')} /></div> : null;
  }
  const me = d?.me;
  const st = s.g ? streakLines(s.g, ta) : null;
  const showBig = me && me.band !== 'zero' && me.points > 0 && me.visibility !== 'removed';
  return (
    <div id="leaderboard" style={sx('display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,420px),1fr));gap:24px;align-items:start;scroll-margin-top:88px')}>
      {/* Leaderboard */}
      <section className="m-card" aria-label={t('title')} style={sx('padding:24px;display:flex;flex-direction:column;gap:14px;min-width:0')}>
        <div style={sx('display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap')}>
          <span style={sx('font-weight:800;font-size:18px')}>{t('title')}</span>
          <PeriodSeg value={s.period} onChange={s.setPeriod} />
        </div>
        {s.lb.error && !d ? <ErrBanner onRetry={s.lb.retry} /> : d && (
          <>
            <div style={sx('display:flex;align-items:flex-start;gap:6px 14px;flex-wrap:wrap')}>
              <LbCountdown period={d.period} newPeriod={d.newPeriod} endsAt={d.periodEndsAt} serverNow={d.serverNow} receivedAt={s.lb.receivedAt} />
              <button type="button" className="m-lb-ghost" onClick={() => s.setHow(true)}>{t('howLink')}<Chevron size={7} w={2} /></button>
            </div>
            <div><ExamFilter value={s.exam} onChange={s.setExam} /></div>
            {s.lb.error ? <ErrBanner onRetry={s.lb.retry} /> : <ListArea s={s} />}
            <LbChampions list={d.champions} period={d.period} />
            <div style={sx('display:flex;justify-content:space-between;align-items:center;gap:8px 16px;flex-wrap:wrap')}>
              <span style={sx('font-size:12px;color:var(--mut);font-weight:600;line-height:1.5;flex:1 1 220px')}>{t('privacyNote')}</span>
              <HideBtn s={s} />
            </div>
          </>
        )}
      </section>

      {/* My week / My month */}
      <section className="m-card" aria-label={t(s.period === 'week' ? 'me.weekTitle' : 'me.monthTitle')} style={sx('padding:24px;display:flex;flex-direction:column;gap:14px;min-width:0')}>
        <span className="m-eyebrow" style={sx('color:var(--blue)')}>{t(s.period === 'week' ? 'me.weekTitle' : 'me.monthTitle')}</span>
        <NameNotice s={s} />
        {showBig && (
          <div style={sx('display:flex;align-items:baseline;gap:12px;flex-wrap:wrap')}>
            <span style={sx('font-size:48px;font-weight:800;letter-spacing:var(--ls-score);line-height:1')}><bdi dir="ltr">{fmtInt(lang, me.points)}</bdi></span>
            <span style={sx('font-size:15px;font-weight:700;color:var(--mut)')}>{t('me.pointsLabel')}</span>
          </div>
        )}
        <MeStatus s={s} size={15} />
        <ExamNear days={examNearDays} />
        {s.gErr && !s.g ? <ErrBanner onRetry={s.retryG} /> : s.g && st && (
          <button type="button" onClick={() => s.setAch(true)} style={sx('border:0;background:transparent;padding:0;cursor:pointer;text-align:start;color:var(--ink);display:flex;flex-direction:column;gap:14px;font-family:inherit')}>
            <span style={sx('display:flex;gap:10px;align-items:flex-start')}>
              <BadgeGlyph k="streak_4" size={18} on={s.g.streak.status === 'active' || s.g.streak.status === 'rest'} />
              <span style={sx('display:flex;flex-direction:column;gap:2px')}>
                <b style={sx('font-size:15px')}>{st.head}</b>
                {st.sub && <span style={sx('font-size:13px;color:var(--ink2);line-height:1.5')}>{st.sub}</span>}
              </span>
            </span>
            {s.g.level.key && (
              <span style={sx('display:flex;flex-direction:column;gap:8px;width:100%')}>
                <span style={sx('display:flex;align-items:center;gap:10px;flex-wrap:wrap')}>
                  <LevelChip k={s.g.level.key} />
                  <span style={sx('font-size:13px;font-weight:700;color:var(--ink2)')}>
                    {s.g.level.nextKey && s.g.level.nextMin != null ? ta('levelNext', { level: ta(`lvl.${s.g.level.nextKey}`), n: s.g.level.nextMin - s.g.lifetimePoints }) : ta('levelMax')}
                  </span>
                </span>
                <span className="m-bar" style={sx('display:block')}><span style={{ width: `${levelProgress(s.g)}%` }} /></span>
              </span>
            )}
            <span style={sx('display:flex;align-items:center;gap:12px;flex-wrap:wrap')}>
              <span style={sx('font-size:13px;font-weight:800;color:var(--ink2)')}>{ta('badges')}</span>
              <MiniBadges g={s.g} />
            </span>
          </button>
        )}
        <div><button type="button" className="m-lb-ghost" onClick={() => s.setAch(true)} disabled={!s.g}>{t('me.achievements')}<Chevron size={7} w={2} /></button></div>
      </section>
    </div>
  );
}

/* ---------------- <520 ---------------- */

export function LbPhoneSection({ s, examNearDays }: { s: DashLb; examNearDays: number | null }) {
  const t = useTranslations('leaderboard');
  const d = s.lb.data;
  const slow = useDelayedFlag(!d && !s.lb.error);
  if (!d && !s.lb.error) return slow ? <div className="m-card" style={sx('height:360px')} aria-busy="true" /> : null;
  return (
    <section id="leaderboard-m" aria-label={t('title')} style={sx('display:flex;flex-direction:column;gap:12px;scroll-margin-top:64px')}>
      <div style={sx('display:flex;justify-content:space-between;align-items:center;gap:8px')}>
        <b style={sx('font-size:16px')}>{t('title')}</b>
        {s.g && <button type="button" className="m-lb-ghost" onClick={() => s.setAch(true)}>{t('me.achievements')}<Chevron size={7} w={2} /></button>}
      </div>
      {s.lb.error && !d ? <ErrBanner onRetry={s.lb.retry} /> : d && (
        <>
          <NameNotice s={s} />
          <MeStatus s={s} size={14} />
          <ExamNear days={examNearDays} />
          <PeriodSeg value={s.period} onChange={s.setPeriod} phone />
          <ExamFilter value={s.exam} onChange={s.setExam} phone />
          <LbCountdown period={d.period} newPeriod={d.newPeriod} endsAt={d.periodEndsAt} serverNow={d.serverNow} receivedAt={s.lb.receivedAt} size={12} />
          {s.lb.error ? <ErrBanner onRetry={s.lb.retry} /> : <ListArea s={s} phone />}
          <LbChampions list={d.champions} period={d.period} scroll />
          <div><button type="button" className="m-lb-ghost" style={sx('font-size:14px')} onClick={() => s.setHow(true)}>{t('howLink')}<Chevron size={7} w={2} /></button></div>
          <span style={sx('font-size:11px;color:var(--mut);line-height:1.5;font-weight:600')}>{t('privacyNote')}</span>
          <div><HideBtn s={s} /></div>
        </>
      )}
    </section>
  );
}

/** carousel card "This week" — second card, after "Band" (§13.9) */
export function LbWeekCard({ s }: { s: DashLb }) {
  const t = useTranslations('leaderboard');
  const ta = useTranslations('leaderboard.ach');
  const { lang } = useLang();
  const g = s.g;
  if (!g) return null;
  const sub = g.streak.weeks > 0 && (g.streak.status === 'active' || g.streak.status === 'rest') ? ta('streak', { n: g.streak.weeks }) : g.level.key ? ta(`lvl.${g.level.key}`) : null;
  return (
    <button type="button" className="m-card" onClick={() => s.setAch(true)} style={sx('flex:none;width:150px;border:0;border-radius:20px;padding:16px;display:flex;flex-direction:column;gap:4px;color:var(--ink);text-align:start;cursor:pointer;font-family:inherit')}>
      <span style={sx('font-size:12px;font-weight:700;color:var(--ink2)')}>{t('me.cardWeek')}</span>
      {g.weekPoints > 0 ? (
        <span style={sx('font-size:30px;font-weight:800;letter-spacing:var(--ls-h)')}><bdi dir="ltr">{fmtInt(lang, g.weekPoints)}</bdi> <span style={sx('font-size:15px;color:var(--mut)')}>{t('ptsUnit')}</span></span>
      ) : (
        <>
          <span style={sx('font-size:20px;font-weight:800;letter-spacing:var(--ls-t);margin-top:6px')}>{t('me.cardStart')}</span>
          <span style={sx('font-size:12px;color:var(--mut);font-weight:600;line-height:1.35')}>{t('me.cardStartSub')}</span>
        </>
      )}
      {g.weekPoints > 0 && sub && <span style={sx('font-size:12px;color:var(--mut);font-weight:600;display:flex;align-items:center;gap:5px')}><BadgeGlyph k="streak_4" size={10} on />{sub}</span>}
    </button>
  );
}

/** sheets + name editor, rendered once */
export function LbOverlays({ s }: { s: DashLb }) {
  return (
    <>
      <PointsHowSheet open={s.how} onClose={() => s.setHow(false)} />
      <AchievementsSheet open={s.ach} onClose={() => s.setAch(false)} g={s.g} />
      {s.learner && <EditModal kind={s.editName ? 'name' : null} learner={s.learner} onClose={() => { s.setEditName(false); s.lb.retry(); }} />}
    </>
  );
}
