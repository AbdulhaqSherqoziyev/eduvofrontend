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
}

/** Sliding-pill segmented control (filters, tabs, payment method, language). */
export function NmSegmented({ items, value, onValueChange, className, size = 'md' }: NmSegmentedProps) {
  const idx = Math.max(0, items.findIndex((i) => i.value === value));
  const n = items.length;
  const h = size === 'sm' ? 'h-[46px]' : 'h-[50px]';
  return (
    <div className={cn('relative flex rounded-ctl bg-background shadow-nm-inset', h, className)} role="tablist">
      <span
        aria-hidden
        className="absolute bottom-1 top-1 rounded-[12px] bg-background shadow-nm-sm transition-[left] duration-300 ease-[cubic-bezier(.34,1.4,.5,1)]"
        style={{ left: `calc(${idx} * (100% / ${n}) + 4px)`, width: `calc(100% / ${n} - 8px)` }}
      />
      {items.map((item) => (
        <button
          key={item.value}
          type="button"
          role="tab"
          aria-selected={item.value === value}
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
