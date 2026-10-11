'use client';
/** Running section: top bar · banner · (listening strip) · split/questions/writing · navigator · modal. */
import { useEffect, useState } from 'react';
import { useServerNow } from '@/lib/exam/engine/clock';
import { useExam, useT } from '@/lib/exam/engine/context';
import { flatQuestions, partsOf, tasksOf } from '@/lib/exam/engine/selectors';
import { parseIso } from '@/lib/exam/format';
import { PassagePane } from '../passage/PassagePane';
import { QuestionColumn } from '../questions/QuestionColumn';
import { Banners, TabToast } from '../shell/Banners';
import { BottomNav } from '../shell/BottomNav';
import { FinishModal } from '../shell/FinishModal';
import { ListeningStrip, useListeningChain } from '../shell/ListeningStrip';
import { PreviewFinishModal } from '../shell/PreviewFinish';
import { SplitPane } from '../shell/SplitPane';
import { TimerTip, useTimerWarn } from '../shell/TimerPill';
import { TopBar } from '../shell/TopBar';
import { WritingStage } from '../writing/WritingStage';

function useKeys() {
  const { s, dispatch } = useExam();
  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      const typing = el.closest('input, textarea, select, [contenteditable="true"]');
      const groupsN = Math.max(partsOf(s.content).length, tasksOf(s.content).length);
      const first = (i: number) => tasksOf(s.content).length ? null : flatQuestions(s.content).find((q) => q.partIdx === i)?.id ?? null;
      if (e.altKey && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
        e.preventDefault();
        const n = s.partIdx + (e.key === 'ArrowRight' ? 1 : -1);
        if (n >= 0 && n < groupsN) dispatch({ t: 'GOTO', partIdx: n, q: first(n) });
      } else if (!typing && !e.ctrlKey && !e.metaKey && !e.altKey && (e.key === 'f' || e.key === 'F') && s.currentQ && !tasksOf(s.content).length) {
        dispatch({ t: 'FLAG', id: s.currentQ });
      }
    };
    document.addEventListener('keydown', on);
    return () => document.removeEventListener('keydown', on);
  }, [s.content, s.partIdx, s.currentQ, dispatch]);
}

export function SectionView() {
  const { s, stage, sectionCfg, stageCfg } = useExam();
  const { t } = useT();
  const now = useServerNow(250);
  const deadline = parseIso(stage?.deadlineAt);
  const remaining = deadline != null ? (deadline - now) / 1000 : null;
  const { pulse, tip } = useTimerWarn(remaining == null ? null : Math.ceil(remaining));
  const [audioFailed, setAudioFailed] = useState(false);
  const chain = useListeningChain();
  useKeys();

  const parts = partsOf(s.content);
  const isWriting = s.content?.kind === 'writing';
  const hasAudio = parts.some((p) => p.audioAssetId);
  const chainOpen = hasAudio && now - chain.start < chain.end;
  const part = parts[Math.min(s.partIdx, parts.length - 1)];
  const isIelts = s.config?.family === 'IELTS';
  const label = part ? t(part.passageHtml && isIelts ? 'x.passage_n' : 'x.part_n', { n: part.part }) : '';
  const title = sectionCfg?.title ?? '';
  const hl = stageCfg?.tools?.highlight_notes !== false;

  return (
    <>
      <TopBar sectionTitle={title} remaining={remaining} pulse={pulse} />
      <Banners audioFailed={audioFailed} />
      <div style={{ position: 'relative', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        <TimerTip tip={tip} />
        {hasAudio && <ListeningStrip onAudioError={setAudioFailed} />}
        {isWriting ? <WritingStage /> : part && (part.passageHtml
          ? <SplitPane left={<PassagePane part={part} label={label} enabled={hl} />} right={<QuestionColumn part={part} label={label} wide={false} />} />
          : <div style={{ flex: 1, minHeight: 0, display: 'flex' }}><QuestionColumn part={part} label={label} wide /></div>)}
        <TabToast />
      </div>
      <BottomNav finishDisabled={chainOpen} finishHint={t('listening.finish_after_chain')} />
      {s.modal === 'finish' && <FinishModal remaining={remaining} sectionTitle={title} />}
      {s.modal === 'preview_finish' && <PreviewFinishModal />}
    </>
  );
}
