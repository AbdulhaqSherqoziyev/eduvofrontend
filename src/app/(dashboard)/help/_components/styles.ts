/** Shared class strings for the Qo'llanma (SPEC §12). */

/** Focus ring used on every custom interactive element (§12.3). */
export const FOCUS =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background';

/** Readable secondary text — never `text-muted` (§12.1); globals.css re-maps it in dark. */
export const SOFT = 'text-[#5b6b82]';

/** Small uppercase label ("MISOL", "BILASIZMI?"). */
export const LABEL = 'text-[11px] font-bold uppercase tracking-[1px] text-[#5b6b82]';

/** Tone pills with ≥4.5:1 text in both themes (§12.2). */
export const TONE = {
  green: 'text-[#11683f] bg-[rgba(43,182,115,0.14)] dark:text-[#5fd39c] dark:bg-[rgba(52,192,127,0.16)]',
  yellow: 'text-[#7a4e0a] bg-[rgba(232,161,58,0.18)] dark:text-[#f0bd5f] dark:bg-[rgba(224,163,60,0.16)]',
  red: 'text-[#a8281f] bg-[rgba(228,87,76,0.14)] dark:text-[#ff8a80] dark:bg-[rgba(239,106,95,0.16)]',
  gray: 'text-[#4a586d] bg-[rgba(122,134,153,0.16)] dark:text-[#b8c2d3] dark:bg-[rgba(147,160,180,0.16)]',
} as const;

/** Tone text colour alone (icons next to plain text). */
export const TONE_TEXT = {
  green: 'text-[#11683f] dark:text-[#5fd39c]',
  yellow: 'text-[#7a4e0a] dark:text-[#f0bd5f]',
  red: 'text-[#a8281f] dark:text-[#ff8a80]',
} as const;

/** Sticky search height + gap, so scrolled-to headings are not hidden under it (§6.3). */
export const SCROLL_MT = 'scroll-mt-[76px] xl:scroll-mt-4';
