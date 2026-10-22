'use client';
/**
 * "How are points counted?" (leaderboard-design.md §2.8, §1.1 + §13.3/§13.8): BottomSheet on phones,
 * Modal (520) on ≥520. Section names stay English exam terms (lang="en").
 */
import { useTranslations } from 'next-intl';
import { useSpeakingLive } from '@/lib/mock/hooks/use-speaking-live';
import { PHONE_QUERY, useMedia } from '@/lib/mock/hooks/use-media';
import { sx } from '@/lib/mock/sx';
import { BottomSheet } from '../bottom-sheet';
import { Modal } from '../modal';

const IELTS: Array<[string, number]> = [['Listening', 20], ['Reading', 30], ['Writing', 30]];
const SAT: Array<[string, number]> = [['Reading and Writing', 32], ['Math', 35]];
const EYEBROW = sx('font-size:11px;font-weight:800;letter-spacing:var(--ls-eyebrow-sm);padding:14px 8px 6px');

function HowBody() {
  const t = useTranslations('leaderboard.how');
  const live = useSpeakingLive();
  const ielts: Array<[string, number]> = live ? [...IELTS, ['Speaking', 10]] : IELTS;
  const group = (name: string, color: string, rows: Array<[string, number]>) => (
    <>
      <tr><th colSpan={2} lang="en" style={{ ...EYEBROW, color }}>{name}</th></tr>
      {rows.map(([k, v]) => <tr key={name + k}><td lang="en">{k}</td><td style={sx('text-align:end;font-weight:800;color:var(--ink)')}><bdi dir="ltr">{v}</bdi></td></tr>)}
      <tr><td>{t('fullBonus')}</td><td style={sx('text-align:end;font-weight:800;color:var(--ink)')}><bdi dir="ltr">+40</bdi></td></tr>
    </>
  );
  return (
    <div style={sx('display:flex;flex-direction:column;gap:16px')}>
      <p style={sx('margin:0;font-size:15px;line-height:1.6;color:var(--ink2)')}>{t('intro')}</p>
      <table className="m-table">
        <thead><tr><th>{t('colWhat')}</th><th style={sx('text-align:end')}>{t('colPts')}</th></tr></thead>
        <tbody>
          {group('IELTS', 'var(--ielts)', ielts)}
          {group('SAT', 'var(--sat)', SAT)}
        </tbody>
      </table>
      <table className="m-table">
        <thead><tr><th>{t('extra')}</th><th style={sx('text-align:end')}>{t('colPts')}</th></tr></thead>
        <tbody>
          <tr><td>{t('growthFull')}</td><td style={sx('text-align:end;font-weight:800;color:var(--ink);white-space:nowrap')}><bdi dir="ltr">+30</bdi></td></tr>
          <tr><td>{t('growthSection')}</td><td style={sx('text-align:end;font-weight:800;color:var(--ink);white-space:nowrap')}><bdi dir="ltr">+10</bdi></td></tr>
          <tr><td>{t('streakBonus')}</td><td style={sx('text-align:end;font-weight:800;color:var(--ink);white-space:nowrap')}><bdi dir="ltr">+20</bdi></td></tr>
        </tbody>
      </table>
      <ul style={sx('margin:0;padding-inline-start:20px;display:flex;flex-direction:column;gap:8px;font-size:14px;line-height:1.55;color:var(--ink2)')}>
        {(['rule1', 'rule2', 'rule3', 'rule4', 'rule5', 'rule6', 'rule7', 'rule8'] as const).map((k) => <li key={k}>{t(k)}</li>)}
      </ul>
    </div>
  );
}

export function PointsHowSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const t = useTranslations('leaderboard.how');
  const tl = useTranslations('leaderboard');
  const isPhone = useMedia(PHONE_QUERY);
  if (isPhone) return <BottomSheet open={open} title={t('title')} onClose={onClose}><HowBody /><span style={sx('font-size:12px;color:var(--mut);font-weight:600')}>{tl('resetWeek')}</span></BottomSheet>;
  return (
    <Modal open={open} onClose={onClose} label={t('title')} width={520}>
      <span style={sx('font-size:20px;font-weight:800')}>{t('title')}</span>
      <div style={sx('max-height:min(62vh,640px);overflow-y:auto;margin:0 -8px;padding:0 8px')}><HowBody />
        <p style={sx('margin:12px 0 0;font-size:12px;color:var(--mut);font-weight:600')}>{tl('resetWeek')}</p>
      </div>
      <button type="button" className="m-btn m-btn--soft" onClick={onClose} style={sx('align-self:flex-end;height:44px')}>{t('done')}</button>
    </Modal>
  );
}
