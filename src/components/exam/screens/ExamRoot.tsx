'use client';
/** Player root: tokens/theme scope, desktop gate, phase → screen. */
import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import { ExamContext } from '@/lib/exam/engine/context';
import { useExamController } from '@/lib/exam/engine/controller';
import { autoStarts, isSat } from '@/lib/exam/sat/flow';
import { clearSatElim } from '@/lib/exam/sat/tools';
import { bi, t, type Locale } from '@/lib/exam/i18n';
import { store } from '@/lib/exam/storage';
import { SatHandoff } from '../sat/SatHandoff';
import { MinWidthGate } from '../shell/MinWidthGate';
import { Bi, Btn, Centered, Spinner } from '../shell/ui';
import { PreCheck } from './PreCheck';
import { SectionIntro } from './SectionIntro';
import { SectionView } from './SectionView';
import { TimeUp } from './TimeUp';
import { TryInterface } from './tryout/TryInterface';

// SAT module screen (KaTeX, Desmos loader, tools) ships in its own chunk — IELTS/CEFR never download it.
const SatStage = dynamic(() => import('../sat/SatSection').then((m) => m.SatStage), { loading: () => <Centered><Spinner size={22} /></Centered> });
import { WelcomeBack } from './WelcomeBack';
import { useExamHost } from '../host';

function Message({ locale, k, action }: { locale: Locale; k: Parameters<typeof bi>[0]; action?: { label: string; on: () => void } }) {
  return (
    <Centered>
      <div style={{ width: 520, background: 'var(--x-panel)', border: '1px solid var(--x-line)', borderRadius: 22, padding: 32, display: 'flex', flexDirection: 'column', gap: 18, alignItems: 'center', textAlign: 'center' }}>
        <Bi pair={bi(k, locale)} size={16} weight={700} center />
        {action && <Btn variant="accent" h={46} onClick={action.on}>{action.label}</Btn>}
      </div>
    </Centered>
  );
}

function Player({ attemptId, onComplete }: { attemptId: string; onComplete: () => void }) {
  const ctl = useExamController(attemptId);
  const host = useExamHost();
  const { s } = ctl;
  const l = s.ui.locale;
  // host ran its own system check (mock.eduvo.uz Exam Start) → no second pre-check screen
  const skipPre = useRef<boolean | null>(null);
  if (skipPre.current === null) skipPre.current = host.skipPrecheck?.() ?? false;
  const dispatch = ctl.dispatch;
  useEffect(() => {
    if (s.phase === 'precheck' && skipPre.current) dispatch({ t: 'PHASE', phase: 'intro' });
  }, [s.phase, dispatch]);
  // Digital SAT: own module screen, break, and intro-less module handoff (sat.md §4)
  const sat = isSat(s.config);
  useEffect(() => {
    if (s.phase !== 'complete') return;
    if (sat) clearSatElim(attemptId); // option eliminator state is per attempt — gone once the attempt is over
    onComplete();
  }, [s.phase, sat, attemptId, onComplete]);
  const midAttempt = s.phase === 'section' || s.phase === 'timeup';
  const handoff = sat && (s.phase === 'timeup' || (s.phase === 'intro' && autoStarts(s.stages, s.stageKey)));
  let body: React.ReactNode;
  switch (s.phase) {
    case 'boot': case 'complete': body = <Centered><Spinner size={22} /></Centered>; break;
    case 'auth': body = host.renderAuthExpired
      ? host.renderAuthExpired({ retry: () => void ctl.boot(), locale: l })
      : <Message locale={l} k="errors.session_expired" action={{ label: t('x.open_portal', l), on: () => { window.location.href = '/portal'; } }} />; break;
    case 'error': body = <Message locale={l} k={s.error?.code === 'ATTEMPT_NOT_FOUND' ? 'errors.attempt_locked' : s.error?.kind === 'network' ? 'banner.offline' : 'errors.server'} action={{ label: t('chrome.retry', l), on: () => void ctl.boot() }} />; break;
    case 'precheck': body = skipPre.current ? <Centered><Spinner size={22} /></Centered> : <PreCheck />; break;
    case 'tryout': body = <TryInterface />; break;
    case 'welcome': body = <WelcomeBack />; break;
    case 'intro': body = handoff ? <SatHandoff /> : <SectionIntro />; break;
    case 'section': body = sat ? <SatStage /> : <SectionView />; break;
    case 'timeup': body = handoff ? <SatHandoff /> : <TimeUp />; break;
  }
  return (
    <ExamContext.Provider value={ctl}>
      <div className="exam-root" data-exam-theme={s.ui.theme} data-exam-font={s.ui.font} lang="en">
        <MinWidthGate min={s.config?.ui?.min_width_px ?? 1280} locale={l} midAttempt={midAttempt}>{body}</MinWidthGate>
      </div>
    </ExamContext.Provider>
  );
}

export function ExamRoot({ attemptId, hasToken, onComplete }: { attemptId: string; hasToken: boolean; onComplete: () => void }) {
  const host = useExamHost();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="exam-root" data-exam-theme="standard" data-exam-font="m" />;
  if (!hasToken) {
    const l = store.locale() ?? 'en';
    if (host.renderAuthExpired) {
      return <div className="exam-root" data-exam-theme="standard" data-exam-font="m" lang="en">{host.renderAuthExpired({ retry: () => window.location.reload(), locale: l })}</div>;
    }
    return (
      <div className="exam-root" data-exam-theme="standard" data-exam-font="m" lang="en">
        <Message locale={l} k="errors.session_expired" action={{ label: t('x.open_portal', l), on: () => { window.location.href = '/portal'; } }} />
      </div>
    );
  }
  return <Player attemptId={attemptId} onComplete={onComplete} />;
}
