import { cn } from '@/lib/utils/cn';
import type { QueryUnit } from '@/lib/help/search';
import type { HelpGlossaryItem } from '@/lib/help/types';
import { Rich } from './rich-text';
import { SCROLL_MT, SOFT } from './styles';

/** Lug'at — `<dl>`, each term addressable as `/help#g-<slug>` (§10.6). */
export function GlossaryList({
  items, highlight, units,
}: { items: HelpGlossaryItem[]; highlight?: string | null; units?: QueryUnit[] }) {
  return (
    <dl className="divide-y divide-[rgba(163,177,198,0.22)] dark:divide-[rgba(255,255,255,0.05)]">
      {items.map((g) => (
        <div
          key={g.slug}
          id={g.slug}
          className={cn(
            'rounded-[12px] px-2 py-3 transition-[box-shadow,background-color] duration-700 motion-reduce:transition-none',
            SCROLL_MT,
            highlight === g.slug && 'bg-selected ring-2 ring-primary/50',
          )}
        >
          <dt className="text-[14px] font-extrabold text-foreground">
            <Rich text={g.term} units={units} />
          </dt>
          <dd className={cn('mt-0.5 text-[13.5px] font-medium leading-[1.5]', SOFT)}>
            <Rich text={g.text} units={units} />
          </dd>
        </div>
      ))}
    </dl>
  );
}
