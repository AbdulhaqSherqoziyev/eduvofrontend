'use client';

import { useEffect, useMemo, useState } from 'react';
import { Save } from 'lucide-react';
import { NmCard } from '@/components/ui/nm-card';
import { NmButton } from '@/components/ui/nm-button';
import { Can } from '@/components/shared/can';
import { useUpdateRolePermissions } from '@/lib/hooks/use-roles';
import type { PermissionGroup, Role } from '@/lib/types/role';
import { PermissionToggleRow } from './permission-toggle-row';

/** Right pane — toggle & save the selected role's permissions. */
export function PermissionGroups({ role, catalog }: { role: Role; catalog: PermissionGroup[] }) {
  const [enabled, setEnabled] = useState<Set<string>>(new Set(role.permissions));
  const update = useUpdateRolePermissions(role.id);

  useEffect(() => {
    setEnabled(new Set(role.permissions));
  }, [role.id, role.permissions]);

  const toggle = (code: string) =>
    setEnabled((prev) => {
      const next = new Set(prev);
      next.has(code) ? next.delete(code) : next.add(code);
      return next;
    });

  const totalCount = useMemo(() => catalog.reduce((sum, g) => sum + g.items.length, 0), [catalog]);

  const onSave = () => update.mutateAsync({ permissions: [...enabled] });

  return (
    <NmCard className="p-[26px]">
      <header className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-[17px] font-extrabold tracking-[-0.3px] text-foreground">{role.name}</h2>
          <p className="mt-1 text-[13px] font-medium text-muted">
            {role.description} · {enabled.size} / {totalCount} ruxsat yoqilgan
          </p>
        </div>
        <Can permission="role.update">
          <NmButton size="sm" onClick={onSave} disabled={update.isPending}>
            <Save className="size-4" strokeWidth={2.4} />
            {update.isPending ? '...' : 'Saqlash'}
          </NmButton>
        </Can>
      </header>

      <div className="flex flex-col gap-6">
        {catalog.map((group) => (
          <section key={group.key}>
            <h3 className="mb-3 text-[11px] font-bold uppercase tracking-[0.7px] text-muted">{group.label}</h3>
            <div className="flex flex-col gap-2.5">
              {group.items.map((item) => (
                <PermissionToggleRow
                  key={item.code}
                  item={item}
                  enabled={enabled.has(item.code)}
                  onToggle={() => toggle(item.code)}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </NmCard>
  );
}
