'use client';
/**
 * "Speaking is saved for later" (spec §1.2): no confirmation (reversible), one accent button to the results
 * (L/R/W are ready; Speaking stays PENDING — contract §4 "Speaking'ni keyinroq"). The choice is used up here:
 * reopening the attempt later ("Take Speaking" on the result page) lands on the normal intro.
 */
import { Clock } from 'lucide-react';
import { useExam, useT } from '@/lib/exam/engine/context';
import { setSpeakingLater } from '@/lib/exam/speaking/local';
import { Btn } from '../../shell/ui';

export function LaterCard({ b2c, until, expired }: { b2c: boolean; until?: string | null; expired?: boolean }) {
  const { s, dispatch } = useExam();
  const { t } = useT();
  const body = expired ? t('speaking.later_expired') : until ? t('speaking.later_body_until', { date: until }) : b2c ? t('speaking.later_body_b2c') : null;
  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: 520, background: 'var(--x-panel)', border: '1px solid var(--x-line)', borderRadius: 22, padding: 32, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, textAlign: 'center' }}>
        <Clock size={32} color="var(--x-muted)" aria-hidden />
        {!expired && <div style={{ fontSize: 22, fontWeight: 800 }}>{t('speaking.later_title')}</div>}
        {body && <div style={{ fontSize: 15, color: 'var(--x-sub)', lineHeight: 1.55 }}>{body}</div>}
        <Btn h={48} variant="accent" autoFocus onClick={() => { setSpeakingLater(s.attemptId, false); dispatch({ t: 'PHASE', phase: 'complete' }); }} style={{ fontSize: 15, padding: '0 26px', marginTop: 6 }}>{t('chrome.view_results')}</Btn>
      </div>
    </div>
  );
}
