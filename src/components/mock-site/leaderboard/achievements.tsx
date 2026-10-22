'use client';
/**
 * Level / streak / badges (leaderboard-design.md §1.6–1.8, §2.9). Positive only: a locked badge is
 * "not yet" (inset, muted), never a negative mark. Glyphs are simple geometric shapes (README).
 */
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { BadgeKey, Gamification } from '@/lib/mock/api/types';
import { fmtDayMonthLong } from '@/lib/mock/format';
import { useLang } from '@/lib/mock/hooks/use-lang';
import { PHONE_QUERY, useMedia } from '@/lib/mock/hooks/use-media';
import { sx } from '@/lib/mock/sx';
import { BottomSheet } from '../bottom-sheet';
import { Modal } from '../modal';
import { awardMonth, awardWeekRange } from './lb-format';

export const BADGES: BadgeKey[] = ['first_section', 'first_full', 'five_full', 'ielts_half', 'sat_50', 'streak_4', 'week_champ', 'month_champ'];

export function BadgeGlyph({ k, size = 32, on = true }: { k: BadgeKey; size?: number; on?: boolean }) {
  const c = on ? 'var(--blue)' : 'var(--mut)';
  const p = { width: size, height: size, viewBox: '0 0 32 32', 'aria-hidden': true as const, style: { color: c, display: 'block' } };
  switch (k) {
    case 'first_section': return <svg {...p}><circle cx="16" cy="16" r="11" fill="currentColor" /></svg>;
    case 'first_full': return <svg {...p}><circle cx="16" cy="16" r="10" fill="none" stroke="currentColor" strokeWidth="4" /></svg>;
    case 'five_full': return <svg {...p}><circle cx="11" cy="16" r="7" fill="currentColor" opacity=".55" /><circle cx="21" cy="16" r="7" fill="currentColor" /></svg>;
    case 'ielts_half': return <svg {...p}><path d="M16 5 28 26H4z" fill="currentColor" /></svg>;
    case 'sat_50': return <svg {...p}><path d="M16 4 27 15H5z" fill="currentColor" /><path d="M16 14 27 25H5z" fill="currentColor" opacity=".55" /></svg>;
    case 'streak_4': return <svg {...p}><path d="M16 3 28 16 16 29 4 16z" fill="currentColor" /></svg>;
    case 'week_champ': return <svg {...p}><path d="M4 24 6 9l6 7 4-10 4 10 6-7 2 15z" fill="currentColor" /></svg>;
    case 'month_champ': return <svg {...p}><path d="M4 22 6 7l6 7 4-10 4 10 6-7 2 15z" fill="currentColor" /><rect x="5" y="25" width="22" height="3" rx="1.5" fill="currentColor" /></svg>;
  }
}

/** level chip (all levels the same neutral blue-on-inset, §1.6) */
export function LevelChip({ k }: { k: NonNullable<Gamification['level']['key']> }) {
  const t = useTranslations('leaderboard.ach');
  return <span className="m-chip" style={sx('color:var(--blue);padding:4px 10px;font-size:12px;font-weight:800')}>{t(`lvl.${k}`)}</span>;
}

export function levelProgress(g: Gamification) {
  const { min, nextMin } = g.level;
  if (nextMin == null) return 100;
  return Math.max(0, Math.min(100, ((g.lifetimePoints - min) / Math.max(1, nextMin - min)) * 100));
}

/** streak headline + this-week line (§1.7, §8.3) */
type T = (key: string, values?: Record<string, string | number>) => string;
export function streakLines(g: Gamification, t: T): { head: string; sub: string | null } {
  const s = g.streak;
  if (s.status === 'none') return { head: t('streakNone'), sub: null };
  if (s.status === 'broken') return { head: t('streakBroken'), sub: null };
  const head = t('streak', { n: s.weeks });
  if (s.status === 'rest') return { head, sub: t('restUsed') };
  const week = s.thisWeekSections >= 2 ? t('weekDone') : s.thisWeekSections === 1 ? t('weekOne') : t('weekNeed');
  return { head, sub: s.restAvailable ? `${week} · ${t('restAvail')}` : week };
}

function Body({ g }: { g: Gamification }) {
  const t = useTranslations('leaderboard.ach');
  const tb = useTranslations('leaderboard.badge');
  const tm = useTranslations('leaderboard.me');
  const { lang } = useLang();
  const [pick, setPick] = useState<BadgeKey | null>(null);
  const st = streakLines(g, t);
  const byKey = new Map(g.badges.map((b) => [b.key, b]));
  const picked = pick ? byKey.get(pick) : undefined;
  const awards = picked?.awards ?? [];
  const lastAward = awards[awards.length - 1];
  const descArgs: Record<string, string> = {
    range: pick === 'week_champ' && lastAward ? awardWeekRange(lang, lastAward) : '',
    month: pick === 'month_champ' && lastAward ? awardMonth(lang, lastAward) : '',
  };
  return (
    <div style={sx('display:flex;flex-direction:column;gap:18px')}>
      {/* level */}
      <div style={sx('border-radius:20px;box-shadow:var(--raise-sm);padding:16px;display:flex;flex-direction:column;gap:10px')}>
        <span className="m-eyebrow" style={sx('font-size:11px;color:var(--mut)')}>{t('level')}</span>
        {g.level.key ? (
          <>
            <div style={sx('display:flex;align-items:center;gap:10px;flex-wrap:wrap')}>
              <LevelChip k={g.level.key} />
              <span style={sx('font-size:13px;font-weight:700;color:var(--ink2)')}>
                {g.level.nextKey && g.level.nextMin != null ? t('levelNext', { level: t(`lvl.${g.level.nextKey}`), n: g.level.nextMin - g.lifetimePoints }) : t('levelMax')}
              </span>
            </div>
            <div className="m-bar"><span style={{ width: `${levelProgress(g)}%` }} /></div>
            <span style={sx('font-size:12px;font-weight:700;color:var(--mut)')}>{t('lifetime', { n: g.lifetimePoints })}</span>
          </>
        ) : <span style={sx('font-size:14px;font-weight:700;color:var(--ink2)')}>{tm('zero')}</span>}
      </div>
      {/* streak */}
      <div style={sx('display:flex;gap:12px;align-items:flex-start')}>
        <BadgeGlyph k="streak_4" size={22} on={g.streak.status === 'active' || g.streak.status === 'rest'} />
        <span style={sx('display:flex;flex-direction:column;gap:2px')}>
          <b style={sx('font-size:15px')}>{st.head}</b>
          {st.sub && <span style={sx('font-size:13px;color:var(--ink2);line-height:1.5')}>{st.sub}</span>}
        </span>
      </div>
      {/* badges */}
      <div style={sx('display:flex;flex-direction:column;gap:10px')}>
        <span style={sx('font-size:14px;font-weight:800')}>{t('badges')}</span>
        <div className="m-lb-badges">
          {BADGES.map((k) => {
            const b = byKey.get(k);
            const on = !!b?.earnedAt;
            const count = b?.awards?.length ?? 0;
            return (
              <button key={k} type="button" className={`m-lb-tile ${on ? 'is-on' : 'is-off'}`} aria-pressed={pick === k} onClick={() => setPick(pick === k ? null : k)}>
                <BadgeGlyph k={k} on={on} />
                <small>{tb(`${k}.name`)}</small>
                {count > 1 && <span className="m-pill" style={sx('position:absolute;top:4px;inset-inline-end:4px;padding:1px 6px;font-size:10px;background:var(--hover);color:var(--ink2)')}><bdi dir="ltr">×{count}</bdi></span>}
              </button>
            );
          })}
        </div>
        {pick && (
          <div aria-live="polite" style={sx('border-radius:16px;box-shadow:var(--inset);padding:14px 16px;display:flex;flex-direction:column;gap:6px')}>
            <b style={sx('font-size:15px')}>{tb(`${pick}.name`)}</b>
            {picked?.earnedAt ? (
              <>
                <span style={sx('font-size:14px;color:var(--ink2);line-height:1.5')}>{tb(`${pick}.desc`, descArgs)}</span>
                <span style={sx('font-size:12px;font-weight:700;color:var(--mut)')}>{t('earnedOn', { date: fmtDayMonthLong(lang, picked.earnedAt) })}</span>
                {awards.length > 1 && (
                  <ul style={sx('margin:4px 0 0;padding-inline-start:18px;font-size:13px;color:var(--ink2);display:flex;flex-direction:column;gap:2px')}>
                    {awards.map((a) => <li key={a.at}>{pick === 'month_champ' ? awardMonth(lang, a) : awardWeekRange(lang, a)}</li>)}
                  </ul>
                )}
              </>
            ) : <span style={sx('font-size:14px;color:var(--ink2);line-height:1.5')}>{t('howToGet', { rule: tb(`${pick}.rule`) })}</span>}
          </div>
        )}
      </div>
    </div>
  );
}

export function AchievementsSheet({ open, onClose, g }: { open: boolean; onClose: () => void; g: Gamification | null }) {
  const tm = useTranslations('leaderboard.me');
  const th = useTranslations('leaderboard.how');
  const isPhone = useMedia(PHONE_QUERY);
  if (!g) return null;
  if (isPhone) return <BottomSheet open={open} title={tm('achievements')} onClose={onClose}><Body g={g} /></BottomSheet>;
  return (
    <Modal open={open} onClose={onClose} label={tm('achievements')} width={520}>
      <span style={sx('font-size:20px;font-weight:800')}>{tm('achievements')}</span>
      <div style={sx('max-height:min(66vh,680px);overflow-y:auto;margin:0 -8px;padding:4px 8px 8px')}><Body g={g} /></div>
      <button type="button" className="m-btn m-btn--soft" onClick={onClose} style={sx('align-self:flex-end;height:44px')}>{th('done')}</button>
    </Modal>
  );
}
