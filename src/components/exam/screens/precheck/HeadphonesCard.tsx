'use client';
/** Headphones (design G6): Play sample + volume → "I can hear it clearly" / "I can't hear anything" (→ errors.no_sound). */
import { useEffect, useRef, useState } from 'react';
import { useExam, useT } from '@/lib/exam/engine/context';
import { sampleToneUrl } from '@/lib/exam/mock/audio';
import { Bi, Btn } from '../../shell/ui';
import { CheckCard, hint, type CheckStatus } from './CheckCard';

export function HeadphonesCard({ status, onStatus }: { status: CheckStatus; onStatus: (s: CheckStatus) => void }) {
  const { s, setUi } = useExam();
  const { t, bi } = useT();
  const audio = useRef<HTMLAudioElement | null>(null);
  const [played, setPlayed] = useState(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => () => { audio.current?.pause(); }, []);
  useEffect(() => { if (audio.current) audio.current.volume = s.ui.volume; }, [s.ui.volume]);

  const play = () => {
    if (!audio.current) audio.current = new Audio(sampleToneUrl());
    const a = audio.current;
    a.volume = s.ui.volume;
    a.currentTime = 0;
    a.onended = () => { setPlaying(false); setPlayed(true); };
    setPlaying(true);
    if (status !== 'ready') onStatus('checking');
    void a.play().catch(() => { setPlaying(false); onStatus('attention'); });
  };

  return (
    <CheckCard title={t('precheck.headphones_title')} status={status}>
      <div style={hint}>{t('precheck.headphones_body')}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <Btn h={38} onClick={play} disabled={playing} style={{ fontSize: 13 }}>{played ? t('chrome.play_again') : t('chrome.play_sample')}</Btn>
        <input type="range" min={0} max={100} value={Math.round(s.ui.volume * 100)} aria-label={t('chrome.volume')}
          onChange={(e) => setUi({ volume: Number(e.target.value) / 100 })} style={{ flex: 1, accentColor: 'var(--x-accent)' }} />
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--x-sub)', width: 38, fontVariantNumeric: 'tabular-nums' }}>{Math.round(s.ui.volume * 100)}%</span>
      </div>
      {played && status !== 'ready' && (
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Btn h={38} variant="accent" style={{ fontSize: 13 }} onClick={() => onStatus('ready')}>{t('precheck.headphones_yes')}</Btn>
          <Btn h={38} style={{ fontSize: 13 }} onClick={() => onStatus('attention')}>{t('precheck.headphones_no')}</Btn>
        </div>
      )}
      {status === 'attention' && <div style={{ color: 'var(--x-warn-fg)', background: 'var(--x-warn-bg)', borderRadius: 10, padding: '8px 12px' }}><Bi pair={bi('errors.no_sound')} size={13} color="var(--x-warn-fg)" /></div>}
    </CheckCard>
  );
}
