'use client';
/**
 * Microphone (design G6 q.47–58 + speaking-design §1.1): our own explanation BEFORE the browser prompt
 * (only when permission is still "prompt"), Record 5 s with the exam constraints and a 32-bar meter
 * (accent — red is reserved for the Speaking "Recording" dot), then a level check: ok → Play back +
 * "I can hear my voice"; quiet / distorted → warn tile + Record again. Three room tips at the bottom.
 * Shown only when the attempt has Speaking.
 */
import { BellOff, DoorClosed, Headphones } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useT } from '@/lib/exam/engine/context';
import { micPermission } from '@/lib/exam/speaking/recorder';
import { useLevelTest } from '@/lib/exam/speaking/use-level-test';
import { Bi, Btn } from '../../shell/ui';
import { CheckCard, hint, type CheckStatus } from './CheckCard';
import { MicPermissionHint } from './MicPermissionHint';

const TIPS = [[DoorClosed, 'speaking.tip_door'], [Headphones, 'speaking.tip_headset'], [BellOff, 'speaking.tip_phone']] as const;

export function MicCard({ status, onStatus }: { status: CheckStatus; onStatus: (s: CheckStatus) => void }) {
  const { t, bi } = useT();
  const lt = useLevelTest(5, 32);
  const [ask, setAsk] = useState(false);
  useEffect(() => {
    if (lt.err) onStatus('attention');
    else if (lt.verdict === 'quiet' || lt.verdict === 'loud') onStatus('attention');
    else if (lt.verdict === 'ok') onStatus('checking');
  }, [lt.err, lt.verdict]); // eslint-disable-line react-hooks/exhaustive-deps

  const record = async () => {
    setAsk(false);
    onStatus('checking');
    await lt.start();
  };
  const onRecordClick = async () => {
    if ((await micPermission()) === 'prompt') { setAsk(true); return; }
    void record();
  };
  const bad = lt.verdict === 'quiet' || lt.verdict === 'loud';

  return (
    <CheckCard title={t('precheck.mic_title')} status={status}>
      <div style={hint}>{t('precheck.mic_body')}</div>
      {!ask && <div style={{ fontSize: 12.5, color: 'var(--x-muted)' }}>{t('precheck.mic_permission')}</div>}
      {ask ? (
        <div style={{ background: 'var(--x-tile)', borderRadius: 12, padding: 14, display: 'flex', gap: 14, alignItems: 'center' }}>
          <MicPermissionHint />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-start' }}>
            <div style={{ fontSize: 13.5, fontWeight: 600 }}>{t('precheck.mic_permission_where')}</div>
            <Btn h={38} autoFocus onClick={() => void record()} style={{ fontSize: 13 }}>{t('precheck.mic_permission_cta')}</Btn>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <Btn h={38} style={{ fontSize: 13 }} disabled={lt.recording} onClick={() => void onRecordClick()}>{lt.recording ? t('precheck.mic_recording', { s: lt.left }) : t('chrome.record_5s')}</Btn>
          <div aria-hidden style={{ flex: 1, height: 28, display: 'flex', alignItems: 'center', gap: 3 }}>
            {lt.bars.map((b, i) => <div key={i} style={{ flex: 1, borderRadius: 2, height: 4 + Math.round(b * 22), background: lt.recording || status === 'ready' ? 'var(--x-accent)' : 'var(--x-line)' }} />)}
          </div>
        </div>
      )}
      {lt.verdict === 'ok' && !lt.recording && status !== 'ready' && (
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Btn h={38} style={{ fontSize: 13 }} onClick={lt.play}>{t('chrome.play_back')}</Btn>
          <Btn h={38} variant="accent" style={{ fontSize: 13 }} onClick={() => onStatus('ready')}>{t('precheck.mic_yes')}</Btn>
        </div>
      )}
      {bad && !lt.recording && (
        <div style={{ background: 'var(--x-warn-bg)', borderRadius: 10, padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-start' }}>
          <Bi pair={bi(lt.verdict === 'loud' ? 'speaking.level_loud' : 'speaking.level_quiet')} size={13} color="var(--x-warn-fg)" />
          <Btn h={36} variant="accent" style={{ fontSize: 13 }} onClick={() => void record()}>{t('speaking.record_again')}</Btn>
        </div>
      )}
      {lt.err && <div style={{ background: 'var(--x-warn-bg)', borderRadius: 10, padding: '8px 12px' }}><Bi pair={bi(lt.err)} size={13} color="var(--x-warn-fg)" /></div>}
      {lt.err && lt.err !== 'errors.browser_unsupported' && <Btn h={36} style={{ alignSelf: 'flex-start', fontSize: 13 }} onClick={() => void record()}>{t('chrome.check_again')}</Btn>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {TIPS.map(([Icon, k]) => (
          <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, fontWeight: 600, color: 'var(--x-sub)' }}><Icon size={14} color="var(--x-muted)" aria-hidden />{t(k)}</div>
        ))}
      </div>
    </CheckCard>
  );
}
