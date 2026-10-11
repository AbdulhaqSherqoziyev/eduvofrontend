'use client';
/**
 * "Welcome back" (Sevara T19, design G8): section · live time left · answers saved
 * · timer kept running. Continue = user gesture → fullscreen + audio may play.
 * If the stage ended while away: resume.time_ended, Continue → next intro.
 */
import { Clock, ListChecks, RotateCcw, Save } from 'lucide-react';
import { useState } from 'react';
import { useServerNow } from '@/lib/exam/engine/clock';
import { useExam, useT } from '@/lib/exam/engine/context';
import { requestFullscreen } from '@/lib/exam/engine/integrity';
import { fmtClock, parseIso } from '@/lib/exam/format';
import { prevLocked } from '@/lib/exam/sat/flow';
import { Bi, Btn, Centered, Spinner } from '../shell/ui';

export function WelcomeBack() {
  const { s, stage, sectionCfg, stageCfg, media, beginStage, dispatch } = useExam();
  const { t, bi } = useT();
  const now = useServerNow(500);
  const [busy, setBusy] = useState(false);
  const dl = parseIso(stage?.deadlineAt);
  const left = dl != null ? Math.max(0, (dl - now) / 1000) : 0;
  const hasAudio = !!stageCfg?.audio;
  const loading = !s.timeEnded && hasAudio && !media.ready;
  const fact = { display: 'flex', gap: 10, alignItems: 'flex-start' } as const;

  const go = async () => {
    requestFullscreen();
    if (s.timeEnded) { dispatch({ t: 'PHASE', phase: s.stageKey ? 'intro' : 'complete' }); return; }
    setBusy(true);
    const r = await beginStage();
    if (!r.ok) setBusy(false);
  };

  return (
    <Centered>
      <div style={{ width: 560, background: 'var(--x-panel)', border: '1px solid var(--x-line)', borderRadius: 22, padding: 32, display: 'flex', flexDirection: 'column', gap: 18 }}>
        <RotateCcw size={28} color="var(--x-accent)" aria-hidden />
        <Bi pair={bi('resume.title')} size={24} weight={800} />
        {s.timeEnded ? (
          // SAT: the stage that ended while away may be the break — then it is Math that starts, nothing was "submitted"
          <Bi pair={prevLocked(s.stages, s.stageKey)?.kind === 'break' ? bi('sat.break_ended_away') : bi('resume.time_ended', { section: s.timeEnded })} size={15} />
        ) : (
          <>
            <Bi pair={bi('resume.body')} size={15} weight={500} />
            <div style={fact}><ListChecks size={16} color="var(--x-sub)" style={{ marginTop: 3 }} aria-hidden /><Bi pair={bi('resume.section_time', { section: sectionCfg?.title ?? '', t: fmtClock(left) })} size={15} weight={700} /></div>
            <div style={fact}><Save size={16} color="var(--x-sub)" style={{ marginTop: 3 }} aria-hidden /><Bi pair={bi('resume.saved', { n: s.resumeSaved })} size={15} weight={700} /></div>
            <div style={fact}><Clock size={14} color="var(--x-muted)" style={{ marginTop: 3 }} aria-hidden /><Bi pair={bi('resume.timer_note')} size={13} weight={500} color="var(--x-muted)" /></div>
            {hasAudio && <Bi pair={bi('resume.audio_note')} size={13} weight={500} color="var(--x-muted)" />}
          </>
        )}
        <Btn h={52} variant="accent" disabled={busy || loading} onClick={() => void go()} style={{ fontSize: 15.5, borderRadius: 14 }}>
          {loading ? t('intro.loading', { p: Math.round(media.progress * 100) }) : busy ? <Spinner /> : t('chrome.continue')}
        </Btn>
      </div>
    </Centered>
  );
}
