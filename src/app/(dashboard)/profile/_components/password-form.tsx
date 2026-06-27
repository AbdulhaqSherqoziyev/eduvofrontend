'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { NmCard } from '@/components/ui/nm-card';
import { NmInput } from '@/components/ui/nm-input';
import { NmButton } from '@/components/ui/nm-button';
import { FieldLabel } from '@/components/ui/label';
import { useChangePassword } from '@/lib/hooks/use-profile';

/** Self-service password change for the current user. */
export function PasswordForm() {
  const change = useChangePassword();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const form = useForm({ defaultValues: { currentPassword: '', newPassword: '' } });

  const onSubmit = form.handleSubmit(async (values) => {
    setMsg(null);
    if (values.newPassword.length < 6) {
      setMsg({ ok: false, text: 'Yangi parol kamida 6 belgi' });
      return;
    }
    try {
      await change.mutateAsync(values);
      form.reset();
      setMsg({ ok: true, text: 'Parol yangilandi ✓' });
    } catch {
      setMsg({ ok: false, text: "Joriy parol noto'g'ri" });
    }
  });

  return (
    <NmCard className="p-6">
      <h2 className="mb-5 text-[16px] font-extrabold text-foreground">Parolni o&apos;zgartirish</h2>
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <div>
          <FieldLabel>JORIY PAROL</FieldLabel>
          <NmInput type="password" autoComplete="current-password" {...form.register('currentPassword')} />
        </div>
        <div>
          <FieldLabel>YANGI PAROL</FieldLabel>
          <NmInput type="password" autoComplete="new-password" {...form.register('newPassword')} />
        </div>
        <div className="flex items-center gap-3 pt-1">
          <NmButton type="submit" disabled={change.isPending}>
            {change.isPending ? '...' : "O'zgartirish"}
          </NmButton>
          {msg ? (
            <span className={`text-[13px] font-bold ${msg.ok ? 'text-primary' : 'text-danger'}`}>{msg.text}</span>
          ) : null}
        </div>
      </form>
    </NmCard>
  );
}
