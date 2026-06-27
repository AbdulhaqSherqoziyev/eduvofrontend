'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus } from 'lucide-react';
import { NmDialog } from '@/components/ui/nm-dialog';
import { NmButton } from '@/components/ui/nm-button';
import { useCreateTeacher } from '@/lib/hooks/use-teachers';
import { TeacherFormFields } from './teacher-form-fields';
import { teacherSchema, type TeacherFormValues } from './teacher-schema';

/** Dialog to create a new teacher (teacher.create). */
export function AddTeacherDialog() {
  const [open, setOpen] = useState(false);
  const create = useCreateTeacher();
  const form = useForm<TeacherFormValues>({
    resolver: zodResolver(teacherSchema),
    defaultValues: { fullName: '', phone: '', salary: '', subjectId: '' },
  });

  const onSubmit = async (values: TeacherFormValues) => {
    await create.mutateAsync({
      fullName: values.fullName,
      phone: values.phone,
      salary: Number(values.salary),
      subjectId: values.subjectId || undefined,
    });
    form.reset();
    setOpen(false);
  };

  return (
    <NmDialog
      open={open}
      onOpenChange={setOpen}
      title="Yangi o'qituvchi qo'shish"
      trigger={
        <NmButton>
          <Plus className="size-[18px]" strokeWidth={2.4} />
          Yangi o&apos;qituvchi
        </NmButton>
      }
    >
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <TeacherFormFields form={form} />
        <div className="mt-6 flex gap-3">
          <NmButton type="button" variant="soft" className="flex-1" onClick={() => setOpen(false)}>
            Bekor qilish
          </NmButton>
          <NmButton type="submit" className="flex-[1.4]" disabled={create.isPending}>
            {create.isPending ? '...' : "Qo'shish"}
          </NmButton>
        </div>
      </form>
    </NmDialog>
  );
}
