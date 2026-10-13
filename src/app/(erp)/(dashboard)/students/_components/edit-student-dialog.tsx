'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Pencil } from 'lucide-react';
import { NmDialog } from '@/components/ui/nm-dialog';
import { NmButton } from '@/components/ui/nm-button';
import { NmIconButton } from '@/components/ui/nm-icon-button';
import { useGroupOptions } from '@/lib/hooks/use-groups';
import { useUpdateStudent } from '@/lib/hooks/use-students';
import { groupChangeError, moveNote } from '@/lib/utils/group-move';
import type { Student, UpdateStudentInput } from '@/lib/types/student';
import { StudentFormFields } from './student-form-fields';
import { studentSchema, type StudentFormValues } from './student-form-schema';

/**
 * Edit an existing student (triggered by the row pencil icon). A different
 * group is a MOVE out of `student.groupId`, never an extra group — adding one
 * more group lives on the profile.
 */
export function EditStudentDialog({ student }: { student: Student }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string>();
  const update = useUpdateStudent(student.id);
  const groups = useGroupOptions();
  const form = useForm<StudentFormValues>({
    resolver: zodResolver(studentSchema),
    defaultValues: { fullName: student.fullName, phone: student.phone, groupId: student.groupId ?? '' },
  });

  const oldGroupId = student.groupId ?? '';
  const newGroupId = form.watch('groupId') ?? '';
  const moving = !!oldGroupId && !!newGroupId && newGroupId !== oldGroupId;
  const nameOf = (id: string) => groups.find((g) => g.value === id)?.label;
  const fromName = student.groupName ?? nameOf(oldGroupId);
  const toName = nameOf(newGroupId);

  // Re-seed on every open: after a save the row carries the new group, and a
  // stale form would describe the move backwards.
  const onOpenChange = (o: boolean) => {
    if (o) form.reset({ fullName: student.fullName, phone: student.phone, groupId: student.groupId ?? '' });
    setError(undefined);
    setOpen(o);
  };

  const onSubmit = async (values: StudentFormValues) => {
    setError(undefined);
    const input: UpdateStudentInput = { ...values };
    if (!values.groupId) delete input.groupId;
    if (moving) input.fromGroupId = oldGroupId;
    try {
      await update.mutateAsync(input);
      setOpen(false);
    } catch (err) {
      setError(groupChangeError(err));
    }
  };

  return (
    <NmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="O'quvchini tahrirlash"
      trigger={
        <NmIconButton aria-label="Tahrirlash">
          <Pencil className="size-[15px]" strokeWidth={2} />
        </NmIconButton>
      }
    >
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <StudentFormFields form={form} />
        {moving && fromName && toName ? (
          <p className="mt-2 text-[12px] font-semibold text-muted">{moveNote(fromName, toName)}</p>
        ) : null}
        {error ? (
          <p role="alert" className="mt-3 text-[12px] font-semibold text-danger">{error}</p>
        ) : null}
        <div className="mt-6 flex gap-3">
          <NmButton type="button" variant="soft" className="flex-1" onClick={() => onOpenChange(false)}>
            Bekor qilish
          </NmButton>
          <NmButton type="submit" className="flex-[1.4]" disabled={update.isPending}>
            {update.isPending ? '...' : 'Saqlash'}
          </NmButton>
        </div>
      </form>
    </NmDialog>
  );
}
