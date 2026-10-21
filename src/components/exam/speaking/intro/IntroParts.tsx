'use client';
/** Speaking intro pieces: header (✓ previous · SECTION n OF m · title · TIME/CONTENT/SCORING · intro text) and "good to know" rows. */
import { Check, Mic, Pause, UserRound, Volume2 } from 'lucide-react';
import { useExam, useT } from '@/lib/exam/engine/context';
import type { TextKey } from '@/lib/exam/i18n';
import { RichText } from '../../shell/RichText';
import { Caps } from '../../shell/ui';

function Tile({ k, v }: { k: string; v: string }) {
  return (
    <div style={{ background: 'var(--x-tile)', borderRadius: 12, padding: 14 }}>
      <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 0.6, color: 'var(--x-muted)' }}>{k}</div>
      <div style={{ fontSize: 15, fontWeight: 800, marginTop: 4, lineHeight: 1.35 }}>{v}</div>
    </div>
  );
}

export function IntroHead() {
  const { s, sectionCfg, stageCfg } = useExam();
  const { t } = useT();
  if (!sectionCfg) return null;
  const main = s.stages;
  const idx = main.findIndex((x) => x.stageKey === s.stageKey);
  const b = sectionCfg.brief ?? {};
  const sec = b.durationSec ?? stageCfg?.timer.duration_sec;
  return (
    <>
      {s.prevSubmitted && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 700, color: 'var(--x-ok-fg)' }}>
          <Check size={14} aria-hidden />{t('intro.prev_submitted', { section: s.prevSubmitted }).replace(/^✓\s*/, '')}
        </div>
      )}
      <div>
        {main.length > 1 && <Caps>{t('intro.section_n_of_m', { n: idx + 1, m: main.length })}</Caps>}
        <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: -0.7, marginTop: 8 }}>{sectionCfg.title}</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 12 }}>
        <Tile k={t('intro.tile_time')} v={sec ? t('intro.time_value', { min: Math.round(sec / 60) }) : '—'} />
        <Tile k={t('intro.tile_content')} v={b.questions ? t('intro.content_questions', { n: b.questions, parts: b.parts ?? 3 }) : '—'} />
        <Tile k={t('intro.tile_scoring')} v={t('intro.scoring_ai')} />
      </div>
      {sectionCfg.intro && <div style={{ fontSize: 14.5, color: 'var(--x-sub)', lineHeight: 1.6 }}><RichText html={sectionCfg.intro} /></div>}
    </>
  );
}

export function KnowList({ b2c }: { b2c: boolean }) {
  const { t } = useT();
  const rows: [typeof Mic, TextKey][] = [
    [Mic, 'speaking.intro_no_rerecord'], [Pause, 'speaking.intro_pause_ok'], [Volume2, 'speaking.intro_voice'],
    ...(b2c ? [] : [[UserRound, 'speaking.intro_staff_listen'] as [typeof Mic, TextKey]]),
  ];
  return (
    <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
      {rows.map(([Icon, k]) => (
        <li key={k} style={{ display: 'grid', gridTemplateColumns: '20px 1fr', gap: 10, fontSize: 14, color: 'var(--x-sub)', lineHeight: 1.55 }}>
          <Icon size={16} color="var(--x-accent)" style={{ marginTop: 3 }} aria-hidden />{t(k)}
        </li>
      ))}
    </ul>
  );
}
