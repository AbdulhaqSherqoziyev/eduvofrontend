'use client';

import { useState } from 'react';
import { NmDialog } from '@/components/ui/nm-dialog';
import { NmButton } from '@/components/ui/nm-button';
import { NmInput } from '@/components/ui/nm-input';
import { usePatchAssignment } from '@/lib/hooks/use-center-exams';
import type { Assignment } from '@/lib/api/center-exams';
import { examErrorText } from '../exam-errors';
import { FieldLabel } from '../assign/assign-dialog';

const pad = (n: number) => String(n).padStart(2, '0');
/** ISO → value of <input type="datetime-local"> in the browser's zone. */
const toLocal = (iso: string) => {
  const d = new Date(iso);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};
const field = 'h-[46px] w-full rounded-[13px] bg-background px-3.5 text-[14px] font-bold text-foreground shadow-nm-inset outline-none';

interface Props { a: Assignment; open: boolean; onOpenChange: (v: boolean) => void }

/** PATCH /exams/assignments/:id — title and window only (§2.6). */
export function EditAssignmentDialog({ a, open, onOpenChange }: Props) {
  return (
    <NmDialog open={open} onOpenChange={onOpenChange} title="Tayinlovni tahrirlash">
      {open ? <EditForm a={a} onClose={() => onOpenChange(false)} /> : null}
    </NmDialog>
  );
}

function EditForm({ a, onClose }: { a: Assignment; onClose: () => void }) {
  const [title, setTitle] = useState(a.title);
  const [start, setStart] = useState(toLocal(a.windowStart));
  const [end, setEnd] = useState(toLocal(a.windowEnd));
  const [problem, setProblem] = useState<string | null>(null);
  const patch = usePatchAssignment(a.id);

  const save = () => {
    const s = new Date(start);
    const e = new Date(end);
    if (!title.trim()) return setProblem('Nomini kiriting.');
    if (title.trim().length > 120) return setProblem('Nom 120 belgidan oshmasin.');
    if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return setProblem('Sana va vaqtni kiriting.');
    if (e <= s) return setProblem("Tugash vaqti boshlanishdan keyin bo'lsin.");
    setProblem(null);
    patch.mutate({ title: title.trim(), windowStart: s.toISOString(), windowEnd: e.toISOString() }, { onSuccess: onClose });
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <FieldLabel>NOMI</FieldLabel>
        <NmInput value={title} maxLength={120} onChange={(e) => setTitle(e.target.value)} className="h-[46px]" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <FieldLabel>BOSHLANISH</FieldLabel>
          <input type="datetime-local" className={field} value={start} onChange={(e) => setStart(e.target.value)} />
        </div>
        <div>
          <FieldLabel>TUGASH</FieldLabel>
          <input type="datetime-local" className={field} value={end} onChange={(e) => setEnd(e.target.value)} />
        </div>
      </div>
      {a.startedCount > 0 ? (
        <p className="text-[12px] font-semibold text-[#7A4E00]">
          {a.startedCount} o&apos;quvchi imtihonni boshlagan. Oynani qisqartirsangiz, kod bilan kirish va yangi boshlash shu vaqtga moslashadi.
        </p>
      ) : null}
      {problem ? <p className="text-[12.5px] font-bold text-danger">{problem}</p> : null}
      {patch.error ? <p className="text-[12.5px] font-bold text-danger">{examErrorText(patch.error)}</p> : null}
      <div className="flex gap-2.5">
        <NmButton variant="soft" className="flex-1 text-[#5b6b82]" disabled={patch.isPending} onClick={onClose}>Bekor qilish</NmButton>
        <NmButton className="flex-[1.4]" disabled={patch.isPending} onClick={save}>{patch.isPending ? 'Saqlanmoqda…' : 'Saqlash'}</NmButton>
      </div>
    </div>
  );
}
