'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus } from 'lucide-react';
import { NmDialog } from '@/components/ui/nm-dialog';
import { NmButton } from '@/components/ui/nm-button';
import { NmInput } from '@/components/ui/nm-input';
import { NmTextarea } from '@/components/ui/nm-textarea';
import { FieldLabel } from '@/components/ui/label';
import { useCreateLead } from '@/lib/hooks/use-leads';
import { leadSchema, type LeadFormValues } from './lead-schema';

function Err({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="mt-1.5 text-[12px] font-semibold text-danger">{msg}</p>;
}

/** Dialog to add a new lead — 2 required fields, source/note optional. */
export function AddLeadDialog() {
  const [open, setOpen] = useState(false);
  const [submitError, setSubmitError] = useState(false);
  const create = useCreateLead();
  const { register, handleSubmit, reset, formState } = useForm<LeadFormValues>({
    resolver: zodResolver(leadSchema),
    defaultValues: { fullName: '', phone: '', source: '', note: '' },
  });
  const { errors } = formState;

  const onSubmit = async (values: LeadFormValues) => {
    setSubmitError(false);
    try {
      await create.mutateAsync({
        fullName: values.fullName,
        phone: values.phone,
        source: values.source || undefined,
        note: values.note || undefined,
      });
      reset();
      setOpen(false);
    } catch {
      setSubmitError(true);
    }
  };

  return (
    <NmDialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) setSubmitError(false);
      }}
      title="Yangi lid"
      trigger={
        <NmButton>
          <Plus className="size-5" strokeWidth={2.4} />
          Yangi lid
        </NmButton>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div>
          <FieldLabel>ISM FAMILIYA</FieldLabel>
          <NmInput placeholder="Masalan: Aziza Karimova" {...register('fullName')} />
          <Err msg={errors.fullName?.message} />
        </div>
        <div>
          <FieldLabel>TELEFON</FieldLabel>
          <NmInput type="tel" inputMode="tel" placeholder="+998 90 123 45 67" {...register('phone')} />
          <Err msg={errors.phone?.message} />
        </div>
        <div>
          <FieldLabel>QAYERDAN (IXTIYORIY)</FieldLabel>
          <NmInput placeholder="Instagram, tanish orqali..." {...register('source')} />
        </div>
        <div>
          <FieldLabel>IZOH (IXTIYORIY)</FieldLabel>
          <NmTextarea rows={2} placeholder="Qo'shimcha ma'lumot..." {...register('note')} />
        </div>
        {submitError ? (
          <p className="text-[12.5px] font-semibold text-danger">
            Saqlab bo&apos;lmadi. Qayta urinib ko&apos;ring.
          </p>
        ) : null}
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
