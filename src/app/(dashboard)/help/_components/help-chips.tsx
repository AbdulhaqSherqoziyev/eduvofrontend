import { cn } from '@/lib/utils/cn';
import type { HelpChip } from '@/lib/help/types';
import { FOCUS, LABEL } from './styles';

export const CHIP =
  'inline-flex min-h-[44px] shrink-0 snap-start items-center whitespace-nowrap rounded-full bg-background px-4 text-[13px] font-bold text-foreground shadow-nm-sm nm-pressable hover:text-primary';

/** "Ko'p so'raladi" — a horizontal strip on phones, wrapping from `sm` (§5). */
export function HelpChips({ chips, onPick }: { chips: HelpChip[]; onPick: (slug: string) => void }) {
  if (!chips.length) return null;
  return (
    <div>
      <div className={cn('mb-2', LABEL)}>Ko&apos;p so&apos;raladi</div>
      <div className="-mx-1 flex snap-x gap-2 overflow-x-auto px-1 pb-1 pt-0.5 [scrollbar-width:none] sm:flex-wrap sm:overflow-visible [&::-webkit-scrollbar]:hidden">
        {chips.map((c) => (
          <button key={c.slug} type="button" onClick={() => onPick(c.slug)} className={cn(CHIP, FOCUS)}>
            {c.label}
          </button>
        ))}
      </div>
    </div>
  );
}
