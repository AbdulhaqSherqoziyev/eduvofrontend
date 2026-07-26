'use client';

import { useLayoutEffect, useRef } from 'react';
import { NmInput } from '@/components/ui/nm-input';
import { cn } from '@/lib/utils/cn';

const MAX_DIGITS = 9;

function digitsOf(value: string): string {
  return value.replace(/\D/g, '');
}

/** "120000" -> "120 000". */
export function groupDigits(digits: string): string {
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

/** Grouped text -> number. An empty field is NOT zero: it returns null. */
export function parseMoney(text: string): number | null {
  const d = digitsOf(text);
  return d === '' ? null : Number(d);
}

interface MoneyFieldProps {
  value: string;
  onValueChange: (next: string) => void;
  id?: string;
  'aria-describedby'?: string;
  className?: string;
}

/**
 * Money input that always shows grouped digits (`90 000`, never `90000`).
 * The caret is restored by *digit count*, so editing in the middle of the
 * number does not jump the cursor to the end after re-formatting.
 */
export function MoneyField({ value, onValueChange, className, ...rest }: MoneyFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const wantDigits = useRef<number | null>(null);

  useLayoutEffect(() => {
    const el = inputRef.current;
    const want = wantDigits.current;
    if (!el || want == null) return;
    wantDigits.current = null;
    let seen = 0;
    let pos = 0;
    while (pos < el.value.length && seen < want) {
      if (el.value[pos] >= '0' && el.value[pos] <= '9') seen += 1;
      pos += 1;
    }
    el.setSelectionRange(pos, pos);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const el = e.currentTarget;
    const caret = el.selectionStart ?? el.value.length;
    const before = digitsOf(el.value.slice(0, caret)).length;
    const raw = digitsOf(el.value).slice(0, MAX_DIGITS);
    const trimmed = raw.replace(/^0+(?=\d)/, '');
    wantDigits.current = Math.max(0, before - (raw.length - trimmed.length));
    onValueChange(groupDigits(trimmed));
  };

  return (
    <div className="relative">
      <NmInput
        ref={inputRef}
        value={value}
        onChange={handleChange}
        inputMode="numeric"
        autoComplete="off"
        className={cn('pr-[52px] text-[16px] md:text-[14.5px]', className)}
        {...rest}
      />
      <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[14px] font-semibold text-muted">
        so&apos;m
      </span>
    </div>
  );
}
