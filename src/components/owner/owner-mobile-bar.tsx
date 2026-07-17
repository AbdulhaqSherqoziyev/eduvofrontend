'use client';

import { Menu } from 'lucide-react';
import { Brand } from '@/components/layout/brand';
import { useMobileNav } from '@/components/layout/mobile-nav';

/** Mobile-only top bar for the owner panel: hamburger + brand. */
export function OwnerMobileBar() {
  const { setOpen } = useMobileNav();
  return (
    <header className="flex flex-shrink-0 items-center gap-3 rounded-[20px] bg-background px-3.5 py-2.5 shadow-nm md:hidden">
      <button
        type="button"
        aria-label="Menyu"
        onClick={() => setOpen(true)}
        className="flex size-10 flex-shrink-0 items-center justify-center rounded-[12px] bg-background text-foreground shadow-nm-sm nm-pressable"
      >
        <Menu className="size-5" strokeWidth={2} />
      </button>
      <Brand compact />
    </header>
  );
}
