'use client';
/**
 * Speaking intro (design A10 q.93–111 + speaking-design §1.2): the same 620px card, split into a
 * scrolling part (tiles, intro, 10 s trial, "good to know") and a sticky footer (privacy line → Start →
 * "take later"), so at 1280×720 Start and the privacy line are visible without scrolling.
 * No skip on failed examiner audio (Speaking can't run without it) — "take later" instead.
 */
import { useEffect, useRef, useState } from 'react';
import { useExamHost } from '@/components/exam/host';
import { useExam, useT } from '@/lib/exam/engine/context';
import { canRecord } from '@/lib/exam/speaking/recorder';
import { setSpeakingLater, speakingLater } from '@/lib/exam/speaking/local';
import { Bi, Btn, Spinner } from '../../shell/ui';
import { IntroHead, KnowList } from './IntroParts';
import { LaterCard } from './LaterCard';
import { PrivacyModal } from './PrivacyModal';
import { StickyFooter } from './StickyFooter';
import { TrialRecording } from './TrialRecording';

export function SpeakingIntro() {
  const { s, sectionCfg, media, beginStage } = useExam();
  const host = useExamHost();
  const { t, bi } = useT();
  const [passed, setPassed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [privacy, setPrivacy] = useState(false);
  // full mock only (spec §1.1-e); B2C always, ERP when the assignment allows a separate sitting
  const canLater = s.attempt?.mode === 'full' && (!!host.b2c || !!sectionCfg?.separate_sitting);
  const [later, setLater] = useState(() => speakingLater(s.attemptId) && canLater);
  const [overflow, setOverflow] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const trialBtn = useRef<HTMLButtonElement>(null);
  const b2c = !!host.b2c;
  const supported = canRecord();
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => setOverflow(el.scrollHeight > el.clientHeight + 1));
    ro.observe(el);
    return () => ro.disconnect();
  }, [later]);
  if (!sectionCfg) return null;
  if (later) return <LaterCard b2c={b2c} />;

  const loading = !media.ready && !media.error;
  const period = t(b2c ? 'speaking.period_90d' : 'speaking.period_12m');
  const start = async () => {
    setBusy(true);
    setErr(null);
    const r = await beginStage();
    if (!r.ok) { setErr(r.code ?? 'network'); setBusy(false); }
  };
  const goTrial = () => {
    document.getElementById('sp-trial')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    trialBtn.current?.focus();
  };
  const takeLater = () => { setSpeakingLater(s.attemptId, true); setLater(true); };

  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, minHeight: 0 }}>
      <div style={{ width: 620, maxHeight: 'calc(100vh - 48px)', background: 'var(--x-panel)', border: '1px solid var(--x-line)', borderRadius: 22, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div ref={scrollRef} style={{ flex: 1, minHeight: 0, overflowY: 'auto', scrollbarWidth: 'thin', padding: '40px 40px 20px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          <IntroHead />
          {!supported && <Bi pair={bi('errors.browser_unsupported')} size={13.5} color="var(--x-warn-fg)" />}
          {supported && <TrialRecording ref={trialBtn} onPass={() => setPassed(true)} />}
          <KnowList b2c={b2c} />
          <div style={{ fontSize: 13, color: 'var(--x-muted)' }}>{t('intro.timer_note')}</div>
          {media.error && (
            <div style={{ background: 'var(--x-warn-bg)', border: '1px solid var(--x-warn-border)', borderRadius: 12, padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Bi pair={bi(media.failCount >= 3 ? 'speaking.audio_failed_later' : 'errors.media_failed')} size={13.5} color="var(--x-warn-fg)" />
              <div style={{ display: 'flex', gap: 10 }}>
                <Btn h={36} onClick={media.retry} style={{ fontSize: 13 }}>{t('chrome.retry')}</Btn>
                {media.failCount >= 3 && canLater && <Btn h={36} onClick={takeLater} style={{ fontSize: 13 }}>{t('speaking.do_later')}</Btn>}
              </div>
            </div>
          )}
          {err && <Bi pair={bi(err === 'network' ? 'banner.offline' : 'errors.server')} size={13.5} color="var(--x-warn-fg)" />}
        </div>
        <StickyFooter border={overflow} period={period} onPrivacy={() => setPrivacy(true)} canLater={canLater} onLater={takeLater}
          trialNeeded={supported && !passed} onTrial={goTrial}
          start={{ disabled: busy || loading || media.error || !passed || !supported, label: loading ? t('intro.loading', { p: Math.round(media.progress * 100) }) : busy ? <Spinner /> : t('chrome.start_section', { section: sectionCfg.title }), onClick: () => void start() }} />
      </div>
      {privacy && <PrivacyModal b2c={b2c} period={period} onClose={() => setPrivacy(false)} />}
    </div>
  );
}
