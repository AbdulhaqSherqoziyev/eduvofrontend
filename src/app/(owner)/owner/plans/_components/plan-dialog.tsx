'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, Pencil } from 'lucide-react';
import { NmDialog } from '@/components/ui/nm-dialog';
import { NmButton } from '@/components/ui/nm-button';
import { NmIconButton } from '@/components/ui/nm-icon-button';
import { NmInput } from '@/components/ui/nm-input';
import { FieldLabel } from '@/components/ui/label';
import { useCreatePlan, useUpdatePlan } from '@/lib/hooks/use-owner-plans';
import type { OwnerPlan } from '@/lib/types/owner';

type V = { name: string; monthlyFee: string; setupFee: string; trialDays: string; maxStudents: string };

/** Add (no plan) or edit (plan) a platform plan. */
export function PlanDialog({ plan }: { plan?: OwnerPlan }) {
  const [open, setOpen] = useState(false);
  const create = useCreatePlan();
  const update = useUpdatePlan(plan?.id ?? '');
  const form = useForm<V>({
    defaultValues: {
      name: plan?.name ?? '', monthlyFee: String(plan?.monthlyFee ?? ''), setupFee: String(plan?.setupFee ?? ''),
      trialDays: String(plan?.trialDays ?? 7), maxStudents: plan?.maxStudents != null ? String(plan.maxStudents) : '',
    },
  });

  const onSubmit = form.handleSubmit(async (v) => {
    const payload = {
      name: v.name, monthlyFee: Number(v.monthlyFee) || 0, setupFee: Number(v.setupFee) || 0,
      trialDays: Number(v.trialDays) || 0, maxStudents: v.maxStudents ? Number(v.maxStudents) : undefined,
    };
    if (plan) await update.mutateAsync(payload);
    else await create.mutateAsync(payload);
    setOpen(false);
  });

  return (
    <NmDialog open={open} onOpenChange={setOpen} title={plan ? 'Tarifni tahrirlash' : 'Yangi tarif'}
      trigger={plan
        ? <NmIconButton aria-label="Tahrirlash"><Pencil className="size-[15px]" strokeWidth={2} /></NmIconButton>
        : <NmButton><Plus className="size-[18px]" strokeWidth={2.4} />Yangi tarif</NmButton>}>
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <div><FieldLabel>NOMI</FieldLabel><NmInput {...form.register('name')} /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><FieldLabel>OYLIK</FieldLabel><NmInput inputMode="numeric" {...form.register('monthlyFee')} /></div>
          <div><FieldLabel>O&apos;RNATISH</FieldLabel><NmInput inputMode="numeric" {...form.register('setupFee')} /></div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><FieldLabel>SINOV (kun)</FieldLabel><NmInput inputMode="numeric" {...form.register('trialDays')} /></div>
          <div><FieldLabel>MAKS O&apos;QUVCHI</FieldLabel><NmInput inputMode="numeric" {...form.register('maxStudents')} /></div>
        </div>
        <div className="mt-2 flex gap-3">
          <NmButton type="button" variant="soft" className="flex-1" onClick={() => setOpen(false)}>Bekor</NmButton>
          <NmButton type="submit" className="flex-[1.4]" disabled={create.isPending || update.isPending}>Saqlash</NmButton>
        </div>
      </form>
    </NmDialog>
  );
}
