'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus } from 'lucide-react';
import { NmDialog } from '@/components/ui/nm-dialog';
import { NmButton } from '@/components/ui/nm-button';
import { NmInput } from '@/components/ui/nm-input';
import { FieldLabel } from '@/components/ui/label';
import { useCreateSubject } from '@/lib/hooks/use-subjects';
import { directionSchema, type DirectionFormValues } from './direction-schema';

function Err({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="mt-1.5 text-[12px] font-semibold text-danger">{msg}</p>;
}

/** Dialog to create a new direction (subject). */
export function AddDirectionDialog() {
  const [open, setOpen] = useState(false);
  const create = useCreateSubject();
  const { register, handleSubmit, reset, formState } = useForm<DirectionFormValues>({
    resolver: zodResolver(directionSchema),
    defaultValues: { name: '', level: '', durationMonths: undefined, price: undefined },
  });
  const { errors } = formState;

  const onSubmit = async (values: DirectionFormValues) => {
    await create.mutateAsync(values);
    reset();
    setOpen(false);
  };

  return (
    <NmDialog
      open={open}
      onOpenChange={setOpen}
      title="Yangi yo‘nalish"
      trigger={
        <NmButton>
          <Plus className="size-5" strokeWidth={2.4} />
          Yangi yo‘nalish
        </NmButton>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div>
          <FieldLabel>NOMI</FieldLabel>
          <NmInput placeholder="Masalan: Ingliz tili" {...register('name')} />
          <Err msg={errors.name?.message} />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <FieldLabel>DARAJA</FieldLabel>
            <NmInput placeholder="A1" {...register('level')} />
            <Err msg={errors.level?.message} />
          </div>
          <div>
            <FieldLabel>MUDDAT (OY)</FieldLabel>
            <NmInput type="number" inputMode="numeric" placeholder="6" {...register('durationMonths')} />
            <Err msg={errors.durationMonths?.message} />
          </div>
          <div>
            <FieldLabel>NARX</FieldLabel>
            <NmInput type="number" inputMode="numeric" placeholder="500000" {...register('price')} />
            <Err msg={errors.price?.message} />
          </div>
        </div>
        <div className="mt-2 flex gap-3">
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
