/**
 * Writing/Speaking criteria labels and scales for the result screen (AiTaskPanel).
 * IELTS: ielts.md §Writing JSON keys, 0–9 bands. CEFR: cefr.md §6.2–6.3 derived
 * sub-scores (task_fulfilment, grammar, vocabulary, cohesion, mechanics /
 * pronunciation_fluency), 0–5. Unknown keys are shown raw.
 */
import type { ExamFamily } from './hub-types';

const norm = (k: string) => k.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');

const TA = 'Vazifa bajarilishi (Task Achievement)';
const TR = 'Vazifaga javob (Task Response)';

const IELTS: Record<string, string> = {
  task_achievement: TA,
  task_response: TR,
  coherence_and_cohesion: 'Izchillik va bog\'liqlik (Coherence and Cohesion)',
  coherence_cohesion: 'Izchillik va bog\'liqlik (Coherence and Cohesion)',
  lexical_resource: 'Lug\'at boyligi (Lexical Resource)',
  grammatical_range_and_accuracy: 'Grammatik xilma-xillik va aniqlik (Grammatical Range and Accuracy)',
  grammatical_range_accuracy: 'Grammatik xilma-xillik va aniqlik (Grammatical Range and Accuracy)',
};

const CEFR: Record<string, string> = {
  task_fulfilment: 'Topshiriq bajarilishi (mazmun)',
  task_fulfillment: 'Topshiriq bajarilishi (mazmun)',
  grammar: 'Grammatik tuzilmalar',
  vocabulary: 'Lug\'at',
  cohesion: 'Bog\'lanish vositalari va izchillik',
  mechanics: 'Punktuatsiya va imlo',
  pronunciation_fluency: 'Talaffuz va ravonlik',
};

/** Max value of one criterion bar: IELTS bands 0–9, CEFR sub-scores 0–5. */
export function criterionMax(family: ExamFamily): number {
  return family === 'CEFR' ? 5 : 9;
}

/**
 * Human label for a criterion key. IELTS "task_achievement_or_response" is
 * Task Achievement on Task 1 and Task Response on Task 2.
 */
export function criterionLabel(family: ExamFamily, key: string, taskIndex: number): string {
  const k = norm(key);
  if (family === 'CEFR') return CEFR[k] ?? key;
  if (family === 'IELTS') {
    if (k === 'task_achievement_or_response' || k === 'task_achievement_response') return taskIndex === 0 ? TA : TR;
    return IELTS[k] ?? key;
  }
  return key;
}

/** IELTS bands with one decimal ("6.5"); CEFR as whole numbers ("4", a two-pass mean may be "4.5"). */
export function criterionValue(family: ExamFamily, v: number): string {
  if (family !== 'CEFR') return v.toFixed(1);
  return Number.isInteger(v) ? String(v) : String(Math.round(v * 2) / 2);
}
