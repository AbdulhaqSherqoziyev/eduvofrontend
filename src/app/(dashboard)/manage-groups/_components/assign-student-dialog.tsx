'use client';

import { useState } from 'react';
import { NmDialog } from '@/components/ui/nm-dialog';
import { NmButton } from '@/components/ui/nm-button';
import { NmSelect } from '@/components/ui/nm-select';
import { NmSegmented } from '@/components/ui/nm-segmented';
import { FieldLabel } from '@/components/ui/label';
import { useStudents, useUpdateStudent } from '@/lib/hooks/use-students';
import { useGroupOptions } from '@/lib/hooks/use-groups';

const MODES = [
  { value: 'assign', label: 'Biriktirish' },
  { value: 'transfer', label: "Boshqa guruhga o'tkazish" },
];

/** Dialog to assign / transfer a student to a group via useUpdateStudent(). */
export function AssignStudentDialog() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState('assign');
  const [studentId, setStudentId] = useState('');
  const [groupId, setGroupId] = useState('');

  const students = useStudents({});
  const groups = useGroupOptions();
  const update = useUpdateStudent(studentId);

  const onSubmit = async () => {
    if (!studentId || !groupId) return;
    await update.mutateAsync({ groupId });
    setStudentId('');
    setGroupId('');
    setOpen(false);
  };

  return (
    <NmDialog
      open={open}
      onOpenChange={setOpen}
      title="O'quvchi biriktirish"
      trigger={<NmButton variant="soft">O&apos;quvchi biriktirish</NmButton>}
    >
      <div className="flex flex-col gap-4">
        <NmSegmented items={MODES} value={mode} onValueChange={setMode} />
        <div>
          <FieldLabel>O&apos;QUVCHI</FieldLabel>
          <NmSelect value={studentId} onChange={(e) => setStudentId(e.target.value)}>
            <option value="" disabled>O&apos;quvchini tanlang...</option>
            {(students.data?.items ?? []).map((s) => (
              <option key={s.id} value={s.id}>{s.fullName}</option>
            ))}
          </NmSelect>
        </div>
        <div>
          <FieldLabel>GURUH</FieldLabel>
          <NmSelect value={groupId} onChange={(e) => setGroupId(e.target.value)}>
            <option value="" disabled>Guruhni tanlang...</option>
            {groups.map((g) => (
              <option key={g.value} value={g.value}>{g.label}</option>
            ))}
          </NmSelect>
        </div>
        <div className="mt-2 flex gap-3">
          <NmButton type="button" variant="soft" className="flex-1" onClick={() => setOpen(false)}>
            Bekor qilish
          </NmButton>
          <NmButton
            type="button"
            className="flex-[1.4]"
            onClick={onSubmit}
            disabled={update.isPending || !studentId || !groupId}
          >
            {update.isPending ? '...' : 'Saqlash'}
          </NmButton>
        </div>
      </div>
    </NmDialog>
  );
}
