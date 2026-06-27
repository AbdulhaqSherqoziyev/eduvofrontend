'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { NmCard } from '@/components/ui/nm-card';
import { NmInput } from '@/components/ui/nm-input';
import { NmButton } from '@/components/ui/nm-button';
import { FieldLabel } from '@/components/ui/label';
import { useProfile, useUpdateProfile } from '@/lib/hooks/use-profile';

/** Self-edit of the current user's own name + phone. */
export function ProfileForm() {
  const { data } = useProfile();
  const update = useUpdateProfile();
  const [saved, setSaved] = useState(false);
  const form = useForm({ values: { fullName: data?.fullName ?? '', phone: data?.phone ?? '' } });

  const onSubmit = form.handleSubmit(async (values) => {
    await update.mutateAsync(values);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  });

  return (
    <NmCard className="p-6">
      <h2 className="mb-5 text-[16px] font-extrabold text-foreground">Shaxsiy ma&apos;lumotlar</h2>
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <div>
          <FieldLabel>ISM FAMILIYA</FieldLabel>
          <NmInput {...form.register('fullName')} />
        </div>
        <div>
          <FieldLabel>TELEFON</FieldLabel>
          <NmInput {...form.register('phone')} />
        </div>
        <div className="flex items-center gap-3 pt-1">
          <NmButton type="submit" disabled={update.isPending}>
            {update.isPending ? '...' : 'Saqlash'}
          </NmButton>
          {saved ? <span className="text-[13px] font-bold text-primary">Saqlandi ✓</span> : null}
        </div>
      </form>
    </NmCard>
  );
}
