'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FileCheck2, LayoutGrid, SlidersHorizontal } from 'lucide-react';
import { SECTION_HOME, sectionForPath, visibleSections, type NavSection } from '@/lib/nav/items';
import { useTenantFlags } from '@/lib/hooks/use-tenant-settings';
import { useModuleGateVersion } from '@/lib/hooks/use-module-gate';
import { cn } from '@/lib/utils/cn';

const ITEMS: { key: NavSection; label: string; icon: typeof LayoutGrid; badge?: string }[] = [
  { key: 'asosiy', label: 'Asosiy', icon: LayoutGrid },
  { key: 'boshqaruv', label: 'Boshqaruv', icon: SlidersHorizontal },
  { key: 'imtihonlar', label: 'Imtihonlar', icon: FileCheck2, badge: 'YANGI' },
];

/** Top-bar Asosiy / Boshqaruv / Imtihonlar switch — jumps to each section's home route. */
export function SectionSwitch() {
  const active = sectionForPath(usePathname());
  const { teacherOnlyMode } = useTenantFlags();
  useModuleGateVersion(); // visibleSections() counts module-gated items
  const allowed = visibleSections(teacherOnlyMode);
  const shown = ITEMS.filter((i) => allowed.includes(i.key));
  if (shown.length <= 1) return null;
  return (
    <div className="flex flex-shrink-0 gap-2.5">
      {shown.map(({ key, label, icon: Icon, badge }) => (
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
          {badge ? (
            <span className="rounded-[6px] bg-primary px-1.5 py-[3px] text-[9.5px] font-extrabold tracking-[0.5px] text-white">
              {badge}
            </span>
          ) : null}
        </Link>
      ))}
    </div>
  );
}
