'use client';

import { useState } from 'react';
import { KeyRound } from 'lucide-react';
import { NmDialog } from '@/components/ui/nm-dialog';
import { NmButton } from '@/components/ui/nm-button';
import { NmInput } from '@/components/ui/nm-input';
import { NmIconButton } from '@/components/ui/nm-icon-button';
import { FieldLabel } from '@/components/ui/label';
import { useSetTeacherAccount, useTeacherAccount } from '@/lib/hooks/use-teachers';
import { apiErrorMessage } from '@/lib/utils/api-error';
import type { Teacher } from '@/lib/types/teacher';

/** Set/reset a teacher's LOGIN (phone) + password from the admin panel (teacher.update). */
export function TeacherAccountDialog({ teacher }: { teacher: Teacher }) {
  const [open, setOpen] = useState(false);
  const [phone, setPhone] = useState(teacher.phone);
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const account = useTeacherAccount(teacher.id, open);
  const save = useSetTeacherAccount(teacher.id);
  const exists = account.data?.exists;

  const reset = (o: boolean) => {
    setOpen(o);
    if (o) { setPhone(teacher.phone); setPassword(''); setErr(''); }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr('');
    if (!exists && password.length < 6) return setErr("Yangi hisob uchun kamida 6 belgili parol kiriting");
    if (password && password.length < 6) return setErr("Parol kamida 6 belgi bo'lishi kerak");
    try {
      await save.mutateAsync({ phone: phone.trim() || undefined, password: password || undefined });
      setOpen(false);
    } catch (ex) {
      setErr(apiErrorMessage(ex, 'Saqlashda xatolik'));
    }
  };

  return (
    <NmDialog open={open} onOpenChange={reset} title="O'qituvchi login/parol"
      trigger={<NmIconButton aria-label="Login/parol"><KeyRound className="size-[15px]" strokeWidth={2} /></NmIconButton>}>
      <form onSubmit={onSubmit} className="flex flex-col gap-3.5">
        <p className="text-[12.5px] font-medium text-muted">
          {account.isLoading ? 'Yuklanmoqda…'
            : exists ? <>Joriy login: <b className="text-foreground">{account.data?.login}</b>. Parolni yangilash uchun quyida kiriting.</>
            : "Bu o'qituvchida hali tizim hisobi yo'q. Login (telefon) va parol kiriting — hisob yaratiladi."}
        </p>
        <div>
          <FieldLabel>LOGIN (TELEFON)</FieldLabel>
          <NmInput value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+998 90 123 45 67" />
        </div>
        <div>
          <FieldLabel>{exists ? 'YANGI PAROL (ixtiyoriy)' : 'PAROL'}</FieldLabel>
          <NmInput value={password} onChange={(e) => setPassword(e.target.value)} placeholder="kamida 6 belgi" autoComplete="new-password" />
        </div>
        {err ? <p className="text-[12.5px] font-bold text-danger">{err}</p> : null}
        <div className="mt-2 flex gap-3">
          <NmButton type="button" variant="soft" className="flex-1" onClick={() => setOpen(false)}>Bekor</NmButton>
          <NmButton type="submit" className="flex-[1.4]" disabled={save.isPending || account.isLoading}>
            {save.isPending ? '...' : 'Saqlash'}
          </NmButton>
        </div>
      </form>
    </NmDialog>
  );
}
