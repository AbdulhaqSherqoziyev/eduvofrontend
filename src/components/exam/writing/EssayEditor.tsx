'use client';
/**
 * Essay editor v1 (design A13, ielts.md §4.4, D-7): serif textarea, spellcheck
 * and autocorrect off, live word count, copy/cut/paste work INSIDE the editor,
 * paste/drop from outside is blocked (logged). Never locked in the last 60 s (T22).
 */
import { useEffect, useRef, useState } from 'react';
import { useServerNow } from '@/lib/exam/engine/clock';
import { useExam, useT } from '@/lib/exam/engine/context';
import { countWords } from '@/lib/exam/format';
import type { WritingTask } from '@/lib/exam/types';

let internalClip = '';

export function EssayEditor({ task }: { task: WritingTask }) {
  const { s, setAnswer, integrity } = useExam();
  const { t } = useT();
  const ref = useRef<HTMLTextAreaElement>(null);
  const [blocked, setBlocked] = useState(false);
  const now = useServerNow(1000);
  const v = s.answers[task.questionId]?.v;
  const text = typeof v === 'string' ? v : '';
  const n = countWords(text);
  const min = task.minWords ?? 0;
  const max = task.maxWords;
  useEffect(() => { ref.current?.focus(); }, [task.questionId]);
  useEffect(() => { if (!blocked) return; const tm = window.setTimeout(() => setBlocked(false), 4000); return () => window.clearTimeout(tm); }, [blocked]);

  const keep = () => {
    const el = ref.current;
    if (el) internalClip = el.value.slice(el.selectionStart, el.selectionEnd);
  };
  const outside = (incoming: string) => incoming.trim() !== '' && incoming !== internalClip;
  const block = (kind: string) => { setBlocked(true); integrity.log('paste', { kind, task: task.key }); };

  const over = max != null && n > max;
  const countLabel = over ? t('writing.count_over', { n, b: max! }) : max != null ? t('writing.count_target', { n, a: min, b: max }) : t('writing.count_min', { n, m: min });
  const countColor = over ? 'var(--x-warn-fg)' : n >= min && min > 0 ? 'var(--x-ok-fg)' : 'var(--x-ink)';
  const ago = s.lastSyncAt ? Math.max(0, Math.round((Date.now() - s.lastSyncAt) / 1000)) : 0;
  void now;

  return (
    <div style={{ background: 'var(--x-panel)', border: '1px solid var(--x-line)', borderRadius: 16, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>
      <textarea ref={ref} data-exam-editor value={text} onChange={(e) => setAnswer([task.questionId], e.target.value || null)}
        onCopy={keep} onCut={keep}
        onPaste={(e) => { if (outside(e.clipboardData.getData('text/plain'))) { e.preventDefault(); block('paste'); } }}
        onDrop={(e) => { if (outside(e.dataTransfer.getData('text/plain'))) { e.preventDefault(); block('drop'); } }}
        spellCheck={false} autoCorrect="off" autoCapitalize="off" autoComplete="off" placeholder={t('x.start_writing')} aria-label={task.label ?? task.key}
        style={{ flex: 1, border: 'none', resize: 'none', padding: '26px 30px', fontFamily: 'var(--x-serif)', fontSize: 'var(--x-fs-passage)', lineHeight: 1.75, background: 'transparent', color: 'var(--x-ink)' }} />
      <div style={{ height: 52, flexShrink: 0, borderTop: '1px solid var(--x-line)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '0 22px' }}>
        <span role={blocked ? 'status' : undefined} style={{ fontSize: 12.5, fontWeight: 700, color: blocked ? 'var(--x-warn-fg)' : 'var(--x-muted)' }}>
          {blocked ? t('writing.paste_blocked') : s.syncFailSince ? `${t('writing.footer', { s: ago }).split('·').slice(0, 2).join('·')}· ${t('x.saved_device')}` : t('writing.footer', { s: ago })}
        </span>
        <span style={{ fontSize: 14, fontWeight: 800, color: countColor, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>{countLabel}</span>
      </div>
    </div>
  );
}
