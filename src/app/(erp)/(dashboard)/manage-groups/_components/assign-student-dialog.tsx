'use client';

import { useState } from 'react';
import { NmDialog } from '@/components/ui/nm-dialog';
import { NmButton } from '@/components/ui/nm-button';
import { NmSelect } from '@/components/ui/nm-select';
import { NmSegmented } from '@/components/ui/nm-segmented';
import { FieldLabel } from '@/components/ui/label';
import { useAddStudentGroup, useStudents, useUpdateStudent } from '@/lib/hooks/use-students';
import { useGroupOptions } from '@/lib/hooks/use-groups';
import { groupChangeError } from '@/lib/utils/group-move';

const MODES = [
  { value: 'assign', label: 'Biriktirish' },
  { value: 'transfer', label: "Boshqa guruhga o'tkazish" },
];

/**
 * Dialog to assign / transfer a student to a group.
 *
 * «Biriktirish» ADDS one more group (POST /students/:id/enrollments). A PATCH
 * with `groupId` means MOVE on the backend: with one open group it silently
 * replaces it, so it must never be used for "assign".
 * «Boshqa guruhga o'tkazish» is that PATCH without `fromGroupId`: one group ->
 * replaced; 2+ groups -> 409 MULTI_GROUP ("change it from the profile"), which
 * is shown rather than guessed — the list row does not say which group to leave.
 */
export function AssignStudentDialog() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState('assign');
  const [studentId, setStudentId] = useState('');
  const [groupId, setGroupId] = useState('');

  const students = useStudents({});
  const groups = useGroupOptions();
  const update = useUpdateStudent(studentId);
  const add = useAddStudentGroup(studentId);
  const [error, setError] = useState<string>();
  const pending = update.isPending || add.isPending;

  const onSubmit = async () => {
    if (!studentId || !groupId) return;
    setError(undefined);
    try {
      if (mode === 'transfer') await update.mutateAsync({ groupId });
      else await add.mutateAsync(groupId);
    } catch (err) {
      setError(groupChangeError(err));
      return;
    }
    setStudentId('');
    setGroupId('');
    setOpen(false);
  };

  return (
    <NmDialog
      open={open}
      onOpenChange={(o) => { setOpen(o); if (!o) setError(undefined); }}
      title="O'quvchi biriktirish"
      trigger={<NmButton variant="soft">O&apos;quvchi biriktirish</NmButton>}
    >
      <div className="flex flex-col gap-4">
        <NmSegmented items={MODES} value={mode} onValueChange={(m) => { setMode(m); setError(undefined); }} />
        <div>
          <FieldLabel>O&apos;QUVCHI</FieldLabel>
          <NmSelect value={studentId} onChange={(e) => { setStudentId(e.target.value); setError(undefined); }}>
            <option value="" disabled>O&apos;quvchini tanlang...</option>
            {(students.data?.items ?? []).map((s) => (
              <option key={s.id} value={s.id}>{s.fullName}</option>
            ))}
          </NmSelect>
        </div>
        <div>
          <FieldLabel>GURUH</FieldLabel>
          <NmSelect value={groupId} onChange={(e) => { setGroupId(e.target.value); setError(undefined); }}>
            <option value="" disabled>Guruhni tanlang...</option>
            {groups.map((g) => (
              <option key={g.value} value={g.value}>{g.label}</option>
            ))}
          </NmSelect>
        </div>
        {error ? <p role="alert" className="text-[12px] font-semibold text-danger">{error}</p> : null}
        <div className="mt-2 flex gap-3">
          <NmButton type="button" variant="soft" className="flex-1" onClick={() => setOpen(false)}>
            Bekor qilish
          </NmButton>
          <NmButton
            type="button"
            className="flex-[1.4]"
            onClick={onSubmit}
            disabled={pending || !studentId || !groupId}
          >
            {pending ? '...' : 'Saqlash'}
          </NmButton>
        </div>
      </div>
    </NmDialog>
  );
}
