'use client';
/**
 * Sticky footer of the Speaking intro (spec §1.2): privacy line right above Start (M15), Start (accent 52),
 * "Make a test recording first" link when the trial is missing, then "Take Speaking later" (+ the existing
 * `intro.speaking_later` hint). Top border only when the part above scrolls.
 */
import { Lock } from 'lucide-react';
import type { ReactNode } from 'react';
import { useT } from '@/lib/exam/engine/context';
import { Btn } from '../../shell/ui';

const link = { background: 'none', border: 'none', padding: 0, color: 'var(--x-link)', cursor: 'pointer' } as const;

export function StickyFooter({ border, period, onPrivacy, canLater, onLater, trialNeeded, onTrial, start }: {
  border: boolean; period: string; onPrivacy: () => void; canLater: boolean; onLater: () => void; trialNeeded: boolean; onTrial: () => void;
  start: { disabled: boolean; label: ReactNode; onClick: () => void };
}) {
  const { t } = useT();
  return (
    <div style={{ flexShrink: 0, padding: '16px 40px 28px', borderTop: border ? '1px solid var(--x-line)' : '1px solid transparent', background: 'var(--x-panel)', display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: 13, color: 'var(--x-sub)', lineHeight: 1.45 }}>
        <Lock size={14} color="var(--x-muted)" style={{ marginTop: 2, flexShrink: 0 }} aria-hidden />
        <span>{t('speaking.privacy_line', { period })} <button type="button" onClick={onPrivacy} style={{ ...link, fontSize: 13, fontWeight: 700 }}>{t('speaking.privacy_more')}</button></span>
      </div>
      <Btn h={52} variant="accent" block disabled={start.disabled} onClick={start.onClick} style={{ fontSize: 15.5, borderRadius: 14 }}>{start.label}</Btn>
      {trialNeeded && <button type="button" onClick={onTrial} style={{ ...link, alignSelf: 'center', fontSize: 12, fontWeight: 700 }}>{t('speaking.trial_needed')}</button>}
      {canLater && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, textAlign: 'center' }}>
          <button type="button" onClick={onLater} style={{ ...link, fontSize: 14, fontWeight: 700 }}>{t('speaking.do_later')}</button>
          <span style={{ fontSize: 12.5, color: 'var(--x-muted)' }}>{t('intro.speaking_later')}</span>
        </div>
      )}
    </div>
  );
}
