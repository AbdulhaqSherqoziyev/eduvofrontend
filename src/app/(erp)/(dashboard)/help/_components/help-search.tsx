'use client';

import { forwardRef } from 'react';
import { Search, X } from 'lucide-react';
import { NmInput } from '@/components/ui/nm-input';
import { NmIconButton } from '@/components/ui/nm-icon-button';
import { cn } from '@/lib/utils/cn';
import { FOCUS } from './styles';

export const SEARCH_PLACEHOLDER = 'Savolingizni yozing: masalan, "qarz" yoki "xato to\'lov"';

interface Props {
  value: string;
  onChange: (v: string) => void;
}

/** §4.1 — the page's single primary action. No autofocus; `/` focuses, Esc clears. */
export const HelpSearch = forwardRef<HTMLInputElement, Props>(({ value, onChange }, ref) => (
  <div className="relative">
    <NmInput
      ref={ref}
      type="search"
      enterKeyHint="search"
      autoComplete="off"
      spellCheck={false}
      aria-label="Qo'llanmadan qidirish"
      placeholder={SEARCH_PLACEHOLDER}
      icon={<Search className="size-[18px]" />}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === 'Escape' && value) {
          e.preventDefault();
          onChange('');
        }
      }}
      className={cn(
        'text-ellipsis pr-14 [&::-webkit-search-cancel-button]:hidden',
        'focus-visible:ring-2 focus-visible:ring-primary/60',
      )}
    />
    {value ? (
      <NmIconButton
        aria-label="Tozalash"
        onClick={() => onChange('')}
        className={cn('absolute right-[3px] top-1/2 size-11 -translate-y-1/2', FOCUS)}
      >
        <X className="size-4" aria-hidden />
      </NmIconButton>
    ) : null}
  </div>
));
HelpSearch.displayName = 'HelpSearch';
