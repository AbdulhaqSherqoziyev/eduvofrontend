'use client';
/**
 * Timer pill + warning state machine (design v2 G1, Sevara T25–T27):
 * normal → warn10 (3×600 ms amber pulse + 5 s tooltip) → warn5 (steady red,
 * forced visible, Hide disabled, 5 s tooltip) → 0 ("Time is up").
 * No sound, no blinking, nothing extra in the last 60 s.
 */
import { Clock } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { fmtClock } from '@/lib/exam/format';
import { useExam, useT } from '@/lib/exam/engine/context';

export type WarnTip = 'warn10' | 'warn5' | null;

/** `warn10:false` — SAT has no official 10-minute warning (sat.md §4, timer_warnings:[300]). */
export function useTimerWarn(remaining: number | null, opts: { warn10?: boolean } = {}): { pulse: boolean; tip: WarnTip } {
  const warn10 = opts.warn10 !== false;
  const prev = useRef<number | null>(null);
  const [pulse, setPulse] = useState(false);
  const [tip, setTip] = useState<WarnTip>(null);
  useEffect(() => {
    const p = prev.current;
    prev.current = remaining;
    if (remaining == null || p == null) return;
    const timers: number[] = [];
    if (warn10 && p > 600 && remaining <= 600 && remaining > 300) {
      setPulse(true);
      setTip('warn10');
      timers.push(window.setTimeout(() => setPulse(false), 1800), window.setTimeout(() => setTip(null), 5000));
    } else if (p > 300 && remaining <= 300 && remaining > 0) {
      setTip('warn5');
      timers.push(window.setTimeout(() => setTip(null), 5000));
    }
    return () => { if (timers.length) { /* keep running: tooltips must finish their 5 s */ } };
  }, [remaining, warn10]);
  return { pulse, tip };
}

export function TimerPill({ remaining, pulse, noWarn }: { remaining: number | null; pulse: boolean; noWarn?: boolean }) {
  const { s, setUi } = useExam();
  const { t } = useT();
  const warn5 = !noWarn && remaining != null && remaining <= 300 && remaining > 0;
  const zero = remaining != null && remaining <= 0;
  const hidden = s.ui.timerHidden && !warn5 && !zero;
  const fg = warn5 ? 'var(--x-err-fg)' : 'var(--x-ink)';
  const secs = Math.max(0, Math.ceil(remaining ?? 0));
  const aria = t('timer.aria', { min: Math.floor(secs / 60), sec: secs % 60 });

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, height: 38, padding: '0 14px 0 0', borderRadius: 19, background: warn5 ? 'var(--x-err-bg)' : 'var(--x-tile)', border: `1.5px solid ${warn5 ? 'var(--x-err-fg)' : 'transparent'}` }}
      className={pulse ? 'x-timer-pulse' : undefined}>
      <div style={{ width: 132, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, color: fg }} aria-label={hidden ? t('chrome.timer_hidden') : aria}>
        {hidden ? (
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--x-muted)' }}>{t('chrome.timer_hidden')}</span>
        ) : zero ? (
          <span style={{ fontSize: 14, fontWeight: 800 }}>{t('timer.time_is_up')}</span>
        ) : (
          <>
            <Clock size={15} aria-hidden />
            <span style={{ fontSize: 17, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{remaining == null ? '--:--' : fmtClock(remaining)}</span>
          </>
        )}
      </div>
      <span style={{ width: 1, height: 16, background: 'var(--x-line)' }} />
      <button type="button" onClick={() => setUi({ timerHidden: !s.ui.timerHidden })} disabled={warn5 || zero}
        title={warn5 ? t('chrome.timer_locked_tip') : undefined}
        style={{ background: 'none', border: 'none', padding: 0, fontSize: 12.5, fontWeight: 700, color: 'var(--x-link)', opacity: warn5 || zero ? 0.45 : 1, whiteSpace: 'nowrap' }}>
        {s.ui.timerHidden && !warn5 ? t('chrome.timer_show') : t('chrome.timer_hide')}
      </button>
    </div>
  );
}

/** Tooltip under the pill — rendered below any banner so neither covers the other (H4). */
export function TimerTip({ tip }: { tip: WarnTip }) {
  const { bi } = useT();
  if (!tip) return null;
  const pair = bi(tip === 'warn10' ? 'timer.warn10' : 'timer.warn5');
  return (
    <div role="status" aria-live="polite" className="x-fade-in"
      style={{ position: 'absolute', top: 8, left: '50%', transform: 'translateX(-50%)', zIndex: 15, background: 'var(--x-panel)', border: '1px solid var(--x-line)', borderRadius: 10, padding: '8px 12px', boxShadow: 'var(--x-menu-shadow)', textAlign: 'center' }}>
      <span style={{ position: 'absolute', top: -6, left: '50%', marginLeft: -6, width: 12, height: 12, background: 'var(--x-panel)', borderLeft: '1px solid var(--x-line)', borderTop: '1px solid var(--x-line)', transform: 'rotate(45deg)' }} />
      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--x-ink)' }}>{pair[0]}</div>
      <div style={{ fontSize: 12, color: 'var(--x-muted)' }}>{pair[1]}</div>
    </div>
  );
}
