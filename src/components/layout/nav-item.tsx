'use client';

import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface NavItemLinkProps {
  href: string;
  label: string;
  icon: LucideIcon;
  active: boolean;
  onClick?: () => void;
  /** Optional count chip on the right (design v3: green sessions / purple AI queue). */
  badge?: { count: number; color: string } | null;
}

/** One sidebar nav link; active state is the pressed-in (inset) look. */
export function NavItemLink({ href, label, icon: Icon, active, onClick, badge }: NavItemLinkProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        'mb-[5px] flex w-full items-center gap-[13px] rounded-[15px] px-[14px] py-3 text-left text-[14.5px]',
        'transition-all duration-200',
        active ? 'font-bold text-primary shadow-nm-inset' : 'font-semibold text-muted hover:text-primary',
      )}
    >
      <Icon className="size-5 flex-shrink-0" strokeWidth={2} />
      <span className={badge ? 'flex-1' : undefined}>{label}</span>
      {badge && badge.count > 0 ? (
        <span
          className="flex h-[22px] min-w-[22px] items-center justify-center rounded-[7px] px-1.5 text-[11px] font-extrabold text-white"
          style={{ background: badge.color }}
        >
          {badge.count}
        </span>
      ) : null}
    </Link>
  );
}

