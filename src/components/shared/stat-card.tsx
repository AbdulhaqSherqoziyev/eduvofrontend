'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { Info } from 'lucide-react';
import { NmCard } from '@/components/ui/nm-card';
import { cn } from '@/lib/utils/cn';

interface StatCardProps {
  label: string;
  value: string;
  unit?: string;
  icon: React.ReactNode;
  accent?: boolean;
  footer?: React.ReactNode;
  /** Explanation behind an (i) button next to the label — click popover, never a hover tooltip. */
  hint?: string;
  /** Muted line under the label (e.g. "markaz yaratildi"). */
  sublabel?: string;
  /** Phone grid: p-4, 26px number. */
  compact?: boolean;
  /** Tooltip on the value (e.g. why it is "—"). */
  valueTitle?: string;
}

/** Click-to-open explanation; the text stays in the DOM (sr-only) so aria-describedby always works. */
function StatHint({ text, id }: { text: string; id: string }) {
  const [open, setOpen] = useState(false);
  const btn = useRef<HTMLButtonElement>(null);
  const box = useRef<HTMLSpanElement>(null);
  const popId = `${id}-pop`;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { setOpen(false); btn.current?.focus(); } };
    const onDown = (e: MouseEvent | TouchEvent) => { if (!box.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('touchstart', onDown);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('touchstart', onDown);
    };
  }, [open]);

  return (
    <span ref={box} className="relative inline-flex align-middle normal-case tracking-normal">
      <button ref={btn} type="button" aria-label="Izoh" aria-expanded={open} aria-controls={popId}
        onClick={() => setOpen((o) => !o)}
        className="ml-1 inline-flex size-5 items-center justify-center rounded-full text-muted hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary">
        <Info className="size-[14px]" />
      </button>
      <span id={id} className="sr-only">{text}</span>
      {open ? (
        <span id={popId} role="note"
          className="absolute left-0 top-full z-20 mt-1.5 w-max max-w-[240px] rounded-[12px] bg-background px-3 py-2 text-[12.5px] font-medium normal-case leading-[1.45] tracking-normal text-foreground shadow-nm">
          {text}
        </span>
      ) : null}
    </span>
  );
}

/** Dashboard metric card: uppercase label, soft icon, big number, footer pill. */
export function StatCard({ label, value, unit, icon, accent, footer, hint, sublabel, compact, valueTitle }: StatCardProps) {
  const hintId = useId();
  const describedBy = hint ? hintId : undefined;
  return (
    <NmCard className={compact ? 'p-4 sm:p-[22px]' : 'p-[22px]'}>
      <div className={cn('flex items-start justify-between',
        // compact on phones: icon above the label so long labels get the full card width (never cut)
        compact ? 'mb-3 flex-col-reverse gap-2 sm:mb-[18px] sm:flex-row sm:gap-0' : 'mb-[18px]')}>
        <div className="min-w-0">
          <div className={cn('text-[11px] font-bold uppercase leading-[1.4] text-muted',
            // compact (phone grids): never cut the label — tighter tracking, break anywhere
            compact ? 'tracking-[0.3px] [overflow-wrap:anywhere] sm:tracking-[0.7px]' : cn('tracking-[0.7px]', hint ? 'max-w-[170px]' : 'max-w-[120px]'))}
            aria-describedby={describedBy}>
            {label}
            {hint ? <StatHint text={hint} id={hintId} /> : null}
          </div>
          {sublabel ? <div className="mt-0.5 text-[11px] font-medium text-muted">{sublabel}</div> : null}
        </div>
        <div className={cn('flex flex-shrink-0 items-center justify-center rounded-[12px] bg-background text-primary shadow-nm-sm', compact ? 'size-8 sm:size-10' : 'size-10')}>
          {icon}
        </div>
      </div>
      <div className="flex items-baseline gap-1.5">
        <span
          title={valueTitle}
          aria-describedby={describedBy}
          className={cn(
            'font-extrabold leading-none tracking-[-1px]',
            compact ? 'text-[26px] sm:text-[34px]' : 'text-[34px]',
            accent ? 'text-primary' : 'text-foreground',
          )}
        >
          {value}
        </span>
        {unit ? <span className="text-[14px] font-bold text-[#5b6b82]">{unit}</span> : null}
      </div>
      {footer ? <div className={compact ? 'mt-2.5 sm:mt-3.5' : 'mt-3.5'}>{footer}</div> : null}
    </NmCard>
  );
}
