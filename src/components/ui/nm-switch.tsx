'use client';

import { cn } from '@/lib/utils/cn';

interface NmSwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  'aria-label'?: string;
}

/** Pressed-in neomorphic toggle (permission rows, settings). */
export function NmSwitch({ checked, onCheckedChange, disabled, ...rest }: NmSwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={rest['aria-label']}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        'relative h-7 w-12 flex-shrink-0 rounded-full border-0 p-0 transition-all duration-200 disabled:opacity-50',
        checked ? 'bg-background shadow-nm-inset-sm' : 'bg-background shadow-nm-sm',
      )}
    >
      <span
        className={cn(
          'absolute top-1 size-5 rounded-full transition-[left] duration-300 ease-[cubic-bezier(.34,1.4,.5,1)]',
          checked
            ? 'left-6 bg-primary shadow-[0_2px_6px_rgba(46,107,230,0.5)]'
            : 'left-1 bg-background shadow-nm-sm',
        )}
      />
    </button>
  );
}
