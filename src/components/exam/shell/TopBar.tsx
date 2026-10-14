'use client';
/**
 * Top bar 60px (design A1): "{short} mock / {section}" · timer · candidate, [exam tools], Aa, Settings.
 * Directions: a pop-over with the section's `intro`. For the Digital SAT the button sits top-left
 * next to the section title (Bluebook) and is always there — when the config has no `intro`
 * the default Bluebook directions for R&W / Math (with the SPR rules) are shown.
 */
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useExam, useT } from '@/lib/exam/engine/context';
import { useExamHost } from '../host';
import type { FontKey } from '@/lib/exam/engine/state';
import { isSat } from '@/lib/exam/sat/flow';
import { RichText } from './RichText';
import { SettingsMenu } from './SettingsMenu';
import { TimerPill } from './TimerPill';
import { Btn } from './ui';

const FONTS: FontKey[] = ['s', 'm', 'l'];
const btn = { height: 36, padding: '0 12px', borderRadius: 9, border: '1.5px solid var(--x-line)', background: 'transparent', color: 'var(--x-ink)', fontSize: 12.5, fontWeight: 700 } as const;

export function TopBar({ sectionTitle, remaining, pulse, short, noWarn, extra, notes, submit }: {
  sectionTitle: string; remaining: number | null; pulse: boolean; short?: string; noWarn?: boolean; extra?: ReactNode;
  /** B2C only: "Notes · N" button (IELTS Reading) */
  notes?: boolean;
  /** B2C only: "Submit section" in the top bar (IELTS) */
  submit?: { disabled?: boolean; hint?: string };
}) {
  const { s, setUi, sectionCfg, dispatch } = useExam();
  const { t } = useT();
  const [dirOpen, setDirOpen] = useState(false);
  const host = useExamHost();
  const cand = s.attempt?.candidate;
  const font = s.ui.font;
  const sat = isSat(s.config);
  // SAT: always available (Bluebook); other exams: only when the config carries an intro
  const directions = sectionCfg?.intro?.trim() || (sat ? t(sectionCfg?.key === 'math' ? 'sat.directions_math' : 'sat.directions_rw') : null);
  const dirBtn = directions ? <button type="button" style={btn} aria-haspopup="dialog" aria-expanded={dirOpen} onClick={() => setDirOpen(true)}>{t('chrome.directions')}</button> : null;
  const dirDialog = dirOpen && directions && (
    <div role="dialog" aria-modal="true" aria-label={`${sectionCfg?.title ?? ''} · ${t('chrome.directions')}`} onClick={() => setDirOpen(false)} onKeyDown={(e) => { if (e.key === 'Escape') setDirOpen(false); }} style={{ position: 'fixed', inset: 0, background: 'var(--x-overlay)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 30 }}>
      <div className="x-pop" onClick={(e) => e.stopPropagation()} style={{ width: 560, maxWidth: 'calc(100vw - 32px)', maxHeight: 'calc(100vh - 48px)', background: 'var(--x-panel)', border: '1px solid var(--x-line)', borderRadius: 20, padding: 28, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ fontSize: 20, fontWeight: 800 }}>{sectionCfg?.title} · {t('chrome.directions')}</div>
        <div style={{ fontSize: 14.5, color: 'var(--x-sub)', lineHeight: 1.6, overflowY: 'auto', minHeight: 0 }}><RichText html={directions} /></div>
        <div style={{ fontSize: 12, color: 'var(--x-muted)' }}>{t('chrome.directions_timer_note')}</div>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}><Btn autoFocus onClick={() => setDirOpen(false)}>{t('chrome.close')}</Btn></div>
      </div>
    </div>
  );

  if (host.b2c) {
    // mock.eduvo.uz (Player.dc.html): logo · "IELTS Academic · Reading" / "Name · IA-0142" | timer | tools · Submit section
    const name = host.candidateName || cand?.name || '';
    const sub2 = [name, cand?.code].filter(Boolean).join(' · ');
    const examName = s.config?.name ?? s.config?.family ?? '';
    return (
      <div style={{ height: 60, flexShrink: 0, background: 'var(--x-panel)', borderBottom: '1px solid var(--x-line)', display: 'grid', gridTemplateColumns: 'minmax(0,1fr) auto minmax(0,1fr)', alignItems: 'center', gap: 16, padding: '0 20px', position: 'relative', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
          {host.topBarBrand}
          <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            {/* SAT: "Reading and Writing · Module 1" alone (Bluebook) — the exam name would push it out of the bar */}
            <span title={sat ? sectionTitle : `${examName} · ${sectionTitle}`} style={{ fontSize: 13, fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{sat ? sectionTitle : `${examName} · ${sectionTitle}`}</span>
            {sub2 && <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--x-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{sub2}</span>}
          </div>
          {sat && dirBtn}
        </div>
        <TimerPill remaining={remaining} pulse={pulse} noWarn={noWarn} hideToggle={sat} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8, minWidth: 0 }}>
          {!sat && dirBtn}
          {extra}
          {notes && <NotesButton />}
          {host.topBarTools}
          {submit && <button type="button" onClick={() => dispatch({ t: 'MODAL', modal: 'finish' })} disabled={submit.disabled} title={submit.disabled ? submit.hint : undefined}
            style={{ ...btn, border: 'none', background: submit.disabled ? 'var(--x-disabled)' : 'var(--x-accent)', color: '#fff', fontWeight: 800, padding: '0 14px', whiteSpace: 'nowrap', cursor: submit.disabled ? 'not-allowed' : 'pointer' }}>{t('x.submit_section')}</button>}
        </div>
        {dirDialog}
      </div>
    );
  }

  return (
    <div style={{ height: 60, flexShrink: 0, background: 'var(--x-panel)', borderBottom: '1px solid var(--x-line)', display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', padding: '0 22px', position: 'relative', zIndex: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
        {host.topBarBrand}
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
        {host.topBarTools}
        <button type="button" style={{ ...btn, fontSize: 13, fontWeight: 800, whiteSpace: 'nowrap' }} aria-label={t('chrome.text_size')}
          onClick={() => setUi({ font: FONTS[(FONTS.indexOf(font) + 1) % 3] })}>Aa {font.toUpperCase()}</button>
        <SettingsMenu />
      </div>
      {dirDialog}
    </div>
  );
}

/** B2C "Notes · N": the learner's passage notes in a pop-over (Player.dc.html). */
function NotesButton() {
  const { s } = useExam();
  const { t } = useT();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const notes = s.highlights.filter((h) => h.note);
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === 'Escape' : !ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', close);
    return () => { document.removeEventListener('mousedown', close); document.removeEventListener('keydown', close); };
  }, [open]);
  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button type="button" style={{ ...btn, whiteSpace: 'nowrap' }} aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen((o) => !o)}>{t('x.notes_n', { n: notes.length })}</button>
      {open && (
        <div role="dialog" aria-label={t('x.notes_n', { n: notes.length })} className="x-pop" style={{ position: 'absolute', right: 0, top: 44, width: 320, maxHeight: 360, overflowY: 'auto', background: 'var(--x-panel)', border: '1px solid var(--x-pop-border)', boxShadow: 'var(--x-pop-shadow)', borderRadius: 16, padding: 14, zIndex: 40, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {notes.length === 0 && <div style={{ fontSize: 13.5, color: 'var(--x-sub)', lineHeight: 1.5 }}>{t('x.notes_empty')}</div>}
          {notes.map((n) => (
            <div key={n.id} style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: '8px 10px', borderRadius: 10, background: 'var(--x-tile)' }}>
              <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: 0.6, color: 'var(--x-muted)' }}>{t('x.passage_n', { n: n.part })}</span>
              <span style={{ fontSize: 13.5, lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{n.note}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
