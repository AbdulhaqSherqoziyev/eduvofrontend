'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Pencil } from 'lucide-react';
import { NmDialog } from '@/components/ui/nm-dialog';
import { NmButton } from '@/components/ui/nm-button';
import { NmIconButton } from '@/components/ui/nm-icon-button';
import { NmInput } from '@/components/ui/nm-input';
import { FieldLabel } from '@/components/ui/label';
import { useUpdateSubject } from '@/lib/hooks/use-subjects';
import type { Subject } from '@/lib/types/subject';
import { directionSchema, type DirectionFormValues } from './direction-schema';

function Err({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="mt-1.5 text-[12px] font-semibold text-danger">{msg}</p>;
}

/** Edit an existing direction (subject.update). */
export function EditDirectionDialog({ subject }: { subject: Subject }) {
  const [open, setOpen] = useState(false);
  const update = useUpdateSubject(subject.id);
  const { register, handleSubmit, formState } = useForm<DirectionFormValues>({
    resolver: zodResolver(directionSchema),
    defaultValues: { name: subject.name, level: subject.level, durationMonths: subject.durationMonths, price: subject.price },
  });
  const { errors } = formState;

  const onSubmit = async (values: DirectionFormValues) => {
    await update.mutateAsync(values);
    setOpen(false);
  };

  return (
    <NmDialog
      open={open}
      onOpenChange={setOpen}
      title="Yo‘nalishni tahrirlash"
      trigger={
        <NmIconButton aria-label="Tahrirlash">
          <Pencil className="size-4" strokeWidth={2} />
        </NmIconButton>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div>
          <FieldLabel>NOMI</FieldLabel>
          <NmInput {...register('name')} />
          <Err msg={errors.name?.message} />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <FieldLabel>DARAJA</FieldLabel>
            <NmInput {...register('level')} />
            <Err msg={errors.level?.message} />
          </div>
          <div>
            <FieldLabel>MUDDAT (OY)</FieldLabel>
            <NmInput type="number" inputMode="numeric" {...register('durationMonths')} />
            <Err msg={errors.durationMonths?.message} />
          </div>
          <div>
            <FieldLabel>NARX</FieldLabel>
            <NmInput type="number" inputMode="numeric" {...register('price')} />
            <Err msg={errors.price?.message} />
          </div>
        </div>
        <div className="mt-2 flex gap-3">
          <NmButton type="button" variant="soft" className="flex-1" onClick={() => setOpen(false)}>
            Bekor qilish
          </NmButton>
          <NmButton type="submit" className="flex-[1.4]" disabled={update.isPending}>
            {update.isPending ? '...' : 'Saqlash'}
          </NmButton>
        </div>
      </form>
    </NmDialog>
  );
}
