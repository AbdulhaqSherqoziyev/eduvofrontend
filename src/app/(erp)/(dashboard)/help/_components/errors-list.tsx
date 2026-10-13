import { cn } from '@/lib/utils/cn';
import type { QueryUnit } from '@/lib/help/search';
import type { HelpErrorItem } from '@/lib/help/types';
import { Rich } from './rich-text';

/** One on-screen message and what it means (§10.5). */
export function ErrorRow({ item, units }: { item: HelpErrorItem; units?: QueryUnit[] }) {
  return (
    <li className="rounded-[14px] bg-background p-3.5 shadow-nm-sm">
      <p className="break-words text-[14px] font-bold leading-[1.45] text-foreground">
        &ldquo;<Rich text={item.message} units={units} />&rdquo;
      </p>
      <p className="mt-1 break-words text-[13.5px] font-medium leading-[1.5] text-foreground">
        <Rich text={item.text} units={units} />
      </p>
    </li>
  );
}

export function ErrorsList({ items, className }: { items: HelpErrorItem[]; className?: string }) {
  if (!items.length) return null;
  return (
    <div className={cn('mt-4', className)}>
      <h4 className="mb-2.5 text-[14.5px] font-extrabold text-foreground">Ekrandagi xabar nimani anglatadi?</h4>
      <ul className="flex flex-col gap-2.5">
        {items.map((it) => (
          <ErrorRow key={it.message} item={it} />
        ))}
      </ul>
    </div>
  );
}
