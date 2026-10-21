/**
 * Speaking part of the public sample result (speaking-design.md §4.5) — added only while the
 * `speakingLive` launch flag is on. Criterion notes and the transcript are the design's own sample
 * (ExamPlayer.dc.html q.793 / q.1000). No audio: the panel shows `sampleNoAudio` instead of clips.
 */
import type { SpeakingResult } from '@/lib/exam/speaking-types';

const P2 = 'Well, I think the place that changed the most is the old bazaar near my house. Before, it was, um, quite small and crowded, but now there is a new building with a parking area…';
const P3 = 'I think cities change faster when there is more money, because, um, new businesses come and they need modern buildings.';

export const SAMPLE_SPEAKING: SpeakingResult = {
  sectionKey: 'speaking', stageKey: 'speaking', status: 'ready', band: 6.5, label: '6.5', aiGraded: true,
  teacherReviewed: false, teacherNote: null,
  criteria: [
    { key: 'fluency_coherence', name: 'Fluency & Coherence', band: 7, note: 'Speaks at length with some hesitation. Fewer fillers ("um", "like") would help.', nextStep: null,
      quotes: [{ itemKey: 's_p2', part: 2, quote: 'Before, it was, um, quite small and crowded', startMs: null }], },
    { key: 'lexical_resource', name: 'Lexical Resource', band: 6, note: 'Adequate range. Paraphrase more instead of repeating the question.', nextStep: null,
      quotes: [{ itemKey: 's_p3', part: 3, quote: 'new businesses come and they need modern buildings', startMs: null }] },
    { key: 'grammatical_range_accuracy', name: 'Grammatical Range & Accuracy', band: 6, note: 'Mix of simple and complex sentences; some tense errors.', nextStep: null, quotes: [] },
    { key: 'pronunciation', name: 'Pronunciation', band: 7, note: 'Generally clear. Word stress on longer words is sometimes misplaced.', nextStep: null, quotes: [] },
  ],
  summary: null, strengths: [], nextSteps: [],
  noResponse: false, answeredCount: 2, unansweredCount: 0, availableUntil: null,
  audioKeptUntil: null, recordingsDeletedAt: null, recordingsDeleteReason: null,
  items: [
    { itemKey: 's_p2', part: 2, kind: 'cue_card', question: 'Describe a place in your city that has changed a lot.', transcript: P2, noResponse: false, durationMs: 112000, recording: null, recordingDeleted: false },
    { itemKey: 's_p3', part: 3, kind: 'discussion', question: 'Why do some cities change faster than others?', transcript: P3, noResponse: false, durationMs: 48000, recording: null, recordingDeleted: false },
  ],
  transcriptNote: true, canDeleteRecordings: false, timestampsReliable: false,
};
