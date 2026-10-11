import { StatusPill } from '@/components/shared/status-pill';
import { CUSTOM_BADGE, CUSTOM_BADGE_HINT } from '@/lib/utils/price-labels';

/**
 * "alohida" — this student pays their own monthly price in this group.
 * Neutral on purpose (never green or red): a different price is a fact, not a
 * good or a bad thing. Used on the profile and the group roster.
 */
export function CustomPriceBadge() {
  return (
    // aria-label on a plain <span> is ignored by most screen readers; the
    // explanation is real (visually hidden) text instead, so it is read aloud.
    <span title={CUSTOM_BADGE_HINT} className="inline-flex">
      <StatusPill label={CUSTOM_BADGE} tone="muted" className="px-2 py-[2px] text-[11px]" />
      <span className="sr-only"> — {CUSTOM_BADGE_HINT}</span>
    </span>
  );
}
