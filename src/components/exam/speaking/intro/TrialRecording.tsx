'use client';
/**
 * 10-second test recording before Speaking (spec §1.2, M3): never uploaded or kept. ok → "Your voice is
 * clear" + Play back (no autoplay) and Start unlocks; quiet/loud → warn tile + Record again; after
 * 3 quiet tries Start unlocks anyway with a soft note (never a dead end).
 */
import { CheckCircle } from 'lucide-react';
import { forwardRef, useEffect, useState } from 'react';
import { useT } from '@/lib/exam/engine/context';
import { useLevelTest } from '@/lib/exam/speaking/use-level-test';
import { Bi, Btn } from '../../shell/ui';

export const TrialRecording = forwardRef<HTMLButtonElement, { onPass: (soft: boolean) => void }>(function TrialRecording({ onPass }, ref) {
  const { t, bi } = useT();
  const lt = useLevelTest(10, 24);
  const [quiet, setQuiet] = useState(0);
  useEffect(() => {
    if (lt.verdict === 'ok') onPass(false);
    else if (lt.verdict === 'quiet') setQuiet((n) => n + 1);
  }, [lt.verdict]); // eslint-disable-line react-hooks/exhaustive-deps
  const soft = quiet >= 3;
  useEffect(() => { if (soft) onPass(true); }, [soft]); // eslint-disable-line react-hooks/exhaustive-deps
  const bad = lt.verdict === 'quiet' || lt.verdict === 'loud';
  const label = lt.recording ? t('precheck.mic_recording', { s: lt.left }) : bad || lt.err ? t('speaking.record_again') : t('speaking.trial_start');

  return (
    <section id="sp-trial" aria-labelledby="sp-trial-h" style={{ background: 'var(--x-tile)', borderRadius: 14, padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div id="sp-trial-h" style={{ fontSize: 15, fontWeight: 800 }}>{t('speaking.trial_title')}</div>
      <div style={{ fontSize: 13, color: 'var(--x-sub)', lineHeight: 1.5 }}>{t('speaking.trial_body')}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <Btn ref={ref} h={40} disabled={lt.recording} onClick={() => void lt.start()} style={{ fontSize: 13, fontVariantNumeric: 'tabular-nums' }}>{label}</Btn>
        <div aria-hidden style={{ flex: 1, height: 28, display: 'flex', alignItems: 'center', gap: 3 }}>
          {lt.bars.map((b, i) => <div key={i} style={{ flex: 1, borderRadius: 2, height: 4 + Math.round(b * 22), background: lt.recording || lt.verdict === 'ok' ? 'var(--x-accent)' : 'var(--x-line)' }} />)}
        </div>
      </div>
      {lt.verdict === 'ok' && !lt.recording && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13.5, fontWeight: 700, color: 'var(--x-ok-fg)' }}><CheckCircle size={16} aria-hidden />{t('speaking.trial_ok')}</span>
          <Btn h={36} onClick={lt.play} style={{ fontSize: 13 }}>{t('chrome.play_back')}</Btn>
        </div>
      )}
      {bad && !lt.recording && (
        <div style={{ background: 'var(--x-warn-bg)', borderRadius: 10, padding: '8px 12px' }}>
          <Bi pair={bi(lt.verdict === 'loud' ? 'speaking.level_loud' : 'speaking.level_quiet')} size={13} color="var(--x-warn-fg)" />
        </div>
      )}
      {soft && lt.verdict === 'quiet' && !lt.recording && <div style={{ fontSize: 12, color: 'var(--x-muted)' }}>{t('speaking.trial_soft_pass')}</div>}
      {lt.err && (
        <div style={{ background: 'var(--x-warn-bg)', borderRadius: 10, padding: '8px 12px' }}><Bi pair={bi(lt.err)} size={13} color="var(--x-warn-fg)" /></div>
      )}
    </section>
  );
});
