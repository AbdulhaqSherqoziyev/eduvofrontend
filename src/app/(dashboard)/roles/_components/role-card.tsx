'use client';

import { NmCard } from '@/components/ui/nm-card';
import { cn } from '@/lib/utils/cn';
import type { Role } from '@/lib/types/role';

/** A single selectable role entry in the left rail. */
export function RoleCard({ role, selected, onSelect }: { role: Role; selected: boolean; onSelect: () => void }) {
  return (
    <NmCard
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelect()}
      className={cn(
        'flex cursor-pointer items-center gap-3 p-[16px] transition-shadow',
        selected ? 'shadow-nm-inset' : 'shadow-nm-sm',
      )}
    >
      <div
        className={cn(
          'grid size-10 shrink-0 place-items-center rounded-ctl font-mono text-[16px] font-extrabold shadow-nm-inset-sm',
          selected ? 'text-primary' : 'text-muted',
        )}
      >
        {role.name.charAt(0).toUpperCase()}
      </div>
      <div className="min-w-0 flex-1">
        <p className={cn('truncate text-[14px] font-extrabold tracking-[-0.2px]', selected ? 'text-primary' : 'text-foreground')}>
          {role.name}
        </p>
        <p className="truncate text-[12px] font-medium text-muted">{role.description}</p>
      </div>
      <span className="shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold text-[#5b6b82] shadow-nm-inset-sm">
        {role.userCount}
      </span>
    </NmCard>
  );
}
