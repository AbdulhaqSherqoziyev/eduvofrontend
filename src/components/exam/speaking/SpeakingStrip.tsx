'use client';
/**
 * Phase → stage strip (spec §1.3/§1.4). Part 1/3: no clock — Finish answer (dark, disabled for the first
 * 5 s with a static "Available after 5 s") + a progress line. Part 2 prep: digital 60 s in the label +
 * "I'm ready" (accent). Part 2 talk: small elapsed "0:42 / 2:00", Finish after 60 s. 3-2-1 lives only in
 * the 13.5px label (no big number, no sound — Q16).
 */
import { useT } from '@/lib/exam/engine/context';
import type { SpeakingFlow } from '@/lib/exam/speaking/use-speaking-flow';
import { COUNTDOWN_MS } from '@/lib/exam/speaking/use-speaking-flow';
import { Btn } from '../shell/ui';
import { StageStrip, type StripKind } from './StageStrip';

const mmss = (sec: number) => { const n = Math.max(0, Math.ceil(sec)); return `${Math.floor(n / 60)}:${String(n % 60).padStart(2, '0')}`; };

export function SpeakingStrip({ f, bars }: { f: SpeakingFlow; bars: number[] }) {
  const { t } = useT();
  const it = f.item!;
  const el = f.clock.elapsedMs / 1000;
  const p2 = it.kind === 'cue_card';
  const recEl = f.phase === 'recording' ? f.recElapsed() : 0;
  const minSec = it.minResponseSec ?? 5;
  let kind: StripKind = 'listen';
  let label = t('speaking.listen');
  let sub: string | undefined;
  let progress: number | null = 0;
  let lastTen = false;
  let right: React.ReactNode = null;
  let note = t('speaking.auto_advance');

  if (f.phase === 'prep') {
    kind = 'prep';
    const left = it.prepSec - el;
    label = t('speaking.think', { t: mmss(left) });
    progress = el / Math.max(1, it.prepSec);
    lastTen = left <= 10;
    right = <Btn h={40} variant="accent" onClick={f.ready} style={{ fontSize: 13, padding: '0 18px' }}>{t('speaking.ready_early')}</Btn>;
    note = t('speaking.prep_note');
  } else if (f.phase === 'reveal' || f.phase === 'countdown') {
    kind = 'countdown';
    const n = f.phase === 'reveal' ? 3 : Math.max(1, 3 - Math.floor((el * 1000) / (COUNTDOWN_MS / 3)));
    label = t('speaking.countdown').split('…').slice(0, 1 + (3 - n)).join('…') + '…';
    progress = 0;
  } else if (f.phase === 'recording') {
    kind = 'recording';
    label = t('speaking.recording');
    if (p2) sub = t('timer.speaking_elapsed', { elapsed: mmss(recEl), total: mmss(it.responseSec) });
    progress = recEl / Math.max(1, it.responseSec);
    lastTen = it.responseSec - recEl <= 10;
    const can = recEl >= minSec;
    right = (
      <>
        <Btn h={40} variant="dark" disabled={!can} onClick={f.finish} style={{ fontSize: 13, borderRadius: 10, padding: '0 18px' }}>{t('chrome.finish_answer')}</Btn>
        {!can && <span style={{ fontSize: 11.5, color: 'var(--x-muted)', fontWeight: 600 }}>{t('speaking.finish_available_in', { s: minSec })}</span>}
      </>
    );
    note = t('speaking.finish_hint');
  } else if (f.phase === 'saving') { kind = 'saving'; label = t('speaking.saving'); progress = 1; } else if (f.phase === 'saved') { kind = 'saved'; label = t('speaking.saved'); progress = 1; }

  return (
    <>
      <StageStrip kind={kind} label={label} sub={sub} bars={bars} live={f.phase === 'recording'} right={right} progress={progress} lastTen={lastTen} />
      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--x-muted)', textAlign: 'center' }}>{note}</div>
    </>
  );
}
