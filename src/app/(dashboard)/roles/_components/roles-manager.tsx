'use client';

import { useEffect, useState } from 'react';
import { Can } from '@/components/shared/can';
import { EmptyState } from '@/components/shared/empty-state';
import { ErrorCard } from '@/components/shared/error-card';
import { Skeleton, CardGridSkeleton } from '@/components/shared/skeleton';
import { useRoles, usePermissionCatalog } from '@/lib/hooks/use-roles';
import { RoleCard } from './role-card';
import { PermissionGroups } from './permission-groups';
import { CreateRoleDialog } from './create-role-dialog';

/** Owns the selected-role state and lays out the roles list + permission editor. */
export function RolesManager() {
  const roles = useRoles();
  const catalog = usePermissionCatalog();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedId && roles.data?.length) setSelectedId(roles.data[0].id);
  }, [selectedId, roles.data]);

  if (roles.isLoading || catalog.isLoading) {
    return (
      <div className="grid grid-cols-[320px_1fr] items-start gap-[22px]">
        <CardGridSkeleton count={4} className="grid-cols-1" />
        <Skeleton className="h-[480px] rounded-card" />
      </div>
    );
  }

  if (roles.isError || roles.data === undefined || catalog.isError || catalog.data === undefined) {
    return <ErrorCard onRetry={() => (roles.refetch(), catalog.refetch())} />;
  }

  if (roles.data.length === 0) {
    return (
      <EmptyState title="Rollar topilmadi" hint="Boshlash uchun yangi rol qo'shing." action={<Can permission="role.create"><CreateRoleDialog /></Can>} />
    );
  }

  const selected = roles.data.find((r) => r.id === selectedId) ?? roles.data[0];

  return (
    <div className="grid grid-cols-[320px_1fr] items-start gap-[22px]">
      <div className="flex flex-col gap-3">
        <p className="px-1 text-[11px] font-bold uppercase tracking-[0.7px] text-muted">Rollar</p>
        {roles.data.map((role) => (
          <RoleCard
            key={role.id}
            role={role}
            selected={role.id === selected.id}
            onSelect={() => setSelectedId(role.id)}
          />
        ))}
        <Can permission="role.create">
          <CreateRoleDialog />
        </Can>
      </div>

      <PermissionGroups role={selected} catalog={catalog.data} />
    </div>
  );
}
