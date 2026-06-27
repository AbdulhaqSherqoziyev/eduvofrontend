'use client';

import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface NavItemLinkProps {
  href: string;
  label: string;
  icon: LucideIcon;
  active: boolean;
}

/** One sidebar nav link; active state is the pressed-in (inset) look. */
export function NavItemLink({ href, label, icon: Icon, active }: NavItemLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        'mb-[5px] flex w-full items-center gap-[13px] rounded-[15px] px-[14px] py-3 text-left text-[14.5px]',
        'transition-all duration-200',
        active ? 'font-bold text-primary shadow-nm-inset' : 'font-semibold text-muted hover:text-primary',
      )}
    >
      <Icon className="size-5 flex-shrink-0" strokeWidth={2} />
      <span>{label}</span>
    </Link>
  );
}
