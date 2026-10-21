'use client';
/**
 * IELTS Speaking section (design ExamPlayer q.259–280 + q.367–369, speaking-design.md §1.3–1.6):
 * top bar with a "Part n" pill (no clock), banners, segment progress, question / cue card / examiner line,
 * stage strip, note line, and the fixed 56px bottom bar. No global hotkeys (focus hygiene, §1.3).
 */
import { useExam, useT } from '@/lib/exam/engine/context';
import type { SpeakingStageContent } from '@/lib/exam/speaking-types';
import { useSpeakingFlow } from '@/lib/exam/speaking/use-speaking-flow';
import { useWave } from '@/lib/exam/speaking/use-mic';
import { useQueue } from '@/lib/exam/speaking/use-queue';
import { Banners } from '../shell/Banners';
import { TopBar } from '../shell/TopBar';
import { DoneCard, ExaminerLineCard, MicLostCard } from './Cards';
import { CueCard, NotesBox } from './CueCard';
import { useNotes } from './notes';
import { QuestionCard } from './QuestionCard';
import { SegmentProgress } from './SegmentProgress';
import { SpeakingStrip } from './SpeakingStrip';
import { useFinishStage } from './use-finish-stage';

export function SpeakingStage({ content }: { content: SpeakingStageContent }) {
  const { s, sectionCfg } = useExam();
  const { t } = useT();
  const f = useSpeakingFlow(content);
  const wave = useWave(f.mic.meter, f.phase === 'recording');
  const q = useQueue(s.attemptId);
  const notes = useNotes(s.attemptId);
  const done = useFinishStage();
  const it = f.item;
  const audioOnly = s.ui.audioOnly || content.promptDisplay === 'audio_only';
  const textNow = content.promptDisplay === 'text' || f.audioDone;
  const recItems = content.items.filter((x) => x.records && x.part === it?.part);
  const qn = it ? Math.max(1, recItems.findIndex((x) => x.itemKey === it.itemKey) + 1) : 0;
  const capsQ = it ? `${t('speaking.part_n', { n: it.part }).toUpperCase()} · ${t('speaking.question_n_of_m', { n: qn, m: recItems.length }).toUpperCase()}` : '';
  const listening = f.phase === 'recording';
  const p2 = it?.kind === 'cue_card';
  const p2Card = content.items.find((x) => x.kind === 'cue_card');
  const showNotes = content.notesField && p2 && ['listen', 'prep', 'countdown', 'recording', 'saving', 'saved'].includes(f.phase);
  const pill = (
    <div style={{ width: 132, height: 38, borderRadius: 19, background: 'var(--x-tile)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800 }}>
      {it ? t('speaking.part_n', { n: it.part }) : sectionCfg?.title}
    </div>
  );

  let body: React.ReactNode = null;
  if (f.phase === 'mic_lost' && f.lost) body = <MicLostCard st={f.lost} onReconnect={() => void f.reconnect()} />;
  else if (f.phase === 'finishing') body = <DoneCard pending={q.pending} sent={Math.max(0, q.total - q.pending)} total={q.total} offline={q.offline} last={done.last} busy={done.busy} failed={done.failed} onGo={() => void done.go()} />;
  else if (it?.kind === 'examiner_line') body = <ExaminerLineCard caps={(it.itemKey === content.items[0]?.itemKey ? 'SPEAKING' : t('speaking.part_n', { n: it.part }).toUpperCase())} text={it.prompt} showText={textNow && !audioOnly} />;
  else if (it && p2) body = <CueCard item={it} caps={`${t('speaking.part_n', { n: 2 }).toUpperCase()} · ${t('speaking.task_card').toUpperCase()}`} listening={listening} />;
  else if (it) {
    body = (
      <QuestionCard caps={capsQ} text={it.prompt} showText={textNow} audioOnly={audioOnly} listening={listening}
        repeat={{ show: f.phase !== 'recording' && f.phase !== 'saving' && f.phase !== 'saved', enabled: f.phase === 'reveal' || f.phase === 'countdown', used: f.repeatUsed, onClick: f.repeat }} />
    );
  }

  return (
    <>
      <TopBar sectionTitle={sectionCfg?.title ?? ''} remaining={null} pulse={false} pill={pill} />
      <Banners micSilent={wave.silent} queued={q.pending > 0} />
      {/* design q.261 (centre, gap 24, padding 24); `margin: auto` keeps the top reachable when Part 2 is taller than the screen */}
      <div style={{ flex: 1, minHeight: 0, overflow: 'auto', display: 'flex', flexDirection: 'column', padding: 24 }}>
        <div style={{ margin: 'auto 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
        {f.phase !== 'boot' && <SegmentProgress items={content.items} idx={f.phase === 'finishing' ? content.items.length : f.idx} />}
        {body}
        {showNotes && p2Card && <NotesBox value={notes.value} onChange={notes.set} readOnly={f.phase !== 'prep' && f.phase !== 'listen'} autoFocus={f.phase === 'prep'} />}
        {it && f.phase !== 'mic_lost' && f.phase !== 'finishing' && f.phase !== 'boot' && <SpeakingStrip f={f} bars={wave.bars} />}
        </div>
      </div>
      <div style={{ height: 56, flexShrink: 0, background: 'var(--x-panel)', borderTop: '1px solid var(--x-line)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: 'var(--x-muted)' }}>
        {t('speaking.bottom_note')}
      </div>
    </>
  );
}
