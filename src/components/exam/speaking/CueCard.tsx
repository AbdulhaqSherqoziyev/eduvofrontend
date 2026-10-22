'use client';
/**
 * Part 2 task card + notes (spec §1.4, design q.268 → larger, M8). The card text is always shown
 * (a real candidate holds the card), also in audio-only mode. Notes are not graded and never sent:
 * they live on this device; read-only once speaking starts (caret off, still scrollable).
 * TL 10-22: notes 88px and a tighter card so Part 2 fits 1280×720 (the strip with "I'm ready" stays visible).
 */
import { Lock } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useT } from '@/lib/exam/engine/context';
import type { SpeakingItem } from '@/lib/exam/speaking-types';
import { CapsRow } from './QuestionCard';

const MAX = 600;

export function CueCard({ item, caps, listening }: { item: SpeakingItem; caps: string; listening: boolean }) {
  return (
    <div lang="en" style={{ width: 660, background: 'var(--x-panel)', border: '1.5px solid var(--x-border)', borderRadius: 18, padding: '18px 32px', display: 'flex', flexDirection: 'column', gap: 10 }}>
      <CapsRow left={caps} listening={listening} />
      <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: -0.3, lineHeight: 1.35 }}>{item.prompt}</div>
      {item.bullets?.length ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--x-sub)' }}>You should say:</div>
          {item.bullets.map((b) => (
            <div key={b} style={{ display: 'flex', alignItems: 'baseline', gap: 10, fontSize: 16, lineHeight: 1.55 }}>
              <span aria-hidden style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--x-ink)', flexShrink: 0, transform: 'translateY(-3px)' }} />{b}
            </div>
          ))}
        </div>
      ) : null}
      {item.cardFollowUp && <div style={{ fontSize: 16, fontWeight: 700 }}>{item.cardFollowUp}</div>}
    </div>
  );
}

export function NotesBox({ value, onChange, readOnly, autoFocus }: { value: string; onChange: (v: string) => void; readOnly: boolean; autoFocus: boolean }) {
  const { t } = useT();
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => { if (autoFocus && !readOnly) ref.current?.focus(); }, [autoFocus, readOnly]);
  return (
    <div style={{ width: 660, background: readOnly ? 'var(--x-tile)' : 'var(--x-field)', border: '1px solid var(--x-line)', borderRadius: 14, padding: '10px 16px', display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 800, color: 'var(--x-muted)' }}>
          <label htmlFor="sp-notes">{t('speaking.notes_label')}</label>
          {readOnly && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontWeight: 500 }}><Lock size={12} aria-hidden />{t('speaking.notes_readonly')}</span>}
        </span>
        <span style={{ fontSize: 12, color: 'var(--x-muted)', fontVariantNumeric: 'tabular-nums' }}>{value.length} / {MAX}</span>
      </div>
      <textarea id="sp-notes" ref={ref} value={value} readOnly={readOnly} maxLength={MAX} spellCheck={false} autoCorrect="off" autoCapitalize="off" autoComplete="off"
        placeholder={t('speaking.notes_placeholder')} onChange={(e) => onChange(e.target.value.slice(0, MAX))}
        style={{ height: 88, resize: 'none', border: 'none', outline: 'none', background: 'transparent', fontFamily: 'var(--x-serif)', fontSize: 15, lineHeight: 1.6, color: 'var(--x-ink)', caretColor: readOnly ? 'transparent' : undefined }} />
    </div>
  );
}
