'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Pencil } from 'lucide-react';
import { NmDialog } from '@/components/ui/nm-dialog';
import { NmButton } from '@/components/ui/nm-button';
import { NmIconButton } from '@/components/ui/nm-icon-button';
import { useUpdateStudent } from '@/lib/hooks/use-students';
import type { Student } from '@/lib/types/student';
import { StudentFormFields } from './student-form-fields';
import { studentSchema, type StudentFormValues } from './student-form-schema';

/** Edit an existing student (triggered by the row pencil icon). */
export function EditStudentDialog({ student }: { student: Student }) {
  const [open, setOpen] = useState(false);
  const update = useUpdateStudent(student.id);
  const form = useForm<StudentFormValues>({
    resolver: zodResolver(studentSchema),
    defaultValues: { fullName: student.fullName, phone: student.phone, groupId: student.groupId ?? '' },
  });

  const onSubmit = async (values: StudentFormValues) => {
    await update.mutateAsync(values);
    setOpen(false);
  };

  return (
    <NmDialog
      open={open}
      onOpenChange={setOpen}
      title="O'quvchini tahrirlash"
      trigger={
        <NmIconButton aria-label="Tahrirlash">
          <Pencil className="size-[15px]" strokeWidth={2} />
        </NmIconButton>
      }
    >
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <StudentFormFields form={form} />
        <div className="mt-6 flex gap-3">
          <NmButton type="button" variant="soft" className="flex-1" onClick={() => setOpen(false)}>
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
