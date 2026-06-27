'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus } from 'lucide-react';
import { NmDialog } from '@/components/ui/nm-dialog';
import { NmButton } from '@/components/ui/nm-button';
import { NmInput } from '@/components/ui/nm-input';
import { FieldLabel } from '@/components/ui/label';
import { useCreateRole } from '@/lib/hooks/use-roles';
import { roleSchema, type RoleFormValues } from './role-schema';

/** Dialog that creates a new role. */
export function CreateRoleDialog() {
  const [open, setOpen] = useState(false);
  const create = useCreateRole();
  const form = useForm<RoleFormValues>({
    resolver: zodResolver(roleSchema),
    defaultValues: { name: '', description: '' },
  });
  const { register, formState } = form;

  const onSubmit = async (values: RoleFormValues) => {
    await create.mutateAsync(values);
    form.reset();
    setOpen(false);
  };

  return (
    <NmDialog
      open={open}
      onOpenChange={setOpen}
      title="Yangi rol qo'shish"
      trigger={
        <NmButton variant="soft" className="w-full justify-center">
          <Plus className="size-4" strokeWidth={2.4} />
          Yangi rol qo&apos;shish
        </NmButton>
      }
    >
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-4">
          <div>
            <FieldLabel>ROL NOMI</FieldLabel>
            <NmInput placeholder="Masalan: Administrator" {...register('name')} />
            {formState.errors.name ? (
              <p className="mt-1.5 text-[12px] font-semibold text-danger">{formState.errors.name.message}</p>
            ) : null}
          </div>
          <div>
            <FieldLabel>TAVSIF</FieldLabel>
            <NmInput placeholder="Qisqacha tavsif" {...register('description')} />
          </div>
        </div>
        <div className="mt-6 flex gap-3">
          <NmButton type="button" variant="soft" className="flex-1" onClick={() => setOpen(false)}>
            Bekor qilish
          </NmButton>
          <NmButton type="submit" className="flex-[1.4]" disabled={create.isPending}>
            {create.isPending ? '...' : "Qo'shish"}
          </NmButton>
        </div>
      </form>
    </NmDialog>
  );
}
