'use client';

import { useState } from 'react';
import { NmButton } from '@/components/ui/nm-button';
import { NmInput } from '@/components/ui/nm-input';
import { FieldLabel } from '@/components/ui/label';
import { useCreateParent, useSetParentCredentials } from '@/lib/hooks/use-students';
import { apiErrorMessage } from '@/lib/utils/api-error';
import type { ParentCredential } from '@/lib/types/student';

interface Props {
  studentId: string;
  parent?: ParentCredential; // undefined => create a new parent
  onDone?: () => void;
}

/** Edit an existing parent's login/password, or create a new parent (login + password required). */
export function ParentCredentialForm({ studentId, parent, onDone }: Props) {
  const creating = !parent;
  const [fullName, setFullName] = useState(parent?.fullName ?? '');
  const [phone, setPhone] = useState(parent?.phone ?? '');
  const [login, setLogin] = useState(parent?.login ?? '');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const create = useCreateParent(studentId);
  const save = useSetParentCredentials(studentId, parent?.id ?? '');
  const busy = create.isPending || save.isPending;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr('');
    if (creating && (!login.trim() || password.length < 6)) return setErr('Login va kamida 6 belgili parol shart');
    if (password && password.length < 6) return setErr("Parol kamida 6 belgi bo'lishi kerak");
    const input = {
      fullName: fullName.trim() || undefined, phone: phone.trim() || undefined,
      login: login.trim() || undefined, password: password || undefined,
    };
    try {
      if (creating) { await create.mutateAsync(input); setFullName(''); setPhone(''); setLogin(''); }
      else await save.mutateAsync(input);
      setPassword('');
      onDone?.();
    } catch (ex) { setErr(apiErrorMessage(ex, 'Saqlashda xatolik')); }
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-2.5 rounded-[14px] bg-background p-3.5 shadow-nm-inset-sm">
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        <div>
          <FieldLabel>ISM</FieldLabel>
          <NmInput value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Ota-ona ismi" />
        </div>
        <div>
          <FieldLabel>TELEFON</FieldLabel>
          <NmInput value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+998 ..." />
        </div>
        <div>
          <FieldLabel>LOGIN</FieldLabel>
          <NmInput value={login} onChange={(e) => setLogin(e.target.value)} placeholder="masalan v12" />
        </div>
        <div>
          <FieldLabel>{creating ? 'PAROL' : 'YANGI PAROL'}</FieldLabel>
          <NmInput value={password} onChange={(e) => setPassword(e.target.value)} placeholder="kamida 6 belgi" autoComplete="new-password" />
        </div>
      </div>
      {err ? <p className="text-[12px] font-bold text-danger">{err}</p> : null}
      <div className="flex justify-end">
        <NmButton type="submit" variant="soft" disabled={busy}>
          {busy ? '...' : creating ? "Ota-ona qo'shish" : 'Saqlash'}
        </NmButton>
      </div>
    </form>
  );
}
