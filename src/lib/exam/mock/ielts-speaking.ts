/**
 * Mock IELTS Speaking content (contract §1) — Aziza `ielts-speaking.md` §2 item flow:
 * examiner lines, Part 1 frames, Part 2 cue card + rounding-off, Part 3 discussion.
 * `short` keeps the full shape with fewer items and shorter times (dev / screenshots).
 */
import type { SpeakingItem, SpeakingStageContent } from '../speaking-types';

type Row = [kind: SpeakingItem['kind'], part: 1 | 2 | 3, prompt: string, extra?: Partial<SpeakingItem>];

const P1: string[][] = [
  ['Do you work or are you a student?', 'What do you like most about your studies?', 'Would you like to change anything about them?'],
  ['What do you usually do at the weekend?', 'Do you prefer to spend weekends alone or with others?', 'How were weekends different when you were a child?'],
];
const P3 = [
  'Why do some cities change faster than others?',
  'Should governments protect old buildings, or let cities modernise?',
  'How might the places where people live change in the next fifty years?',
];

function rows(short: boolean): Row[] {
  const p1 = short ? [P1[0].slice(0, 2), P1[1].slice(0, 1)] : P1;
  return [
    ['examiner_line', 1, "Good morning. My name is Sarah, and I'm your examiner. In this first part, I'd like to ask you some questions about yourself."],
    ...p1.flatMap((f, fi) => f.map((q, qi): Row => ['interview', 1, q, { frame: `p1_f${fi + 1}`, itemKey: `p1_f${fi + 1}_q${qi + 1}` }])),
    ['examiner_line', 2, "Now I'm going to give you a topic, and I'd like you to talk about it for one to two minutes. You have one minute to think about what you are going to say. You can make some notes if you wish."],
    ['cue_card', 2, 'Describe a place in your city that has changed a lot.', {
      bullets: ['where it is', 'what it was like before', 'how it has changed'],
      cardFollowUp: 'and explain how you feel about the change.', itemKey: 'p2_card',
    }],
    ['rounding_off', 2, 'Do you think other people feel the same way about this change?', { itemKey: 'p2_r1' }],
    ['examiner_line', 3, "We've been talking about a place that has changed. I'd now like to discuss with you some more general questions related to this."],
    ...(short ? P3.slice(0, 2) : P3).map((q, i): Row => ['discussion', 3, q, { frame: 'p3_t1', itemKey: `p3_t1_q${i + 1}` }]),
    ['examiner_line', 3, 'Thank you. That is the end of the speaking test.'],
  ];
}

const RESPONSE: Record<SpeakingItem['kind'], number> = { examiner_line: 0, interview: 30, cue_card: 120, rounding_off: 20, discussion: 60 };

export function ieltsSpeaking(short: boolean): SpeakingStageContent {
  let line = 0;
  const items = rows(short).map(([kind, part, prompt, extra]): SpeakingItem => {
    const records = kind !== 'examiner_line';
    const itemKey = extra?.itemKey ?? `line_${++line}`;
    const words = prompt.split(/\s+/).length;
    const full = RESPONSE[kind];
    return {
      itemKey, part, kind, records, prompt, bullets: null, cardFollowUp: null, frame: null,
      promptAudioAssetId: `speaking-audio-${itemKey}`,
      promptAudioDurationMs: Math.round(Math.max(1.6, words / 2.6) * 1000),
      imageAssetId: null,
      prepSec: kind === 'cue_card' ? (short ? 15 : 60) : 0,
      responseSec: short ? Math.min(full, kind === 'cue_card' ? 75 : 20) : full,
      minResponseSec: kind === 'cue_card' ? (short ? 20 : 60) : null,
      ...extra,
    };
  });
  return { kind: 'speaking', promptDisplay: 'audio_then_text', notesField: true, items };
}

/** Scripted deadline (contract §1): Σ(promptAudio + prep + response + 5 s) + 60 s. */
export function speakingDurationMs(c: SpeakingStageContent): number {
  return c.items.reduce((a, it) => a + (it.promptAudioDurationMs ?? 0) + (it.prepSec + it.responseSec + 5) * 1000, 0) + 60_000;
}
