'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Pencil } from 'lucide-react';
import { NmDialog } from '@/components/ui/nm-dialog';
import { NmButton } from '@/components/ui/nm-button';
import { NmIconButton } from '@/components/ui/nm-icon-button';
import { CompensationBlock } from '@/components/payroll/compensation-block';
import { useCompensationBlock } from '@/components/payroll/use-compensation-block';
import { useResetUserPassword, useUpdateUser } from '@/lib/hooks/use-users';
import { StaffFormFields } from './staff-form-fields';
import { staffSchema, type StaffFormValues } from './staff-schema';
import type { Staff } from '@/lib/types/user';

/** Dialog: edit a staff member's name/phone/roles and optionally reset password. */
export function EditStaffDialog({ staff }: { staff: Staff }) {
  const [open, setOpen] = useState(false);
  const [roleIds, setRoleIds] = useState<string[]>(staff.roles.map((r) => r.id));
  const update = useUpdateUser(staff.id);
  const resetPw = useResetUserPassword(staff.id);
  const comp = useCompensationBlock('USER', staff.id);
  const form = useForm<StaffFormValues>({
    resolver: zodResolver(staffSchema),
    defaultValues: { fullName: staff.fullName, phone: staff.phone, password: '', defaultRole: staff.defaultRole },
  });

  const toggleRole = (id: string) =>
    setRoleIds((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  const onSubmit = async (values: StaffFormValues) => {
    await update.mutateAsync({
      fullName: values.fullName, phone: values.phone,
      defaultRole: values.defaultRole || undefined, roleIds,
    });
    if (values.password && values.password.length >= 6) await resetPw.mutateAsync(values.password);
    if (!(await comp.submit(staff.id))) return;
    setOpen(false);
  };

  return (
    <NmDialog open={open} onOpenChange={setOpen} title="Xodimni tahrirlash"
      trigger={<NmIconButton aria-label="Tahrirlash"><Pencil className="size-[15px]" strokeWidth={2} /></NmIconButton>}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <StaffFormFields form={form} withPassword passwordLabel="YANGI PAROL (ixtiyoriy)"
          roleIds={roleIds} onToggleRole={toggleRole} />
        <CompensationBlock ctl={comp} subjectType="USER" subjectId={staff.id} subjectName={staff.fullName} />
        <div className="mt-6 flex gap-3">
          <NmButton type="button" variant="soft" className="flex-1" onClick={() => setOpen(false)}>Bekor</NmButton>
          <NmButton type="submit" className="flex-[1.4]" disabled={update.isPending || comp.pending}>
            {update.isPending || comp.pending ? 'Saqlanmoqda…' : 'Saqlash'}
          </NmButton>
        </div>
      </form>
    </NmDialog>
  );
}
