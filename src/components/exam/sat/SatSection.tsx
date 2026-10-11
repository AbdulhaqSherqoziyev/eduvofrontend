'use client';
/**
 * Running Digital SAT module (design q.123–366, sat.md §4): top bar
 * "SAT mock / {Section} · Module n" · timer (hide/show, no 10-min pulse, forced
 * visible at 5 min) · Calculator/Reference/More · one question at a time ·
 * Check Your Work after the last Next · bottom bar with the grid pop-over.
 * Tool state is per module: the component is keyed by stageKey.
 */
import { useEffect } from 'react';
import { useServerNow } from '@/lib/exam/engine/clock';
import { useExam, useT } from '@/lib/exam/engine/context';
import { flatQuestions, partsOf } from '@/lib/exam/engine/selectors';
import { parseIso } from '@/lib/exam/format';
import { hasCalculator, moduleNo } from '@/lib/exam/sat/flow';
import { SatToolsContext, useSatTools, useSatToolsState } from '@/lib/exam/sat/tools';
import { Banners, TabToast } from '../shell/Banners';
import { FinishModal } from '../shell/FinishModal';
import { PreviewFinishModal } from '../shell/PreviewFinish';
import { TimerTip, useTimerWarn } from '../shell/TimerPill';
import { TopBar } from '../shell/TopBar';
import { BreakScreen } from './BreakScreen';
import { CheckYourWork } from './CheckYourWork';
import { DesmosPanel } from './DesmosPanel';
import { LineReader } from './LineReader';
import { ReferenceSheet } from './ReferenceSheet';
import { SatBottomBar } from './SatBottomBar';
import { SatNavigator } from './SatNavigator';
import { SatQuestion } from './SatQuestion';
import { SatTopTools } from './SatTopTools';

function Module() {
  const { s, stage, sectionCfg, stageCfg } = useExam();
  const { t } = useT();
  const tools = useSatTools();
  const now = useServerNow(250);
  const deadline = parseIso(stage?.deadlineAt);
  const remaining = deadline != null ? (deadline - now) / 1000 : null;
  const { pulse, tip } = useTimerWarn(remaining == null ? null : Math.ceil(remaining), { warn10: false });

  const flat = flatQuestions(s.content);
  const parts = partsOf(s.content);
  const idx = Math.max(0, flat.findIndex((q) => q.id === s.currentQ));
  const fq = flat[idx];
  const part = fq ? parts[fq.partIdx] : undefined;
  const math = hasCalculator(stageCfg) || sectionCfg?.key === 'math';
  const highlight = !math && stageCfg?.tools?.highlight_notes !== false;
  const { setReview } = tools;
  useEffect(() => { setReview(false); }, [s.currentQ, setReview]); // finish-modal chips jump back to a question
  const title = `${sectionCfg?.title ?? ''} · ${t('sat.module_n', { n: moduleNo(s.stages, s.stageKey) })}`;

  return (
    <>
      <TopBar sectionTitle={title} remaining={remaining} pulse={pulse} extra={<SatTopTools math={math} />} />
      <Banners />
      <div style={{ position: 'relative', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        <TimerTip tip={tip} />
        <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', zoom: tools.zoom }}>
          {tools.review ? <CheckYourWork flat={flat} title={title} />
            : fq && part ? <SatQuestion key={fq.id} fq={fq} n={idx + 1} part={part} highlight={highlight} /> : null}
        </div>
        {tools.lineReader && <LineReader />}
        {math && <DesmosPanel open={tools.calc} onClose={() => tools.setCalc(false)} />}
        {math && <ReferenceSheet open={tools.ref} onClose={() => tools.setRef(false)} />}
        {tools.grid && !tools.review && <SatNavigator flat={flat} title={title} />}
        <TabToast />
      </div>
      <SatBottomBar flat={flat} />
      {s.modal === 'finish' && <FinishModal remaining={remaining} sectionTitle={title} />}
      {s.modal === 'preview_finish' && <PreviewFinishModal />}
    </>
  );
}

function ModuleScope() {
  const { attemptId } = useExam().s;
  const tools = useSatToolsState(attemptId);
  return <SatToolsContext.Provider value={tools}><Module /></SatToolsContext.Provider>;
}

/** Phase 'section' for SAT: the break stage or a question module (fresh tools per module). */
export function SatStage() {
  const { s, stage } = useExam();
  if (stage?.kind === 'break' || s.content?.kind === 'break') return <BreakScreen />;
  return <ModuleScope key={s.stageKey ?? ''} />;
}
