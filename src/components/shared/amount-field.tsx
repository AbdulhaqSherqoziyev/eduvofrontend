'use client';

import { NmInput } from '@/components/ui/nm-input';
import { FieldLabel } from '@/components/ui/label';
import { formatNumber } from '@/lib/utils/format';
import { somToWords } from '@/lib/utils/som-to-words';

interface AmountFieldProps {
  label: string;
  /** Needed when a screen carries two amount fields (the opening balance). */
  id?: string;
  /** Raw digits ("3500000"); grouping is display-only. */
  value: string;
  onChange: (digits: string) => void;
  autoFocus?: boolean;
  /** Locked while a form is saving, or when the source of the figure is not
   *  wired yet (the per-lesson rate — payroll spec §A.4a). */
  disabled?: boolean;
  /** Validation copy — one of the only two places red is allowed (§0.8/a). */
  error?: string;
  /** Extra lines under the words (balance hint, approval-limit notice). */
  children?: React.ReactNode;
}

/**
 * Money input with the amount spelled out underneath (§B.2).
 *
 * The costliest and commonest cash-desk mistake is one zero too many: "350 000"
 * and "3 500 000" are not told apart at a glance, but "uch yuz ellik ming" and
 * "uch million besh yuz ming" cannot be confused. Non-digits are dropped
 * silently — a minus sign would let a negative amount through validation.
 */
export function AmountField({
  label, id = 'amount', value, onChange, autoFocus, disabled, error, children,
}: AmountFieldProps) {
  const words = somToWords(Number(value || 0));
  return (
    <div>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <div className="relative">
        <NmInput
          id={id}
          inputMode="numeric"
          autoFocus={autoFocus}
          disabled={disabled}
          placeholder="0"
          value={value ? formatNumber(Number(value)) : ''}
          onChange={(e) => onChange(e.target.value.replace(/\D/g, '').replace(/^0+(?=\d)/, ''))}
          className="h-[54px] pr-[62px] text-[20px] font-extrabold text-primary"
        />
        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[13px] font-bold text-muted">
          so&apos;m
        </span>
      </div>
      {words ? <div className="mt-1.5 text-[11.5px] font-semibold text-muted">{words} so&apos;m</div> : null}
      {error ? <div className="mt-1.5 text-[11.5px] font-semibold text-danger">{error}</div> : null}
      {children}
    </div>
  );
}
