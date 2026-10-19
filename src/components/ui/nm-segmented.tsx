'use client';

import { cn } from '@/lib/utils/cn';

export interface SegmentItem {
  value: string;
  label: string;
}

interface NmSegmentedProps {
  items: SegmentItem[];
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
  size?: 'sm' | 'md';
  'aria-label'?: string;
}

/**
 * Sliding-pill segmented control (filters, tabs, payment method, language).
 *
 * "Nothing selected" (`value` not in `items`, e.g. a custom date range): the pill is not rendered,
 * every tab says aria-selected=false, and only the first tab is in the Tab order (one entry point
 * into the group); ←/→/Home/End move between tabs.
 */
export function NmSegmented({ items, value, onValueChange, className, size = 'md', 'aria-label': ariaLabel }: NmSegmentedProps) {
  const found = items.findIndex((i) => i.value === value);
  const idx = Math.max(0, found);
  const none = found < 0;
  const n = items.length;
  const h = size === 'sm' ? 'h-[46px]' : 'h-[50px]';

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const keys = ['ArrowLeft', 'ArrowRight', 'Home', 'End'];
    if (!keys.includes(e.key)) return;
    const tabs = Array.from(e.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]:not([disabled])'));
    const cur = tabs.indexOf(document.activeElement as HTMLButtonElement);
    if (cur < 0) return;
    e.preventDefault();
    const next = e.key === 'Home' ? 0 : e.key === 'End' ? tabs.length - 1
      : (cur + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
    tabs[next]?.focus();
  };

  return (
    <div className={cn('relative flex rounded-ctl bg-background shadow-nm-inset', h, className)} role="tablist" aria-label={ariaLabel} onKeyDown={onKeyDown}>
      {none ? null : (
        <span
          aria-hidden
          className="absolute bottom-1 top-1 rounded-[12px] bg-background shadow-nm-sm transition-[left] duration-300 ease-[cubic-bezier(.34,1.4,.5,1)]"
          style={{ left: `calc(${idx} * (100% / ${n}) + 4px)`, width: `calc(100% / ${n} - 8px)` }}
        />
      )}
      {items.map((item, i) => (
        <button
          key={item.value}
          type="button"
          role="tab"
          aria-selected={item.value === value}
          tabIndex={none ? (i === 0 ? 0 : -1) : undefined}
          onClick={() => onValueChange(item.value)}
          className={cn(
            'relative z-[2] flex-1 whitespace-nowrap border-0 bg-transparent px-4 font-sans text-[13px] font-bold transition-colors',
            item.value === value ? 'text-primary' : 'text-[#5b6b82]',
          )}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
