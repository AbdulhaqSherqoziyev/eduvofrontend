/**
 * Mock `speaking` result block (contract §4). Status walks received → transcribing → scoring → ready
 * over ~24 s after the stage locks. Attempt id variants: `*noresp*` → no_response, `*tooshort*` →
 * too_short, `*low*` → band 5.0 (low-band block), `*review*` → needs_review.
 */
import type { SpeakingResult, SpeakingStageContent } from '../speaking-types';
import { synthWav } from './audio';

const STEP_MS = 8000;
const LONG_TRANSCRIPT = "Well, I think the place that changed the most is the old bazaar near my house. Before, it was, um, quite small and crowded, but now there is a new building with a parking area, and to be honest I have mixed feelings about it.";

let clipCache: string | null = null;
function clipUrl(): string {
  if (typeof window === 'undefined') return '';
  if (!clipCache) clipCache = URL.createObjectURL(new Blob([synthWav(9000, 0.7).buffer as ArrayBuffer], { type: 'audio/wav' }));
  return clipCache;
}

export function mockSpeakingResult(id: string, c: SpeakingStageContent, lockedAt: string | null, serverNow: string, uploaded: Record<string, number>, extra: { restarts?: string[]; audioOnly?: boolean } = {}): SpeakingResult {
  const items = c.items.filter((i) => i.records);
  const since = lockedAt ? Date.parse(serverNow) - Date.parse(lockedAt) : -1;
  const low = id.includes('low');
  const status: SpeakingResult['status'] = !lockedAt ? 'pending'
    : since < STEP_MS ? 'received' : since < 2 * STEP_MS ? 'transcribing' : since < 3 * STEP_MS ? 'scoring'
      : id.includes('noresp') ? 'no_response' : id.includes('tooshort') ? 'too_short' : id.includes('review') ? 'needs_review' : 'ready';
  const ready = status === 'ready';
  const b = low ? 5 : 6;
  const kept = new Date(Date.parse(serverNow) + 365 * 864e5).toISOString();
  const answered = items.filter((i, k) => uploaded[i.itemKey] != null || k % 5 !== 4);
  return {
    sectionKey: 'speaking', stageKey: 'speaking', status,
    band: ready ? (low ? 5 : 6) : null, label: ready ? (low ? '5.0' : '6.0') : null, aiGraded: true,
    teacherReviewed: false, teacherNote: null, teacherName: null, audioOnly: !!extra.audioOnly, audioRetentionDays: 365,
    criteria: ready ? [
      { key: 'fluency_coherence', name: 'Fluency & Coherence', band: b, note: 'You speak at length with some hesitation; linking words are mostly simple.', nextStep: 'Practise 1-minute answers on everyday topics without stopping.',
        quotes: [{ itemKey: 'p3_t1_q1', part: 3, quote: 'Well, I think the main reason is money, because, um, rich cities can build faster.', startMs: null }, { itemKey: 'p1_f1_q1', part: 1, quote: "I'm a student, I study economics at university.", startMs: null }] },
      { key: 'lexical_resource', name: 'Lexical Resource', band: b, note: 'Vocabulary is adequate for familiar topics; some words are repeated.', nextStep: 'Paraphrase the question in your first sentence instead of repeating it.',
        quotes: [{ itemKey: 'p2_card', part: 2, quote: 'Before, it was quite small and crowded.', startMs: null }] },
      { key: 'grammatical_range_accuracy', name: 'Grammatical Range & Accuracy', band: low ? 4 : 5, note: 'Mostly simple sentences; past tenses are sometimes mixed.', nextStep: 'Tell a short story about last weekend using only past tenses.',
        quotes: [{ itemKey: 'p2_card', part: 2, quote: 'Now there is a new building and they builded a parking.', startMs: null }] },
      { key: 'pronunciation', name: 'Pronunciation', band: b, note: 'Generally clear; stress on longer words is sometimes misplaced.', nextStep: 'Record yourself reading 5 long words and compare with a dictionary.',
        quotes: [], wordsToPractise: ['comfortable', 'vegetable', 'development', 'environment', 'particularly'].map((word) => ({ word, itemKey: 'p2_card', startMs: null })) },
    ] : null,
    summary: ready ? 'You answered every part and kept talking in Part 2. The next step is more varied grammar.' : null,
    strengths: ready ? ['You developed your Part 2 answer with details and a personal opinion.'] : [],
    nextSteps: ready ? ['Use past tenses consistently when you describe changes.', 'Paraphrase questions instead of repeating them.'] : [],
    noResponse: status === 'no_response' || status === 'too_short', answeredCount: answered.length, unansweredCount: items.length - answered.length,
    availableUntil: status === 'pending' ? new Date(Date.parse(serverNow) + 7 * 864e5).toISOString() : null,
    audioKeptUntil: lockedAt ? kept : null, recordingsDeletedAt: null, recordingsDeleteReason: null,
    items: items.map((i, k) => {
      const none = k % 5 === 4 && uploaded[i.itemKey] == null;
      return {
        itemKey: i.itemKey, part: i.part, kind: i.kind, question: i.prompt, noResponse: none,
        transcript: none || since < 2 * STEP_MS ? null : i.kind === 'cue_card' ? LONG_TRANSCRIPT : 'I think it depends on the person, but for me it is quite important.',
        durationMs: none ? null : uploaded[i.itemKey] ?? i.responseSec * 700,
        recording: none ? null : { id: `rec-${i.itemKey}`, url: clipUrl(), expiresAt: new Date(Date.parse(serverNow) + 3600e3).toISOString(), mime: 'audio/wav' },
        recordingDeleted: false, responseSec: i.responseSec, restarted: !!extra.restarts?.includes(i.itemKey), backupRecording: null,
      };
    }),
    transcriptNote: true, canDeleteRecordings: false, timestampsReliable: false,
  };
}
