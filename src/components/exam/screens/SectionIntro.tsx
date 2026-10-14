'use client';
/**
 * Section intro (design A10/G3): "✓ Listening submitted" (no "locked"), SECTION n OF m,
 * TIME/CONTENT/SCORING tiles, no route/variant label. Timer does not run here.
 * Audio must be 100 % preloaded; failures → Retry, after 3 → Report & skip (T20).
 */
import { Check } from 'lucide-react';
import { useState } from 'react';
import { useExam, useT } from '@/lib/exam/engine/context';
import { isSat, sectionNo } from '@/lib/exam/sat/flow';
import { RichText } from '../shell/RichText';
import { Bi, Btn, Caps, Centered, Spinner } from '../shell/ui';

function Tile({ k, v }: { k: string; v: string }) {
  return (
    <div style={{ background: 'var(--x-tile)', borderRadius: 12, padding: 14 }}>
      <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 0.6, color: 'var(--x-muted)' }}>{k}</div>
      <div style={{ fontSize: 15, fontWeight: 800, marginTop: 4, lineHeight: 1.35 }}>{v}</div>
    </div>
  );
}

export function SectionIntro() {
  const { s, sectionCfg, stageCfg, media, beginStage, reportSkip } = useExam();
  const { t, bi } = useT();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [confirmSkip, setConfirmSkip] = useState(false);
  if (!sectionCfg) return null;
  const main = s.stages.filter((x) => !x.separateSitting);
  const idx = main.findIndex((x) => x.stageKey === s.stageKey);
  // SAT counts sections, not stages (2 modules + a break per section would read "SECTION 4 OF 5")
  // A single-section attempt (SAT R&W only) counts only the sections it has: no "SECTION 1 OF 2".
  const attemptSecs = [...new Set(main.map((x) => x.sectionKey))];
  const nm = isSat(s.config)
    ? (attemptSecs.length < sectionNo(s.config, sectionCfg.key).m ? { n: Math.max(1, attemptSecs.indexOf(sectionCfg.key) + 1), m: attemptSecs.length } : sectionNo(s.config, sectionCfg.key))
    : { n: idx + 1, m: main.length };
  const b = sectionCfg.brief ?? {};
  const minutes = b.durationSec ?? stageCfg?.timer.duration_sec;
  const ai = stageCfg?.kind === 'writing' || stageCfg?.kind === 'speaking';
  const content = b.tasks || stageCfg?.tasks?.length ? t('intro.content_tasks', { n: b.tasks ?? stageCfg?.tasks?.length ?? 0 }) : b.questions ? ((b.parts ?? 1) > 1 ? t('intro.content_questions', { n: b.questions, parts: b.parts ?? 1 }) : t('x.content_questions_only', { n: b.questions })) : '—';
  const hasAudio = !!stageCfg?.audio;
  const loading = hasAudio && !media.ready && !media.error;
  const pct = Math.round(media.progress * 100);

  const start = async () => {
    setBusy(true);
    setErr(null);
    const r = await beginStage();
    if (!r.ok) { setErr(r.code ?? 'network'); setBusy(false); }
  };

  return (
    <Centered>
      <div style={{ width: 620, background: 'var(--x-panel)', border: '1px solid var(--x-line)', borderRadius: 22, padding: 40, display: 'flex', flexDirection: 'column', gap: 20 }}>
        {s.prevSubmitted && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 700, color: 'var(--x-ok-fg)' }}>
            <Check size={14} aria-hidden />{t('intro.prev_submitted', { section: s.prevSubmitted }).replace(/^✓\s*/, '')}
          </div>
        )}
        <div>
          {nm.m > 1 && <Caps>{t('intro.section_n_of_m', nm)}</Caps>}
          <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: -0.7, marginTop: 8 }}>{sectionCfg.title}</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 12 }}>
          <Tile k={t('intro.tile_time')} v={minutes ? t('intro.time_value', { min: Math.round(minutes / 60) }) : '—'} />
          <Tile k={t('intro.tile_content')} v={content} />
          <Tile k={t('intro.tile_scoring')} v={t(ai ? 'intro.scoring_ai' : 'intro.scoring_auto')} />
        </div>
        {sectionCfg.intro && <div style={{ fontSize: 14.5, color: 'var(--x-sub)', lineHeight: 1.6, textAlign: 'left' }}><RichText html={sectionCfg.intro} /></div>}
        {hasAudio && <div style={{ fontSize: 13, color: 'var(--x-muted)', fontWeight: 600 }}>{t((stageCfg?.audio?.play_count ?? 1) > 1 ? 'intro.plays_twice' : 'intro.plays_once')}</div>}
        <div style={{ fontSize: 13, color: 'var(--x-muted)' }}>{t('intro.timer_note')}</div>
        {media.error && hasAudio && (
          <div style={{ background: 'var(--x-warn-bg)', border: '1px solid var(--x-warn-border)', borderRadius: 12, padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Bi pair={bi('errors.media_failed')} size={13.5} color="var(--x-warn-fg)" />
            <div style={{ display: 'flex', gap: 10 }}>
              <Btn h={36} onClick={media.retry} style={{ fontSize: 13 }}>{t('chrome.retry')}</Btn>
              {media.failCount >= 3 && <Btn h={36} onClick={() => setConfirmSkip(true)} style={{ fontSize: 13 }}>{t('banner.audio_report_skip')}</Btn>}
            </div>
            {media.failCount >= 3 && <div style={{ fontSize: 12, color: 'var(--x-warn-fg)' }}>{t('banner.audio_report_skip_note')}</div>}
          </div>
        )}
        {err && <Bi pair={bi(err === 'network' ? 'banner.offline' : 'errors.server')} size={13.5} color="var(--x-warn-fg)" />}
        <Btn h={52} variant="accent" disabled={busy || loading || (hasAudio && media.error)} onClick={() => void start()} style={{ fontSize: 15.5, borderRadius: 14 }}>
          {loading ? t('intro.loading', { p: pct }) : busy ? <Spinner /> : t('chrome.start_section', { section: sectionCfg.title })}
        </Btn>
      </div>
      {confirmSkip && (
        <div role="dialog" aria-modal="true" style={{ position: 'absolute', inset: 0, background: 'var(--x-overlay)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 30 }}>
          <div className="x-pop" style={{ width: 460, background: 'var(--x-panel)', border: '1px solid var(--x-line)', borderRadius: 20, padding: 28, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ fontSize: 18, fontWeight: 800 }}>{t('banner.audio_report_skip')}</div>
            <div style={{ fontSize: 14, color: 'var(--x-sub)', lineHeight: 1.55 }}>{t('banner.audio_report_skip_note')}</div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <Btn autoFocus onClick={() => setConfirmSkip(false)}>{t('chrome.cancel')}</Btn>
              <Btn variant="dark" onClick={() => { setConfirmSkip(false); void reportSkip(); }}>{t('banner.audio_report_skip')}</Btn>
            </div>
          </div>
        </div>
      )}
    </Centered>
  );
}
