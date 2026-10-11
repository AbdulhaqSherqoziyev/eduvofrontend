/** Practice-mode content (design G5): 20 s audio + gap, mcq, tfng. Never sent to the server. */
import type { StageCfg, StageContent } from '@/lib/exam/types';

export const TRY_AUDIO = 'try-audio';
export const TRY_STAGE: StageCfg = { key: 'try', kind: 'questions', timer: { mode: 'fixed', duration_sec: 120 }, audio: { play_count: 1 }, nav: { back: true, flag: true, early_finish: true } };
const L = (key: string, text: string) => ({ key, text });

export const TRY_CONTENT: StageContent = {
  kind: 'questions',
  parts: [{
    part: 1, title: 'Practice', instructions: null, passageHtml: null, imageAssetId: null, audioAssetId: TRY_AUDIO, audioDurationMs: 20_000,
    groups: [
      { id: 'try-g1', layout: 'sentence', instructions: 'Complete the sentence. Write ONE WORD.', content: null, multiGroup: false,
        questions: [{ id: 'try-1', no: 1, type: 'gap_fill', check: 'text_normalized', points: 1, content: { pre: 'The library opens at nine on', post: '.', wordLimit: 1 } }] },
      { id: 'try-g2', layout: 'rows', instructions: 'Choose the correct letter, A, B or C.', content: null, multiGroup: false,
        questions: [{ id: 'try-2', no: 2, type: 'mcq_single', check: 'exact', points: 1, content: { prompt: 'What does the speaker recommend?', options: [L('A', 'booking a room early'), L('B', 'bringing a student card'), L('C', 'using the side entrance')] } }] },
      { id: 'try-g3', layout: 'pills', instructions: 'Choose TRUE, FALSE or NOT GIVEN.', content: null, multiGroup: false,
        questions: [{ id: 'try-3', no: 3, type: 'tfng', check: 'exact', points: 1, content: { prompt: 'The café inside the library is open on Sundays.' } }] },
    ],
  }],
};
