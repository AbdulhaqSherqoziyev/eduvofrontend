/**
 * Exact shadow / fill values of `Eduvo Mock Exams v3.dc.html` (light theme),
 * with the app's dark-theme neomorphic vars as the dark fallback. Kept as full
 * literal class strings so Tailwind's scanner picks them up.
 */
export const SH = {
  /** Cards (RAISED). */
  card: 'shadow-[-6px_-6px_14px_rgba(255,255,255,0.9),6px_6px_16px_rgba(163,177,198,0.46)] dark:shadow-nm',
  /** Buttons, header pills, sidebar footer card. */
  btn: 'shadow-[-4px_-4px_10px_rgba(255,255,255,0.9),4px_4px_10px_rgba(163,177,198,0.46)] dark:shadow-nm-sm',
  /** Selected filter chip, finished pipeline step (RSM). */
  rsm: 'shadow-[-3px_-3px_7px_rgba(255,255,255,0.9),3px_3px_7px_rgba(163,177,198,0.42)] dark:shadow-nm-sm',
  /** Small raised chip (section chips, CEFR pill, accepted variants). */
  chip: 'shadow-[-2px_-2px_5px_rgba(255,255,255,0.9),2px_2px_5px_rgba(163,177,198,0.4)] dark:shadow-nm-sm',
  /** Pressed: filter track, selected card, inputs (INSET). */
  inset: 'shadow-[inset_-3px_-3px_7px_rgba(255,255,255,0.85),inset_3px_3px_7px_rgba(163,177,198,0.5)] dark:shadow-nm-inset',
  /** Info wells (card strip, passes, essay text, import checks). */
  well: 'shadow-[inset_-3px_-3px_7px_rgba(255,255,255,0.85),inset_3px_3px_7px_rgba(163,177,198,0.45)] dark:shadow-nm-inset',
  /** Table rows. */
  row: 'shadow-[inset_-2px_-2px_5px_rgba(255,255,255,0.7),inset_2px_2px_5px_rgba(163,177,198,0.35)] dark:shadow-nm-inset-sm',
  /** Conversion / variant tiles. */
  tile: 'shadow-[inset_-2px_-2px_5px_rgba(255,255,255,0.75),inset_2px_2px_5px_rgba(163,177,198,0.4)] dark:shadow-nm-inset-sm',
  /** Disabled-looking pressed button ("Nashr qilish" while blocked). */
  sunk: 'shadow-[inset_-2px_-2px_5px_rgba(255,255,255,0.8),inset_2px_2px_5px_rgba(163,177,198,0.4)] dark:shadow-nm-inset-sm',
  /** Primary gradient button. */
  primary:
    'bg-[linear-gradient(135deg,#3D78EE,#2E6BE6)] text-white shadow-[-4px_-4px_10px_rgba(255,255,255,0.5),6px_6px_14px_rgba(46,107,230,0.38)] dark:shadow-nm-primary',
} as const;

/** Press feedback used by the design's `style-active`. */
export const PRESS = 'transition-shadow active:shadow-[inset_-3px_-3px_7px_rgba(255,255,255,0.85),inset_3px_3px_7px_rgba(163,177,198,0.5)] dark:active:shadow-nm-inset';

/** Design method badges `M`. */
export const METHOD: Record<'auto' | 'ai' | 'mix', [string, string, string]> = {
  auto: ['AUTO', '#1F7A55', '#E5F5EE'],
  ai: ['AI', '#5B3FD1', '#EEE9FF'],
  mix: ['AUTO + AI', '#7A4E00', '#FFF1D6'],
};

/** Design AI-job status chips `ST`. */
export const JOB_ST: Record<'done' | 'run' | 'third' | 'retry', [string, string, string]> = {
  done: ['TAYYOR', '#1F7A55', '#E5F5EE'],
  run: ['BAHOLANMOQDA', '#2E6BE6', 'rgba(46,107,230,0.1)'],
  third: ['3-BAHOLASH', '#7A4E00', '#FFF1D6'],
  retry: ['QAYTA URINISH', '#B23A2E', 'rgba(228,87,76,0.12)'],
};

export const FAMILY_INK: Record<string, string> = {
  IELTS: 'oklch(0.5 0.15 255)', CEFR: 'oklch(0.5 0.11 160)', SAT: 'oklch(0.5 0.13 300)',
  TOEFL: 'oklch(0.5 0.11 60)', HSK: 'oklch(0.52 0.14 20)',
};
