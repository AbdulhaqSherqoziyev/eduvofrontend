'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Pencil } from 'lucide-react';
import { NmDialog } from '@/components/ui/nm-dialog';
import { NmButton } from '@/components/ui/nm-button';
import { NmIconButton } from '@/components/ui/nm-icon-button';
import { useUpdateTeacher } from '@/lib/hooks/use-teachers';
import type { Teacher } from '@/lib/types/teacher';
import { TeacherFormFields } from './teacher-form-fields';
import { teacherSchema, type TeacherFormValues } from './teacher-schema';

/** Edit an existing teacher (teacher.update). */
export function EditTeacherDialog({ teacher }: { teacher: Teacher }) {
  const [open, setOpen] = useState(false);
  const update = useUpdateTeacher(teacher.id);
  const form = useForm<TeacherFormValues>({
    resolver: zodResolver(teacherSchema),
    defaultValues: { fullName: teacher.fullName, phone: teacher.phone, salary: String(teacher.salary), subjectId: '' },
  });

  const onSubmit = async (values: TeacherFormValues) => {
    await update.mutateAsync({
      fullName: values.fullName,
      phone: values.phone,
      salary: Number(values.salary),
      subjectId: values.subjectId || undefined,
    });
    setOpen(false);
  };

  return (
    <NmDialog
      open={open}
      onOpenChange={setOpen}
      title="O'qituvchini tahrirlash"
      trigger={
        <NmIconButton aria-label="Tahrirlash">
          <Pencil className="size-[15px]" strokeWidth={2} />
        </NmIconButton>
      }
    >
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <TeacherFormFields form={form} />
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
