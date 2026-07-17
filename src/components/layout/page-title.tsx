'use client';

import { usePathname } from 'next/navigation';
import { titleForPath } from '@/lib/nav/titles';

/** Persistent screen title + subtitle in the dashboard shell. */
export function PageTitle() {
  const [title, subtitle] = titleForPath(usePathname());
  if (!title) return null;
  return (
    <div className="flex flex-shrink-0 items-end justify-between gap-4 px-0.5 pt-0.5 md:px-1.5">
      <div className="min-w-0">
        <h1 className="text-[20px] md:text-[25px] font-extrabold tracking-[-0.6px] text-foreground">{title}</h1>
        <p className="mt-[5px] text-[12.5px] md:text-[13.5px] font-semibold text-muted">{subtitle}</p>
      </div>
    </div>
  );
}
