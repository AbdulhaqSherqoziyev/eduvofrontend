'use client';

import { NmSwitch } from '@/components/ui/nm-switch';
import type { PermissionItem } from '@/lib/types/role';

/** One permission row with its on/off switch. */
export function PermissionToggleRow({
  item,
  enabled,
  onToggle,
}: {
  item: PermissionItem;
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-ctl px-[14px] py-[11px] shadow-nm-inset-sm">
      <span className="text-[13px] font-semibold text-foreground">{item.label}</span>
      <NmSwitch checked={enabled} onCheckedChange={onToggle} aria-label={item.label} />
    </div>
  );
}
