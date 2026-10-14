'use client';
/**
 * mock.eduvo.uz: the attempt was (re)opened directly — reload, a link from the dashboard, another
 * device. Replaces the ERP pre-check and the bilingual "Welcome back" with one neomorphic card in
 * the learner's instruction language: logo, section and live time left, saved answers, the
 * "timer kept running" note, and one primary action (fullscreen + continue). Exam Start already ran
 * the system check, so nothing is checked again here.
 */
import { Clock, ListChecks, Save } from 'lucide-react';
import { useState } from 'react';
import { useServerNow } from '@/lib/exam/engine/clock';
import { useExam, useT } from '@/lib/exam/engine/context';
import { requestFullscreen } from '@/lib/exam/engine/integrity';
import { fmtClock, parseIso } from '@/lib/exam/format';
import { prevLocked } from '@/lib/exam/sat/flow';
import { sx } from '@/lib/mock/sx';
import { BrandMark } from '../logo';

export function MockResumeCard() {
  const { s, stage, sectionCfg, stageCfg, media, beginStage, dispatch } = useExam();
  const { t } = useT();
  const now = useServerNow(500);
  const [busy, setBusy] = useState(false);
  const welcome = s.phase === 'welcome';
  const dl = parseIso(stage?.deadlineAt);
  const left = dl != null ? Math.max(0, (dl - now) / 1000) : 0;
  const hasAudio = welcome && !!stageCfg?.audio;
  const loading = welcome && !s.timeEnded && hasAudio && !media.ready;
  const examName = s.config?.name ?? '';

  const go = async () => {
    requestFullscreen();
    if (!welcome) { dispatch({ t: 'PHASE', phase: 'intro' }); return; }
    if (s.timeEnded) { dispatch({ t: 'PHASE', phase: s.stageKey ? 'intro' : 'complete' }); return; }
    setBusy(true);
    const r = await beginStage();
    if (!r.ok) setBusy(false);
  };

  const fact = sx('display:flex;gap:10px;align-items:flex-start;font-size:15px;font-weight:700;line-height:1.5');
  return (
    <div style={sx('flex:1;overflow:auto;display:grid;place-items:center;padding:32px;background:var(--bg)')}>
      <div style={sx('width:min(520px,100%);border-radius:24px;background:var(--bg);box-shadow:var(--raise);padding:32px;display:flex;flex-direction:column;gap:16px;color:var(--ink)')}>
        <span dir="ltr" style={sx('display:flex;align-items:center;gap:8px;font-weight:800;font-size:15px')}>
          <BrandMark size={26} shadow={false} />Eduvo<span style={sx('color:var(--blue);margin-inline-start:-4px')}>Mock</span>
        </span>
        {examName && <span className="m-eyebrow" style={{ ...sx('letter-spacing:.05em;font-size:12px'), color: s.config?.family === 'SAT' ? 'var(--sat)' : 'var(--ielts)' }}>{examName.toUpperCase()}</span>}
        <div style={sx('font-size:26px;font-weight:800;letter-spacing:-0.02em')}>{welcome ? t('resume.title') : t('precheck.title')}</div>
        {welcome && s.timeEnded ? (
          <div style={sx('font-size:15px;line-height:1.6;color:var(--ink2)')}>
            {prevLocked(s.stages, s.stageKey)?.kind === 'break' ? t('sat.break_ended_away') : t('resume.time_ended', { section: s.timeEnded })}
          </div>
        ) : welcome ? (
          <>
            <div style={sx('font-size:15px;line-height:1.6;color:var(--ink2)')}>{t('resume.body')}</div>
            <div style={sx('border-radius:16px;box-shadow:var(--inset);padding:16px;display:flex;flex-direction:column;gap:10px')}>
              <div style={fact}><ListChecks size={17} style={{ marginTop: 3, color: 'var(--ink2)' }} aria-hidden /><span>{t('resume.section_time', { section: sectionCfg?.title ?? '', t: fmtClock(left) })}</span></div>
              <div style={fact}><Save size={17} style={{ marginTop: 3, color: 'var(--ink2)' }} aria-hidden /><span>{t('resume.saved', { n: s.resumeSaved })}</span></div>
            </div>
            <div style={{ ...fact, ...sx('font-size:13px;font-weight:600;color:var(--mut)') }}><Clock size={15} style={{ marginTop: 2 }} aria-hidden /><span>{t('resume.timer_note')}</span></div>
            {hasAudio && <div style={sx('font-size:13px;font-weight:600;color:var(--mut);line-height:1.5')}>{t('resume.audio_note')}</div>}
          </>
        ) : (
          <div style={sx('font-size:15px;line-height:1.6;color:var(--ink2)')}>{t('precheck.nothing_started')}</div>
        )}
        <button type="button" className="m-btn m-btn--primary" disabled={busy || loading} onClick={() => void go()} style={sx('height:54px;border-radius:14px;font-size:16px;font-weight:800')}>
          {busy && <span className="m-spin" aria-hidden />}
          {loading ? t('intro.loading', { p: Math.round(media.progress * 100) }) : welcome ? t('chrome.continue') : t('chrome.enter_fullscreen_start')}
        </button>
      </div>
    </div>
  );
}
