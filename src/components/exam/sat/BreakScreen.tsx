'use client';
/**
 * Scheduled break between R&W and Math (design q.113–121 + G11/H6, sat.md §4):
 * dark page, "SCHEDULED BREAK", 40/800 countdown from the server deadline,
 * `intro.break_body`, white "Resume testing" (early resume — nav.early_finish).
 * At 0 the engine's deadline watcher submits the break and Math Module 1 starts
 * by itself through SatHandoff (Bluebook: no "Start Math" screen after the break).
 */
import { useState } from 'react';
import { useServerNow } from '@/lib/exam/engine/clock';
import { useExam, useT } from '@/lib/exam/engine/context';
import { fmtClock, parseIso } from '@/lib/exam/format';
import { Banners, TabToast } from '../shell/Banners';
import { PreviewFinish, PreviewFinishModal } from '../shell/PreviewFinish';
import { Bi, Spinner } from '../shell/ui';

export function BreakScreen() {
  const { s, stage, stageCfg, submit } = useExam();
  const { t, bi } = useT();
  const now = useServerNow(250);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(false);
  const dl = parseIso(stage?.deadlineAt);
  const left = dl != null ? Math.max(0, (dl - now) / 1000) : null;
  const canResume = stageCfg?.nav?.early_finish !== false;
  const resume = async () => {
    setBusy(true);
    setErr(false);
    const ok = await submit('user');
    if (!ok) { setErr(true); setBusy(false); }
  };
  return (
    <>
      <Banners />
      <div style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 22, background: '#1E2A3A', color: '#fff', padding: 24 }}>
        <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: 1.2, color: '#9DB8F5' }}>{t('sat.break_label')}</div>
        <div role="timer" aria-label={left == null ? undefined : t('timer.aria', { min: Math.floor(left / 60), sec: Math.floor(left % 60) })}
          style={{ fontSize: 40, fontWeight: 800, letterSpacing: -1, fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
          {left == null ? '--:--' : fmtClock(left)}
        </div>
        <div style={{ fontSize: 15, color: '#AEB9CB', maxWidth: 460, textAlign: 'center', lineHeight: 1.55 }}>{t('intro.break_body')}</div>
        {canResume && (
          <button type="button" onClick={() => void resume()} disabled={busy || s.submitting}
            style={{ height: 48, minWidth: 180, border: 'none', borderRadius: 14, background: '#fff', color: '#1E2A3A', fontSize: 15, fontWeight: 800, padding: '0 28px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            {busy ? <Spinner /> : t('chrome.resume_testing')}
          </button>
        )}
        {err && <div style={{ maxWidth: 460 }}><Bi pair={bi('errors.server')} size={13.5} center color="#FFD27A" /></div>}
        <TabToast />
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, display: 'flex', justifyContent: 'flex-end', padding: '12px 22px' }}><PreviewFinish onDark /></div>
        {s.modal === 'preview_finish' && <PreviewFinishModal />}
      </div>
    </>
  );
}
