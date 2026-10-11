'use client';
/**
 * Staff preview only (attempt.isPreview / previewEarlyFinish): a bottom-bar
 * "Finish module (preview)" button with a yellow "Preview only" chip, and a
 * small confirm modal that runs the normal stage submit (reason 'user').
 * A student attempt never renders either — `canPreviewFinish` gates both.
 * A 409 from an older backend (no early finish yet) shows a message, no crash.
 */
import { Eye } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useExam, useT } from '@/lib/exam/engine/context';
import { canPreviewFinish } from '@/lib/exam/engine/preview';
import { Bi, Btn, Spinner } from './ui';

const chipStyle = { display: 'inline-flex', alignItems: 'center', gap: 5, maxWidth: 260, padding: '4px 9px', borderRadius: 999, background: 'var(--x-warn-bg)', color: 'var(--x-warn-fg)', border: '1px solid var(--x-flag)', fontSize: 11, fontWeight: 700, lineHeight: 1.25, textAlign: 'left' } as const;

/** Chip + button for a bottom bar. `onDark` = the break screen (dark page, white button). */
export function PreviewFinish({ onDark }: { onDark?: boolean }) {
  const { s, dispatch } = useExam();
  const { t } = useT();
  if (!canPreviewFinish(s.attempt)) return null;
  const dark = onDark ? { background: '#fff', color: '#1E2A3A', border: 'none' } : {};
  return (
    <div data-preview-finish style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
      <span style={chipStyle}><Eye size={12} aria-hidden />{t('x.preview_chip')}</span>
      <Btn h={40} variant="dark" disabled={s.submitting} onClick={() => dispatch({ t: 'MODAL', modal: 'preview_finish' })} style={{ fontSize: 13, borderRadius: 10, ...dark }}>
        {t('x.preview_finish')}
      </Btn>
    </div>
  );
}

type SubmitErr = NonNullable<ReturnType<typeof useExam>['s']['submitError']>;
function errorPair(e: SubmitErr, bi: ReturnType<typeof useT>['bi']): [string, string] {
  if (e.status === 409) return bi('x.preview_finish_409');
  return bi('x.preview_finish_err', { msg: e.message || e.code || (e.status != null ? `HTTP ${e.status}` : 'network') });
}

/** Confirm dialog: Esc / overlay / Cancel keep the module; Finish = submit('user'). */
export function PreviewFinishModal() {
  const { s, dispatch, submit } = useExam();
  const { t, bi } = useT();
  const cancelRef = useRef<HTMLButtonElement>(null);
  const close = () => dispatch({ t: 'MODAL', modal: null });
  useEffect(() => {
    cancelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  if (!canPreviewFinish(s.attempt)) return null;
  const err = s.submitError;
  return (
    <div onClick={close} style={{ position: 'absolute', inset: 0, background: 'var(--x-overlay)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 30 }}>
      <div role="dialog" aria-modal="true" aria-labelledby="x-preview-finish-title" className="x-pop" onClick={(e) => e.stopPropagation()}
        style={{ width: 420, maxWidth: 'calc(100% - 32px)', background: 'var(--x-panel)', border: '1px solid var(--x-line)', borderRadius: 20, padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <span style={chipStyle}><Eye size={12} aria-hidden />{t('x.preview_chip')}</span>
        <div id="x-preview-finish-title"><Bi pair={bi('x.preview_finish_q')} size={17} weight={800} /></div>
        {err && <div role="alert" style={{ background: 'var(--x-err-bg)', color: 'var(--x-err-fg)', borderRadius: 12, padding: '10px 12px' }}><Bi pair={errorPair(err, bi)} size={13} /></div>}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 4 }}>
          <Btn ref={cancelRef} h={44} onClick={close}>{t('x.cancel')}</Btn>
          <Btn variant="dark" h={44} disabled={s.submitting} onClick={() => void submit('user')}>
            {s.submitting ? <><Spinner size={14} /> {t('finish.submitting')}</> : t('x.preview_finish')}
          </Btn>
        </div>
      </div>
    </div>
  );
}
