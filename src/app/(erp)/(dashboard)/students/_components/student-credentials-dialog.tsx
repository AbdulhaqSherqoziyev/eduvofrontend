'use client';

import { useState } from 'react';
import { KeyRound, Plus } from 'lucide-react';
import { NmDialog } from '@/components/ui/nm-dialog';
import { NmButton } from '@/components/ui/nm-button';
import { NmInput } from '@/components/ui/nm-input';
import { NmIconButton } from '@/components/ui/nm-icon-button';
import { FieldLabel } from '@/components/ui/label';
import { useSetStudentCredentials, useStudentCredentials } from '@/lib/hooks/use-students';
import { apiErrorMessage } from '@/lib/utils/api-error';
import type { Student } from '@/lib/types/student';
import { ParentCredentialForm } from './parent-credential-form';

/** Manage a student's + parents' portal login/password from the admin panel (student.update). */
export function StudentCredentialsDialog({ student }: { student: Student }) {
  const [open, setOpen] = useState(false);
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [addParent, setAddParent] = useState(false);
  const view = useStudentCredentials(student.id, open);
  const save = useSetStudentCredentials(student.id);
  const current = view.data;

  const reset = (o: boolean) => {
    setOpen(o);
    if (o) { setLogin(''); setPassword(''); setErr(''); setAddParent(false); }
  };

  const onSaveStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr('');
    if (!current?.login && password.length < 6) return setErr('Yangi login uchun kamida 6 belgili parol kiriting');
    if (password && password.length < 6) return setErr("Parol kamida 6 belgi bo'lishi kerak");
    try {
      await save.mutateAsync({ login: login.trim() || undefined, password: password || undefined });
      setPassword('');
    } catch (ex) { setErr(apiErrorMessage(ex, 'Saqlashda xatolik')); }
  };

  return (
    <NmDialog open={open} onOpenChange={reset} title="O'quvchi login/parol"
      trigger={<NmIconButton aria-label="Login/parol"><KeyRound className="size-[15px]" strokeWidth={2} /></NmIconButton>}>
      <div className="flex max-h-[70vh] flex-col gap-4 overflow-y-auto pr-1">
        <form onSubmit={onSaveStudent} className="flex flex-col gap-2.5">
          <p className="text-[12.5px] font-medium text-muted">
            {view.isLoading ? 'Yuklanmoqda…'
              : current?.login ? <>Joriy login: <b className="text-foreground">{current.login}</b></>
              : "Bu o'quvchida hali login yo'q — login (ixtiyoriy) va parol kiriting."}
          </p>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            <div>
              <FieldLabel>LOGIN</FieldLabel>
              <NmInput value={login} onChange={(e) => setLogin(e.target.value)} placeholder={current?.login ?? 'avto (o123)'} />
            </div>
            <div>
              <FieldLabel>{current?.login ? 'YANGI PAROL' : 'PAROL'}</FieldLabel>
              <NmInput value={password} onChange={(e) => setPassword(e.target.value)} placeholder="kamida 6 belgi" autoComplete="new-password" />
            </div>
          </div>
          {err ? <p className="text-[12px] font-bold text-danger">{err}</p> : null}
          <div className="flex justify-end">
            <NmButton type="submit" disabled={save.isPending || view.isLoading}>
              {save.isPending ? '...' : "O'quvchini saqlash"}
            </NmButton>
          </div>
        </form>

        <div className="h-px bg-black/5" />

        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-bold uppercase tracking-[0.6px] text-[#9aa6b8]">Ota-onalar</span>
            <NmButton type="button" variant="soft" onClick={() => setAddParent((v) => !v)}>
              <Plus className="size-[16px]" strokeWidth={2.4} />Qo&apos;shish
            </NmButton>
          </div>
          {(current?.parents ?? []).map((p) => (
            <ParentCredentialForm key={p.id} studentId={student.id} parent={p} />
          ))}
          {addParent ? <ParentCredentialForm studentId={student.id} onDone={() => setAddParent(false)} /> : null}
          {!view.isLoading && !current?.parents.length && !addParent ? (
            <p className="text-[12.5px] font-medium text-muted">Ota-ona qo&apos;shilmagan.</p>
          ) : null}
        </div>

        <NmButton type="button" variant="soft" onClick={() => setOpen(false)}>Yopish</NmButton>
      </div>
    </NmDialog>
  );
}
