'use client';

import { Check } from 'lucide-react';
import { FieldLabel } from '@/components/ui/label';
import { formatSom } from '@/lib/utils/format';
import { ReasonChips } from '@/components/shared/reason-chips';

export const PENDING_REASON = 'Tasdiq kutayotgan xarajat';
const BASE_REASONS = ['Mayda qaytim', 'Yozilmagan xarajat'];
const LAST_REASON = 'Keyin aniqlanadi';

const BIG_ABS = 500_000;
const BIG_RATIO = 0.1;

/** Is the shortfall about the size of what is still waiting for approval? */
export function nearPending(diff: number, pendingAmount: number): boolean {
  if (pendingAmount <= 0 || diff === 0) return false;
  return Math.abs(Math.abs(diff) - pendingAmount) <= pendingAmount * BIG_RATIO;
}

interface DayEndDiffProps {
  /** counted − expected. Negative = less in the drawer than the books say. */
  diff: number;
  expected: number;
  pendingAmount: number;
  reason: string;
  onReason: (value: string) => void;
  /** True once "Kunni yakunlash" was blocked by a missing chip. */
  missing: boolean;
  /** A signed day is read through, not filled in (§D.5). */
  readOnly?: boolean;
}

/**
 * §D.3 — the difference, said plainly.
 *
 * No red, no warning triangle, no exclamation mark, and none of the words
 * "kamomad" / "yetishmayapti" / "tekshiruv". A daily difference is ordinary —
 * small change, a 5 000 som expense nobody wrote down. A system that treats it
 * as an accusation every evening gets one of two outcomes: the cashier stops
 * reconciling, or types the expected figure instead of the counted one. Both
 * destroy the data the count exists to produce.
 */
export function DayEndDiff({
  diff, expected, pendingAmount, reason, onReason, missing, readOnly,
}: DayEndDiffProps) {
  if (diff === 0) {
    return (
      <div className="flex items-center gap-2 rounded-ctl bg-background p-3.5 text-[14px] font-bold text-success shadow-nm-inset-sm">
        <Check className="size-4" />
        Hammasi to&apos;g&apos;ri keldi.
      </div>
    );
  }

  const close = nearPending(diff, pendingAmount);
  // Suppressed whenever something is pending: the gap already has a named
  // explanation, and "count it again" would send the cashier hunting for a
  // mistake that is not theirs [SV2].
  const big = pendingAmount <= 0 && (Math.abs(diff) > BIG_ABS || Math.abs(diff) > expected * BIG_RATIO);
  const options = [...BASE_REASONS, ...(pendingAmount > 0 ? [PENDING_REASON] : []), LAST_REASON];

  return (
    <>
      <div className="rounded-ctl bg-background p-3.5 shadow-nm-inset-sm">
        <div className="text-[14px] font-bold text-foreground">
          Farq: {formatSom(diff)} — sanoqda {diff < 0 ? 'kam' : "ko'p"} chiqdi.
        </div>
        <p className="mt-1.5 text-[11.5px] font-medium text-muted">
          Farq odatda mayda qaytim yoki yozilmagan xarajatdan chiqadi. Sababini belgilab qo&apos;ying — keyin
          osonroq topiladi.
        </p>
        {close ? (
          <p className="mt-1.5 text-[11.5px] font-medium text-foreground">
            Farq tasdiq kutayotgan xarajatga yaqin — ehtimol sabab shu.
          </p>
        ) : null}
        {big ? (
          <p className="mt-1.5 text-[11.5px] font-medium text-foreground">
            Farq katta ko&apos;rinyapti — summani yana bir marta sanab ko&apos;ring.
          </p>
        ) : null}
      </div>

      <div>
        <FieldLabel>SABAB</FieldLabel>
        {missing && !reason ? (
          <p className="mb-2 text-[11.5px] font-medium text-muted">Sababni belgilang.</p>
        ) : null}
        <ReasonChips options={options} value={reason} onChange={onReason} readOnly={readOnly} />
      </div>
    </>
  );
}
