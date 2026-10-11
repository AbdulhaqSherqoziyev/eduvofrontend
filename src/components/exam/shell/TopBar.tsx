'use client';
/**
 * Top bar 60px (design A1): "{short} mock / {section}" · timer · candidate, [exam tools], Aa, Settings.
 * Directions: a pop-over with the section's `intro`. For the Digital SAT the button sits top-left
 * next to the section title (Bluebook) and is always there — when the config has no `intro`
 * the default Bluebook directions for R&W / Math (with the SPR rules) are shown.
 */
import { useState, type ReactNode } from 'react';
import { useExam, useT } from '@/lib/exam/engine/context';
import type { FontKey } from '@/lib/exam/engine/state';
import { isSat } from '@/lib/exam/sat/flow';
import { RichText } from './RichText';
import { SettingsMenu } from './SettingsMenu';
import { TimerPill } from './TimerPill';
import { Btn } from './ui';

const FONTS: FontKey[] = ['s', 'm', 'l'];
const btn = { height: 36, padding: '0 12px', borderRadius: 9, border: '1.5px solid var(--x-line)', background: 'transparent', color: 'var(--x-ink)', fontSize: 12.5, fontWeight: 700 } as const;

export function TopBar({ sectionTitle, remaining, pulse, short, noWarn, extra }: { sectionTitle: string; remaining: number | null; pulse: boolean; short?: string; noWarn?: boolean; extra?: ReactNode }) {
  const { s, setUi, sectionCfg } = useExam();
  const { t } = useT();
  const [dirOpen, setDirOpen] = useState(false);
  const cand = s.attempt?.candidate;
  const font = s.ui.font;
  const sat = isSat(s.config);
  // SAT: always available (Bluebook); other exams: only when the config carries an intro
  const directions = sectionCfg?.intro?.trim() || (sat ? t(sectionCfg?.key === 'math' ? 'sat.directions_math' : 'sat.directions_rw') : null);
  const dirBtn = directions ? <button type="button" style={btn} aria-haspopup="dialog" aria-expanded={dirOpen} onClick={() => setDirOpen(true)}>{t('chrome.directions')}</button> : null;
  return (
    <div style={{ height: 60, flexShrink: 0, background: 'var(--x-panel)', borderBottom: '1px solid var(--x-line)', display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', padding: '0 22px', position: 'relative', zIndex: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
        <span style={{ fontSize: 14.5, fontWeight: 800, whiteSpace: 'nowrap' }}>{short ?? s.config?.short ?? s.config?.family} {t('x.mock')}</span>
        <span style={{ color: 'var(--x-muted)' }}>/</span>
        <span style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--x-sub)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{sectionTitle}</span>
        {sat && dirBtn}
      </div>
      <TimerPill remaining={remaining} pulse={pulse} noWarn={noWarn} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
        {cand && <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--x-sub)', marginRight: 6, whiteSpace: 'nowrap' }}>{cand.name}{cand.code ? ` · ${cand.code}` : ''}</span>}
        {!sat && dirBtn}
        {extra}
        <button type="button" style={{ ...btn, fontSize: 13, fontWeight: 800 }} aria-label={t('chrome.text_size')}
          onClick={() => setUi({ font: FONTS[(FONTS.indexOf(font) + 1) % 3] })}>Aa {font.toUpperCase()}</button>
        <SettingsMenu />
      </div>
      {dirOpen && directions && (
        <div role="dialog" aria-modal="true" aria-label={`${sectionCfg?.title ?? ''} · ${t('chrome.directions')}`} onClick={() => setDirOpen(false)} onKeyDown={(e) => { if (e.key === 'Escape') setDirOpen(false); }} style={{ position: 'fixed', inset: 0, background: 'var(--x-overlay)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 30 }}>
          <div className="x-pop" onClick={(e) => e.stopPropagation()} style={{ width: 560, maxWidth: 'calc(100vw - 32px)', maxHeight: 'calc(100vh - 48px)', background: 'var(--x-panel)', border: '1px solid var(--x-line)', borderRadius: 20, padding: 28, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ fontSize: 20, fontWeight: 800 }}>{sectionCfg?.title} · {t('chrome.directions')}</div>
            <div style={{ fontSize: 14.5, color: 'var(--x-sub)', lineHeight: 1.6, overflowY: 'auto', minHeight: 0 }}><RichText html={directions} /></div>
            <div style={{ fontSize: 12, color: 'var(--x-muted)' }}>{t('chrome.directions_timer_note')}</div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}><Btn autoFocus onClick={() => setDirOpen(false)}>{t('chrome.close')}</Btn></div>
          </div>
        </div>
      )}
    </div>
  );
}
