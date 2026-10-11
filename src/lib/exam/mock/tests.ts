/** Mock test bank: two configs (IELTS Academic, CEFR) + stage content and keys. */
import type { ExamConfig, MediaRef, WritingTask } from '../types';
import { buildStage, svgData, type BuiltStage, type MockPart } from './build';
import { ieltsListening, MAP_SVG } from './ielts-listening';
import { ieltsReading } from './ielts-reading';
import { cefrListening, cefrReading } from './cefr';

export interface MockStage { sectionKey: string; stageKey: string; kind: 'questions' | 'writing'; built?: BuiltStage; tasks?: WritingTask[] }
export interface MockTest { name: string; config: ExamConfig; stages: MockStage[]; images: Record<string, string> }

const CHART_SVG = svgData(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 240" font-family="sans-serif" font-size="11">
<rect width="420" height="240" fill="#fff"/><text x="12" y="18" font-size="12" font-weight="700" fill="#1e2a3a">Household energy by source, 2024 (%)</text>
<g fill="#4a586c"><text x="60" y="228">Country A</text><text x="185" y="228">Country B</text><text x="310" y="228">Country C</text></g>
<g><rect x="50" y="80" width="22" height="130" fill="#2e6be6"/><rect x="76" y="140" width="22" height="70" fill="#1f9d6b"/><rect x="102" y="170" width="22" height="40" fill="#d68a1a"/>
<rect x="175" y="120" width="22" height="90" fill="#2e6be6"/><rect x="201" y="100" width="22" height="110" fill="#1f9d6b"/><rect x="227" y="185" width="22" height="25" fill="#d68a1a"/>
<rect x="300" y="160" width="22" height="50" fill="#2e6be6"/><rect x="326" y="150" width="22" height="60" fill="#1f9d6b"/><rect x="352" y="90" width="22" height="120" fill="#d68a1a"/></g>
<g fill="#4a586c"><rect x="250" y="30" width="10" height="10" fill="#2e6be6"/><text x="264" y="39">Gas</text><rect x="300" y="30" width="10" height="10" fill="#1f9d6b"/><text x="314" y="39">Solar</text><rect x="355" y="30" width="10" height="10" fill="#d68a1a"/><text x="369" y="39">Coal</text></g></svg>`);

const task = (key: string, label: string, hint: string, prompt: string, min: number, max: number | null, img: string | null = null): WritingTask => ({
  questionId: `writing-${key}`, key, type: 'essay', prompt, imageAssetId: img, bullets: null, minWords: min, maxWords: max, weight: 1, label, hint,
});

function stage(sectionKey: string, parts: MockPart[]): MockStage {
  return { sectionKey, stageKey: sectionKey, kind: 'questions', built: buildStage(sectionKey, sectionKey, parts) };
}

export function mockTest(code: 'ielts' | 'cefr', short: boolean): MockTest {
  const aSec = short ? 12 : 40;
  if (code === 'cefr') {
    return {
      name: 'CEFR Multilevel (mock)',
      images: {},
      config: { code: 'CEFR_MULTILEVEL_EN', family: 'CEFR', short: 'CEFR', name: 'CEFR Multilevel (mock)', label: 'CEFR-format practice test', ui: { min_width_px: 1280, ui_locale: 'en' }, precheck: ['audio', 'fullscreen'],
        sections: [
          { key: 'listening', title: 'Listening', order: 1, brief: { durationSec: 2700, questions: 8, parts: 2 }, intro: 'Each recording plays twice. Before each part you have 20 seconds to read the questions. You can move between parts at any time.',
            stages: [{ key: 'listening', kind: 'questions', timer: { mode: 'fixed', duration_sec: short ? 200 : 2700 },
              audio: { play_count: 2, repeat_gap_sec: 3, pre_prep_sec: short ? 8 : 20, inter_part_gap_sec: 5, chain: 'auto' }, nav: { back: true, flag: true, early_finish: 'after_audio_chain' } }] },
          { key: 'reading', title: 'Reading', order: 2, brief: { durationSec: 3600, questions: 9, parts: 2 }, intro: 'Read the texts and answer the questions. You can move between parts.',
            stages: [{ key: 'reading', kind: 'questions', layout: 'split_passage', timer: { mode: 'fixed', duration_sec: short ? 150 : 3600 }, nav: { back: true, flag: true, early_finish: true }, tools: { highlight_notes: true } }] },
          { key: 'writing', title: 'Writing', order: 3, brief: { durationSec: 3600, tasks: 3 }, intro: 'Task 1 has two letters based on one situation. Task 2 is an online post. In the official exam Writing is handwritten; here you type.',
            stages: [{ key: 'writing', kind: 'writing', timer: { mode: 'fixed', duration_sec: short ? 150 : 3600 }, can_switch_tasks: true, nav: { back: true, early_finish: true } }] },
        ] },
      stages: [
        stage('listening', cefrListening(short ? 10 : 25)),
        stage('reading', cefrReading()),
        { sectionKey: 'writing', stageKey: 'writing', kind: 'writing', tasks: [
          task('task11', 'Task 1.1', 'informal letter · about 50 words', 'Your sports club is moving to a new building next month.\nWrite a letter to your friend. Tell them about the move and how you feel about it.', 50, null),
          task('task12', 'Task 1.2', 'formal letter', 'Write a letter to the club manager. Say what you like about the new building and suggest one improvement.', 120, 150),
          task('task2', 'Task 2', 'online post', 'Some people think young people should take a gap year before university. Write a post for a student website giving your opinion.', 180, 200),
        ] },
      ],
    };
  }
  return {
    name: 'IELTS Academic (mock)',
    images: { 'img-map-1': MAP_SVG, 'img-chart-1': CHART_SVG },
    config: { code: 'IELTS_ACADEMIC', family: 'IELTS', short: 'IELTS', name: 'IELTS Academic (mock)', label: 'IELTS-format mock', ui: { min_width_px: 1280, ui_locale: 'en' }, precheck: ['audio', 'fullscreen'],
      sections: [
        { key: 'listening', title: 'Listening', order: 1, brief: { durationSec: 1800, questions: 20, parts: 4 }, intro: 'The recording plays once and starts automatically. You can move between parts while listening. You get 2 minutes at the end to check your answers.',
          stages: [{ key: 'listening', kind: 'questions', timer: { mode: 'audio_driven', review_sec: short ? 20 : 120 },
            audio: { play_count: 1, lead_in_sec: 5 }, nav: { back: true, flag: true, early_finish: true }, tools: { highlight_notes: true } }] },
        { key: 'reading', title: 'Reading', order: 2, brief: { durationSec: 3600, questions: 16, parts: 3 }, intro: 'Three passages. The passage scrolls on the left, questions are on the right. You can move between passages at any time.',
          stages: [{ key: 'reading', kind: 'questions', layout: 'split_passage', timer: { mode: 'fixed', duration_sec: short ? 150 : 3600 }, nav: { back: true, flag: true, early_finish: true }, tools: { highlight_notes: true } }] },
        { key: 'writing', title: 'Writing', order: 3, brief: { durationSec: 3600, tasks: 2 }, intro: 'Two tasks. Spend about 20 minutes on Task 1 and 40 minutes on Task 2. Word count is shown live.',
          stages: [{ key: 'writing', kind: 'writing', timer: { mode: 'fixed', duration_sec: short ? 150 : 3600 }, can_switch_tasks: true, nav: { back: true, early_finish: true } }] },
      ] },
    stages: [
      stage('listening', ieltsListening(aSec)),
      stage('reading', ieltsReading()),
      { sectionKey: 'writing', stageKey: 'writing', kind: 'writing', tasks: [
        task('task1', 'Task 1', 'about 20 minutes', 'The chart below shows the share of household energy use by source in three countries in 2024.\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.', 150, null, 'img-chart-1'),
        task('task2', 'Task 2', 'about 40 minutes', 'Some people believe that public transport should be free for everyone. Others think passengers should pay the full cost.\nDiscuss both views and give your own opinion.', 250, null),
      ] },
    ],
  };
}

/** media[] for a stage: audio as mock:// URLs (synthesized on fetch), images as data URLs. */
export function stageMedia(t: MockTest, s: MockStage): MediaRef[] {
  const audio: MediaRef[] = (s.built?.audio ?? []).map((a) => ({ assetId: a.assetId, url: `mock://audio/${a.assetId}?ms=${a.durationMs}`, kind: 'audio', bytes: Math.round(a.durationMs * 16), durationMs: a.durationMs }));
  const imgIds = new Set<string>();
  s.built?.parts.forEach((p) => p.groups.forEach((g) => g.content?.imageAssetId && imgIds.add(g.content.imageAssetId)));
  s.tasks?.forEach((tk) => tk.imageAssetId && imgIds.add(tk.imageAssetId));
  const imgs: MediaRef[] = Array.from(imgIds).map((id) => ({ assetId: id, url: t.images[id] ?? '', kind: 'image', bytes: 0, durationMs: null }));
  return [...audio, ...imgs];
}
