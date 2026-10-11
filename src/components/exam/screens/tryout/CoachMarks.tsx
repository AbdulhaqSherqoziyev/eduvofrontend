'use client';
/** 4 coach-mark bubbles, first visit only, each with Next / Skip (design G5 + H1). */
import type { CSSProperties } from 'react';
import { useT } from '@/lib/exam/engine/context';
import type { TextKey } from '@/lib/exam/i18n';
import { Btn } from '../../shell/ui';

const STEPS: { key: TextKey; pos: CSSProperties }[] = [
  { key: 'precheck.tour_timer', pos: { top: 112, left: '50%', transform: 'translateX(-50%)' } },
  { key: 'precheck.tour_navigator', pos: { bottom: 84, left: 22 } },
  { key: 'precheck.tour_flag', pos: { bottom: 84, right: 300 } },
  { key: 'precheck.tour_finish', pos: { bottom: 84, right: 22 } },
];

export function CoachMarks({ step, onNext, onSkip }: { step: number; onNext: () => void; onSkip: () => void }) {
  const { t } = useT();
  const st = STEPS[step];
  if (!st) return null;
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'var(--x-overlay)', zIndex: 35 }}>
      <div role="dialog" aria-live="polite" className="x-pop" style={{ position: 'absolute', width: 260, background: 'var(--x-panel)', border: '1px solid var(--x-line)', borderRadius: 14, padding: 16, display: 'flex', flexDirection: 'column', gap: 12, ...st.pos }}>
        <div style={{ fontSize: 14, lineHeight: 1.5 }}>{t(st.key)}</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: 'var(--x-muted)', fontVariantNumeric: 'tabular-nums' }}>{step + 1} / {STEPS.length}</span>
          <span style={{ display: 'flex', gap: 8 }}>
            <Btn h={34} onClick={onSkip} style={{ fontSize: 13 }}>{t('chrome.skip')}</Btn>
            <Btn h={34} variant="accent" autoFocus onClick={onNext} style={{ fontSize: 13 }}>{t('chrome.next')}</Btn>
          </span>
        </div>
      </div>
    </div>
  );
}

export const TOUR_STEPS = STEPS.length;
