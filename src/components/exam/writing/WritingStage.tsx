'use client';
/** Writing layout (design A13): prompt panel 1fr | editor 1.15fr. Tasks switch from the navigator (T1/T2/T3). */
import { useExam, useT } from '@/lib/exam/engine/context';
import { tasksOf } from '@/lib/exam/engine/selectors';
import { ExamImage } from '../questions/MapLabelling';
import { EssayEditor } from './EssayEditor';

export function WritingStage() {
  const { s } = useExam();
  const { t } = useT();
  const tasks = tasksOf(s.content);
  const task = tasks[Math.min(s.partIdx, tasks.length - 1)];
  if (!task) return null;
  const label = task.label ?? t('writing.task_label', { n: s.partIdx + 1 });
  return (
    <div style={{ flex: 1, minHeight: 0, display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1.15fr)', gap: 16, padding: '18px 22px' }}>
      <div style={{ background: 'var(--x-panel)', border: '1px solid var(--x-line)', borderRadius: 16, padding: '26px 30px', display: 'flex', flexDirection: 'column', gap: 14, overflow: 'auto' }}>
        <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: 1, color: 'var(--x-muted)' }}>{label.toUpperCase()}{task.hint ? ` · ${task.hint.toUpperCase()}` : ''}</div>
        <div style={{ fontSize: 'var(--x-fs-q)', lineHeight: 1.65, whiteSpace: 'pre-line' }}>{task.prompt}</div>
        {task.bullets && <ul style={{ margin: 0, paddingLeft: 20, fontSize: 'var(--x-fs-q)', lineHeight: 1.65 }}>{task.bullets.map((b) => <li key={b}>{b}</li>)}</ul>}
        {task.minWords != null && <div style={{ fontSize: 14, color: 'var(--x-sub)', fontWeight: 700 }}>{t('writing.min_words', { n: task.minWords })}</div>}
        {task.imageAssetId && <ExamImage assetId={task.imageAssetId} alt={`${label} chart`} />}
      </div>
      <EssayEditor key={task.questionId} task={task} />
    </div>
  );
}
