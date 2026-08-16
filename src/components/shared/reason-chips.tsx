'use client';

import { cn } from '@/lib/utils/cn';

interface ReasonChipsProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
  /** A signed day shows what was picked; it does not offer to pick again (§D.5). */
  readOnly?: boolean;
}

/**
 * One-tap reason picker (§C.4, §D.3a, §F.2, §F.3).
 *
 * Everywhere the system needs to know WHY, it asks with chips rather than a
 * text box. A mandatory free-text field at 20:30 does not produce an
 * explanation — it produces an abandoned form, or a figure bent to avoid the
 * question. One tap sits below that fatigue threshold and still returns an
 * answer a report can be built on; the free text stays optional beside it.
 */
export function ReasonChips({ options, value, onChange, className, readOnly }: ReasonChipsProps) {
  return (
    <div className={cn('flex flex-wrap gap-2.5', className)} role="radiogroup">
      {options.map((option) => {
        const active = option === value;
        return (
          <button
            key={option}
            type="button"
            role="radio"
            aria-checked={active}
            disabled={readOnly}
            onClick={() => onChange(option)}
            className={cn(
              'h-[40px] rounded-ctl border-0 bg-background px-4 font-sans text-[12.5px] font-bold transition-all',
              active ? 'text-primary shadow-nm-inset-sm' : 'text-[#5b6b82] shadow-nm-sm',
              !active && !readOnly ? 'nm-pressable' : '',
              readOnly ? 'cursor-default' : '',
            )}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}
