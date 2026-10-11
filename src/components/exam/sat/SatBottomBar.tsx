'use client';
/**
 * SAT bottom bar 64px (design q.357–366): candidate name · "Question n of N ▴"
 * (dark, opens the grid) · Back / Next. Next on the last question opens Check
 * Your Work (no "Finish module" — D-8 C). On the review page: Back to question;
 * "Finish module" only when the admin quick-test option `nav.early_finish` is on.
 * Staff preview (attempt.isPreview) adds "Finish module (preview)" + chip on
 * both the question and the Check Your Work views — never for a student.
 */
import { useExam, useT } from '@/lib/exam/engine/context';
import type { FlatQ } from '@/lib/exam/engine/selectors';
import { useSatTools } from '@/lib/exam/sat/tools';
import { PreviewFinish } from '../shell/PreviewFinish';
import { Btn } from '../shell/ui';

export function SatBottomBar({ flat }: { flat: FlatQ[] }) {
  const { s, dispatch, stageCfg } = useExam();
  const { t } = useT();
  const tools = useSatTools();
  const idx = Math.max(0, flat.findIndex((q) => q.id === s.currentQ));
  const go = (i: number) => { const q = flat[i]; if (q) dispatch({ t: 'GOTO', partIdx: q.partIdx, q: q.id }); };
  const last = idx >= flat.length - 1;
  const early = stageCfg?.nav?.early_finish === true;
  const name = s.attempt?.candidate?.name ?? '';
  const right: React.ReactNode = tools.review ? (
    <>
      <Btn h={40} variant="accent" onClick={() => tools.setReview(false)} style={{ fontSize: 13, padding: '0 20px', borderRadius: 10 }}>{t('chrome.back_to_question')}</Btn>
      {early && <Btn h={40} variant="dark" onClick={() => dispatch({ t: 'MODAL', modal: 'finish' })} style={{ fontSize: 13, borderRadius: 10 }}>{t('sat.finish_module')}</Btn>}
    </>
  ) : (
    <>
      <Btn h={40} disabled={idx === 0} onClick={() => go(idx - 1)} style={{ fontSize: 13, padding: '0 16px', borderRadius: 10 }}>{t('sat.back')}</Btn>
      <Btn h={40} variant="accent" onClick={() => (last ? tools.setReview(true) : go(idx + 1))} style={{ fontSize: 13, padding: '0 20px', borderRadius: 10 }}>{t('chrome.next')}</Btn>
    </>
  );
  return (
    <div style={{ height: 64, flexShrink: 0, background: 'var(--x-panel)', borderTop: '1px solid var(--x-line)', display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', padding: '0 22px', position: 'relative', zIndex: 7 }}>
      <span style={{ fontSize: 13.5, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</span>
      {tools.review ? <span /> : (
        <button type="button" data-sat-grid-toggle aria-expanded={tools.grid} onClick={() => tools.setGrid(!tools.grid)}
          style={{ height: 38, padding: '0 18px', border: 'none', borderRadius: 10, background: 'var(--x-dark-bg)', color: 'var(--x-dark-fg)', fontSize: 13.5, fontWeight: 800 }}>
          {t('chrome.question_n_of_total', { n: idx + 1, total: flat.length })} {tools.grid ? '▾' : '▴'}
        </button>
      )}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', alignItems: 'center' }}><PreviewFinish />{right}</div>
    </div>
  );
}
