'use client';
/**
 * Top-10 list (leaderboard-design.md §2.3–2.4): `<ol>` of LbRow + LbEmptySlot cards. Only an upward
 * movement is ever shown (↑N, green); no arrow, no red for anything else. Ranks below 10 and
 * participant counts are never rendered.
 */
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import type { LbAverage, LbRow } from '@/lib/mock/api/types';
import { fmtInt } from '@/lib/mock/format';
import { useLang } from '@/lib/mock/hooks/use-lang';
import { sx } from '@/lib/mock/sx';
import { Chevron } from '../landing/landing-phone-parts';
import { LbAvatar } from './lb-avatar';
import { EXAM_LABEL, fmtAvg } from './lb-format';

const CHIP = sx('padding:2px 8px;font-size:11px;background:var(--hover);color:var(--ink2)');

function Averages({ list }: { list: LbAverage[] }) {
  const t = useTranslations('leaderboard');
  if (!list.length) return null;
  return (
    <span className="m-lb-avg">
      {list.map((a) => (
        <span key={a.exam} style={sx('display:inline-flex;align-items:center;gap:5px')}>
          <span className="m-lb-avg__exam" lang="en" style={{ color: `var(--${a.exam})` }}>{EXAM_LABEL[a.exam]}</span>
          {a.status === 'value' ? <bdi dir="ltr">{fmtAvg(a)}</bdi>
            : <span className="m-pill" style={CHIP}>{t(a.status === 'new' ? 'chipNew' : 'chipPracticing')}</span>}
        </span>
      ))}
    </span>
  );
}

export function LbRowItem({ row, phone }: { row: LbRow; phone?: boolean }) {
  const t = useTranslations('leaderboard');
  const { lang } = useLang();
  const name = row.hidden || !row.name ? t('hidden') : row.name;
  const avgText = row.averages.map((a) => `${EXAM_LABEL[a.exam]} ${a.status === 'value' ? fmtAvg(a) : t(a.status === 'new' ? 'chipNew' : 'chipPracticing')}`).join(', ');
  const aria = [t('rowAria', { rank: row.rank, name, pts: row.points }), avgText, row.rankUp ? t('rankUpAria', { n: row.rankUp }) : '', row.isMe ? t('you') : ''].filter(Boolean).join(', ');
  const up = row.rankUp && row.rankUp > 0 ? <span className="m-lb-up" aria-hidden>↑<bdi dir="ltr">{row.rankUp}</bdi></span> : null;
  const pts = <bdi dir="ltr">{fmtInt(lang, row.points)}</bdi>;
  return (
    <li className={`m-lb-row${phone ? ' m-lb-row--phone' : ''}${row.isMe ? ' is-me' : ''}`} aria-label={aria}>
      <span className="m-lb-rank" aria-hidden><bdi dir="ltr">{row.rank}</bdi></span>
      <span aria-hidden style={sx('display:grid;place-items:center')}><LbAvatar rank={row.rank} initials={row.initials} hidden={row.hidden} size={phone ? 'sm' : 'md'} /></span>
      <span aria-hidden style={sx('min-width:0;display:flex;flex-direction:column')}>
        <span className="m-lb-name"><b>{name}</b>{row.isMe && <span className="m-pill m-pill--blue" style={sx('padding:2px 8px;font-size:11px;flex:none')}>{t('you')}</span>}</span>
        <Averages list={row.averages} />
      </span>
      {phone ? (
        <span className="m-lb-pts" aria-hidden>
          {up ? <><b>{pts} <span style={sx('font-size:11px;font-weight:700;color:var(--mut)')}>{t('ptsUnit')}</span></b>{up}</> : <><b>{pts}</b><span>{t('ptsUnit')}</span></>}
        </span>
      ) : (
        <>
          <span aria-hidden style={sx('min-width:28px;text-align:end')}>{up}</span>
          <span className="m-lb-pts" aria-hidden><b>{pts}</b><span>{t('ptsUnit')}</span></span>
        </>
      )}
    </li>
  );
}

export function LbSlot({ pos, phone, cta }: { pos: number; phone?: boolean; cta: { label: string; href: string } }) {
  const t = useTranslations('leaderboard');
  const link = <Link href={cta.href} className="m-lb-ghost">{cta.label}<Chevron size={7} w={2} /></Link>;
  return (
    <div className={`m-lb-slot${phone ? ' m-lb-slot--phone' : ''}`}>
      <span className="m-lb-rank" aria-hidden style={sx('color:var(--mut)')}><bdi dir="ltr">{pos}</bdi></span>
      <span aria-hidden style={{ ...sx('border-radius:50%;box-shadow:var(--inset);display:grid;place-items:center;color:var(--blue);font-weight:800;font-size:20px;justify-self:center'), width: phone ? 36 : 40, height: phone ? 36 : 40 }}>+</span>
      <span style={sx('min-width:0;display:flex;flex-direction:column;gap:4px')}>
        <span style={sx('font-size:14px;font-weight:700;color:var(--ink2)')}>{t('slot')}</span>
        {phone && link}
      </span>
      {!phone && link}
    </div>
  );
}

/** inset card instead of the list when the picked exam filter has nobody yet (§3.5 / §4.5) */
export function LbFilterEmpty({ text, cta }: { text: string; cta: { label: string; href: string } }) {
  return (
    <div style={sx('border-radius:16px;box-shadow:var(--inset);padding:18px;display:flex;flex-direction:column;gap:8px;align-items:flex-start')}>
      <span style={sx('font-size:15px;font-weight:700;color:var(--ink2)')}>{text}</span>
      <Link href={cta.href} className="m-lb-ghost">{cta.label}<Chevron size={7} w={2} /></Link>
    </div>
  );
}

function SkelRow({ phone }: { phone?: boolean }) {
  return (
    <li className={`m-lb-row${phone ? ' m-lb-row--phone' : ''}`} aria-hidden>
      <span className="m-skel" style={sx('height:14px;width:14px;justify-self:center')} />
      <span className="m-skel" style={{ ...sx('border-radius:50%;justify-self:center'), width: phone ? 36 : 40, height: phone ? 36 : 40 }} />
      <span className="m-skel" style={sx('height:14px;width:60%')} />
      {!phone && <span />}
      <span className="m-skel" style={sx('height:18px;width:36px')} />
    </li>
  );
}

/**
 * The list with its empty-slot cards. `slots` = how many "this spot is waiting" cards to add when
 * there are fewer than 10 rows (landing 3, dashboard 1).
 */
export function LbList({ rows, phone, plain, slots, slotCta, busy, skel, label }: {
  rows: LbRow[]; phone?: boolean; plain?: boolean; slots: number; slotCta: { label: string; href: string };
  busy?: boolean; skel?: boolean; label: string;
}) {
  const n = rows.length < 10 ? Math.min(slots, 10 - rows.length) : 0;
  return (
    <div className={`${plain ? '' : 'm-rows '}${busy && !skel ? 'm-lb-busy' : ''}`} aria-busy={busy || undefined} style={plain ? undefined : sx('padding-bottom:0')}>
      {rows.length > 0 && (
        <ol className="m-lb-list" aria-label={label}>
          {skel ? rows.map((r) => <SkelRow key={r.rank + (r.name ?? '') + r.points} phone={phone} />) : rows.map((r, i) => <LbRowItem key={`${r.rank}-${i}`} row={r} phone={phone} />)}
        </ol>
      )}
      {n > 0 && (
        <div style={rows.length && plain ? sx('border-top:1px solid var(--line);padding:6px 0') : sx('padding:6px 0')}>
          {Array.from({ length: n }, (_, i) => <LbSlot key={i} pos={rows.length + 1 + i} phone={phone} cta={slotCta} />)}
        </div>
      )}
    </div>
  );
}
