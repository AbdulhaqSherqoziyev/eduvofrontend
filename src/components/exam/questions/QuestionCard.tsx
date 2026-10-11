'use client';
/** Question card (design A7): panel, radius 14, number badge (dark when answered), 2px accent border when current. */
import type { ReactNode } from 'react';
import { useExam } from '@/lib/exam/engine/context';
import { answered } from '@/lib/exam/engine/selectors';

export function NumBadge({ label, done }: { label: string; done: boolean }) {
  return (
    <span style={{ fontWeight: 800, minWidth: 24, height: 24, padding: '0 4px', borderRadius: 6, background: done ? 'var(--x-nav-ans-bg)' : 'var(--x-tile)', color: done ? 'var(--x-nav-ans-fg)' : 'var(--x-sub)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, flexShrink: 0 }}>
      {label}
    </span>
  );
}

export function QuestionCard({ id, rowIds, label, children, prompt }: { id: string; rowIds?: string[]; label: string; prompt?: ReactNode; children?: ReactNode }) {
  const { s, dispatch } = useExam();
  const ids = rowIds ?? [id];
  const isCur = ids.includes(s.currentQ ?? '');
  const done = answered(s.answers, id);
  return (
    <div data-qid={id} onFocusCapture={() => !isCur && dispatch({ t: 'GOTO', partIdx: s.partIdx, q: id })} onMouseDown={() => !isCur && dispatch({ t: 'GOTO', partIdx: s.partIdx, q: id })}
      style={{ background: 'var(--x-panel)', borderRadius: 14, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10, border: `2px solid ${isCur ? 'var(--x-accent)' : 'transparent'}` }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', fontSize: 'var(--x-fs-q)', lineHeight: 1.5 }}>
        <NumBadge label={label} done={done} />
        <div style={{ flex: 1, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>{prompt}</div>
      </div>
      {children && <div style={{ paddingLeft: 36 }}>{children}</div>}
    </div>
  );
}
