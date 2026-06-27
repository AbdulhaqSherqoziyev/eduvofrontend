'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutGrid, SlidersHorizontal } from 'lucide-react';
import { SECTION_HOME, sectionForPath, type NavSection } from '@/lib/nav/items';
import { cn } from '@/lib/utils/cn';

const ITEMS: { key: NavSection; label: string; icon: typeof LayoutGrid }[] = [
  { key: 'asosiy', label: 'Asosiy', icon: LayoutGrid },
  { key: 'boshqaruv', label: 'Boshqaruv', icon: SlidersHorizontal },
];

/** Top-bar Asosiy / Boshqaruv switch — jumps to each section's home route. */
export function SectionSwitch() {
  const active = sectionForPath(usePathname());
  return (
    <div className="flex flex-shrink-0 gap-2.5">
      {ITEMS.map(({ key, label, icon: Icon }) => (
        <Link
          key={key}
          href={SECTION_HOME[key]}
          className={cn(
            'flex h-11 items-center gap-2.5 rounded-[13px] px-[18px] text-[14px] font-bold transition-all',
            active === key ? 'text-primary shadow-nm-inset' : 'text-muted shadow-nm-sm',
          )}
        >
          <Icon className="size-[18px]" strokeWidth={2} />
          {label}
        </Link>
      ))}
    </div>
  );
}
