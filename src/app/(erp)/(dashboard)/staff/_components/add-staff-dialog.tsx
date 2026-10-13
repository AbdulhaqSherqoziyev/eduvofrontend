'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus } from 'lucide-react';
import { NmDialog } from '@/components/ui/nm-dialog';
import { NmButton } from '@/components/ui/nm-button';
import { CompensationBlock } from '@/components/payroll/compensation-block';
import { useCompensationBlock } from '@/components/payroll/use-compensation-block';
import { useCreateUser } from '@/lib/hooks/use-users';
import { StaffFormFields } from './staff-form-fields';
import { staffSchema, type StaffFormValues } from './staff-schema';

/** Dialog: director creates a new employee with a password + roles (user.create). */
export function AddStaffDialog() {
  const [open, setOpen] = useState(false);
  const [roleIds, setRoleIds] = useState<string[]>([]);
  const [createdId, setCreatedId] = useState<string | null>(null);
  const create = useCreateUser();
  const comp = useCompensationBlock('USER', createdId);
  const form = useForm<StaffFormValues>({
    resolver: zodResolver(staffSchema),
    defaultValues: { fullName: '', phone: '', password: '', defaultRole: '' },
  });

  const toggleRole = (id: string) =>
    setRoleIds((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  const onSubmit = async (values: StaffFormValues) => {
    if (!values.password || values.password.length < 6) {
      form.setError('password', { message: 'Kamida 6 belgi' });
      return;
    }
    const id =
      createdId ??
      (
        await create.mutateAsync({
          fullName: values.fullName, phone: values.phone, password: values.password,
          defaultRole: values.defaultRole || undefined, roleIds,
        })
      ).id;
    setCreatedId(id);
    if (!(await comp.submit(id))) return;
    form.reset();
    setRoleIds([]);
    setCreatedId(null);
    setOpen(false);
  };

  return (
    <NmDialog open={open} onOpenChange={setOpen} title="Yangi xodim qo'shish"
      trigger={<NmButton><Plus className="size-[18px]" strokeWidth={2.4} />Yangi xodim</NmButton>}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <StaffFormFields form={form} withPassword roleIds={roleIds} onToggleRole={toggleRole} />
        <CompensationBlock ctl={comp} subjectType="USER" subjectId={createdId} subjectName={form.watch('fullName')} />
        <div className="mt-6 flex gap-3">
          <NmButton type="button" variant="soft" className="flex-1" onClick={() => setOpen(false)}>Bekor qilish</NmButton>
          <NmButton type="submit" className="flex-[1.4]" disabled={create.isPending || comp.pending}>
            {create.isPending || comp.pending ? 'Saqlanmoqda…' : "Qo'shish"}
          </NmButton>
        </div>
      </form>
    </NmDialog>
  );
}
