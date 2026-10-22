'use client';
/** LbControls (§2.5), LbCountdown (§2.6), LbChampions (§2.7). */
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import type { LbChampion, LbExam, LbPeriod } from '@/lib/mock/api/types';
import { sx } from '@/lib/mock/sx';
import { Segmented } from '../segmented';
import { LbAvatar } from './lb-avatar';
import { remaining } from './lb-format';

const EXAMS: LbExam[] = ['all', 'ielts', 'sat'];

export function PeriodSeg({ value, onChange, phone }: { value: LbPeriod; onChange: (p: LbPeriod) => void; phone?: boolean }) {
  const t = useTranslations('leaderboard');
  return (
    <Segmented label={t('periodLabel')} value={value} onChange={onChange} grid={phone}
      btnStyle={phone ? sx('white-space:nowrap;font-size:13px') : sx('white-space:nowrap')}
      items={[{ key: 'week', label: t('tabWeek') }, { key: 'month', label: t('tabMonth') }]} />
  );
}

/** desktop: small Segmented (Dashboard progress tabs size); phone: Progress-page pill row */
export function ExamFilter({ value, onChange, phone }: { value: LbExam; onChange: (e: LbExam) => void; phone?: boolean }) {
  const t = useTranslations('leaderboard');
  const label = (e: LbExam) => (e === 'all' ? t('filterAll') : <span lang="en">{e.toUpperCase()}</span>);
  if (phone) {
    return (
      <div role="group" aria-label={t('filterLabel')} className="m-noscroll" style={sx('display:flex;gap:6px;overflow-x:auto;padding:4px 2px 6px;margin:-4px -2px -6px')}>
        {EXAMS.map((e) => <button key={e} type="button" className="m-lb-pill" aria-pressed={value === e} onClick={() => onChange(e)}>{label(e)}</button>)}
      </div>
    );
  }
  return (
    <Segmented label={t('filterLabel')} value={value} onChange={onChange} style={sx('padding:4px;border-radius:12px')}
      btnStyle={sx('height:34px;padding:0 12px;border-radius:9px;font-size:12px;white-space:nowrap')}
      items={EXAMS.map((e) => ({ key: e, label: label(e) }))} />
  );
}

/** "● New week in 3 days 7 hours" — refreshed every 60 s from the server clock; `newWeek` line on day 1 */
export function LbCountdown({ period, newPeriod, endsAt, serverNow, receivedAt, reset, size = 13 }: {
  period: LbPeriod; newPeriod: boolean; endsAt: string; serverNow: string; receivedAt: number; reset?: boolean; size?: number;
}) {
  const t = useTranslations('leaderboard');
  const [, tick] = useState(0);
  useEffect(() => { const id = window.setInterval(() => tick((x) => x + 1), 60_000); return () => window.clearInterval(id); }, []);
  const r = remaining(endsAt, serverNow, receivedAt);
  const w = period === 'week' ? 'Week' : 'Month';
  const text = r.d >= 1 ? t(`count${w}`, { d: r.d, h: r.h }) : r.h >= 1 ? t(`count${w}H`, { h: r.h }) : t(`count${w}M`, { m: Math.max(1, r.m) });
  // §13.13: the line is written for a new week; the month tab shows only the countdown
  const firstDay = newPeriod && period === 'week';
  return (
    <div style={sx('display:flex;flex-direction:column;gap:4px')}>
      <span style={{ ...sx('display:flex;align-items:center;gap:8px;font-weight:700;color:var(--ink2)'), fontSize: size }}><span className="m-lb-dot" aria-hidden />{text}</span>
      {firstDay && <span style={sx('font-size:12px;font-weight:700;color:var(--ink2);padding-inline-start:16px')}>{t('newWeek')}</span>}
      {reset && <span style={sx('font-size:12px;font-weight:600;color:var(--mut);padding-inline-start:16px;line-height:1.5')}>{t(period === 'week' ? 'resetWeek' : 'resetMonth')}</span>}
    </div>
  );
}

export function LbChampions({ list, period, scroll, stack }: { list: LbChampion[]; period: LbPeriod; scroll?: boolean; stack?: boolean }) {
  const t = useTranslations('leaderboard');
  if (!list.length) return null;
  return (
    <div style={sx('display:flex;flex-direction:column;gap:10px')}>
      <span style={sx('font-size:14px;font-weight:800')}>{t(period === 'week' ? 'championsWeek' : 'championsMonth')}</span>
      <ul className={scroll ? 'm-lb-champs m-lb-champs--scroll' : stack ? 'm-lb-champs m-lb-champs--stack' : 'm-lb-champs'} style={sx('list-style:none;margin:0;padding-inline-start:0')}>
        {list.map((c) => {
          const name = c.hidden || !c.name ? t('hidden') : c.name;
          return (
            <li key={c.rank + name} className="m-lb-champ" aria-label={t('rowAria', { rank: c.rank, name, pts: c.points })}>
              <span aria-hidden><LbAvatar rank={c.rank} initials={c.initials} hidden={c.hidden} size="xs" /></span>
              <span aria-hidden style={sx('min-width:0;display:flex;flex-direction:column;gap:2px')}>
                <b>{name}</b>
                <span>{t('pts', { n: c.points })}</span>
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
