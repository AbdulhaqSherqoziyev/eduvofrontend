'use client';

import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { NmDialog } from '@/components/ui/nm-dialog';
import { NmButton } from '@/components/ui/nm-button';
import { NmIconButton } from '@/components/ui/nm-icon-button';
import {
  useCreateOwnerUser, useDeleteOwnerUser, useResetOwnerUserPassword, useUpdateOwnerUser,
} from '@/lib/hooks/use-owner-users';
import type { OwnerUser } from '@/lib/types/owner-users';
import { UserFormFields, type UserFormState } from './user-form-fields';

const EMPTY: UserFormState = { fullName: '', phone: '+998 ', password: '', defaultRole: '' };

/** Add a user (no `user`) or edit one — roles, optional password reset, delete. */
export function UserDialog({ user }: { user?: OwnerUser }) {
  const [open, setOpen] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);
  const [tenantId, setTenantId] = useState(user?.tenantId ?? '');
  const [roleIds, setRoleIds] = useState<string[]>(user?.roles.map((r) => r.id) ?? []);
  const [values, setValues] = useState<UserFormState>(
    user ? { fullName: user.fullName, phone: user.phone, password: '', defaultRole: user.defaultRole } : EMPTY,
  );

  // Re-sync from the row each time the dialog opens — the instance is keyed by
  // user.id and persists across refetches/close, so initializers alone go stale.
  useEffect(() => {
    if (!open) return;
    setConfirmDel(false);
    setTenantId(user?.tenantId ?? '');
    setRoleIds(user?.roles.map((r) => r.id) ?? []);
    setValues(user
      ? { fullName: user.fullName, phone: user.phone, password: '', defaultRole: user.defaultRole }
      : EMPTY);
  }, [open, user]);

  const create = useCreateOwnerUser();
  const update = useUpdateOwnerUser(user?.id ?? '');
  const resetPw = useResetOwnerUserPassword(user?.id ?? '');
  const del = useDeleteOwnerUser();
  const busy = create.isPending || update.isPending;

  const patch = (p: Partial<UserFormState>) => setValues((v) => ({ ...v, ...p }));
  const onTenant = (id: string) => { setTenantId(id); setRoleIds([]); };
  const toggleRole = (id: string) =>
    setRoleIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const onSubmit = async () => {
    const national = values.phone.replace(/\D/g, '').length;
    if (user) {
      await update.mutateAsync({
        fullName: values.fullName, phone: values.phone,
        defaultRole: values.defaultRole || undefined, roleIds,
      });
      if (values.password.length >= 6) await resetPw.mutateAsync(values.password);
    } else {
      if (!tenantId || values.fullName.length < 2 || national < 9 || values.password.length < 6) return;
      await create.mutateAsync({
        tenantId, fullName: values.fullName, phone: values.phone,
        password: values.password, defaultRole: values.defaultRole || undefined, roleIds,
      });
    }
    setOpen(false);
  };

  return (
    <NmDialog open={open} onOpenChange={setOpen} title={user ? 'Foydalanuvchini tahrirlash' : 'Yangi foydalanuvchi'}
      trigger={user
        ? <NmIconButton aria-label="Tahrirlash"><Pencil className="size-[15px]" strokeWidth={2} /></NmIconButton>
        : <NmButton><Plus className="size-[18px]" strokeWidth={2.4} />Foydalanuvchi</NmButton>}>
      <div className="flex flex-col gap-5">
        <UserFormFields mode={user ? 'edit' : 'add'} values={values} onChange={patch}
          tenantId={tenantId} onTenantChange={onTenant} centerName={user?.centerName}
          roleIds={roleIds} onToggleRole={toggleRole} />
        <div className="flex gap-3">
          <NmButton type="button" variant="soft" className="flex-1" onClick={() => setOpen(false)}>Bekor</NmButton>
          <NmButton type="button" className="flex-[1.4]" onClick={onSubmit} disabled={busy}>{busy ? '...' : 'Saqlash'}</NmButton>
        </div>
        {user && !user.isSuperAdmin ? (
          <div className="border-t border-[rgba(122,134,153,0.18)] pt-4">
            {confirmDel ? (
              <div className="flex items-center gap-3">
                <span className="flex-1 text-[12.5px] font-semibold text-danger">Rostan o&apos;chirilsinmi?</span>
                <NmButton type="button" variant="soft" size="sm" onClick={() => setConfirmDel(false)}>Yo&apos;q</NmButton>
                <NmButton type="button" variant="danger" size="sm" onClick={() => del.mutate(user.id, { onSuccess: () => setOpen(false) })}
                  disabled={del.isPending}>Ha, o&apos;chir</NmButton>
              </div>
            ) : (
              <button type="button" onClick={() => setConfirmDel(true)}
                className="flex items-center gap-2 text-[12.5px] font-bold text-danger">
                <Trash2 className="size-4" strokeWidth={2} />Foydalanuvchini o&apos;chirish
              </button>
            )}
          </div>
        ) : null}
      </div>
    </NmDialog>
  );
}
