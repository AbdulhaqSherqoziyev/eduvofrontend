/**
 * `content` JSON shapes per question type. The contract leaves `content` open;
 * these are the shapes the player renders and the mock adapter produces.
 * Sent to Bekzod as the proposed DTO (report §"So'rovlar").
 *
 * Answer values: mcq_single / matching / map_label(options) → option key;
 * mcq_multi → string[] (written to every row of the group, ielts.md §3 A1);
 * gap_fill / map_label(text) → string.
 */
export interface Option { key: string; text: string; imageAssetId?: string }

export type ChoiceLabels = 'tfng' | 'ynng' | 'tf3' | 'tf2';

export interface McqSingleContent {
  prompt?: string;
  /** SAT R&W: the question's own short text (contract §1b; small HTML subset). */
  passage?: string;
  /** SAT: figure/graph for this question + its text description. */
  imageAssetId?: string;
  imageAlt?: string;
  options?: Option[];
  labels?: ChoiceLabels;
  layout?: 'rows' | 'pills';
}

/** Choose TWO/THREE: the group has `multiGroup:true`; options + maxSelect live on the group. */
export interface McqMultiContent { prompt?: string }

export interface GapContent {
  pre?: string;
  post?: string;
  prompt?: string; // short_answer: the question line above the input
  wordLimit?: number;
  allowNumber?: boolean;
}

export interface MatchingContent { prompt: string }

export interface MapLabelContent { label?: string }

export type QuestionContent = McqSingleContent | McqMultiContent | GapContent | MatchingContent | MapLabelContent;

export type GapLayout = 'sentence' | 'form' | 'note' | 'table' | 'flowchart' | 'short_answer' | 'summary';

export interface GroupContent {
  heading?: string;
  /** Inline template; `{{12}}` marks the gap for question no 12. Lines split on \n,
   *  table cells on `|`, flow-chart boxes are lines. */
  template?: string;
  options?: Option[];
  bank?: Option[];
  maxSelect?: number;
  imageAssetId?: string;
  // ── req (not in contract v1.1) ──
  prompt?: string; // multiGroup question line ("Which TWO things…")
  uniqueOptions?: boolean;
  bankTitle?: string;
  bankPosition?: 'side' | 'top';
  bankKind?: 'headings' | 'options' | 'summary';
  imageAlt?: string;
  markers?: { no: number; x: number; y: number }[]; // percent of image box
  mapMode?: 'options' | 'text';
}


export const LABEL_SETS: Record<ChoiceLabels, Option[]> = {
  tfng: [{ key: 'TRUE', text: 'TRUE' }, { key: 'FALSE', text: 'FALSE' }, { key: 'NOT GIVEN', text: 'NOT GIVEN' }],
  ynng: [{ key: 'YES', text: 'YES' }, { key: 'NO', text: 'NO' }, { key: 'NOT GIVEN', text: 'NOT GIVEN' }],
  tf3: [{ key: 'True', text: 'True' }, { key: 'False', text: 'False' }, { key: 'No information', text: 'No information' }],
  tf2: [{ key: 'R', text: '对 Right' }, { key: 'W', text: '错 Wrong' }],
};
