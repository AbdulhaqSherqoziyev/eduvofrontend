'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus } from 'lucide-react';
import { NmDialog } from '@/components/ui/nm-dialog';
import { NmButton } from '@/components/ui/nm-button';
import { useCreateStudent } from '@/lib/hooks/use-students';
import { StudentFormFields } from './student-form-fields';
import { studentSchema, type StudentFormValues } from './student-form-schema';

/** Floating "add student" FAB that opens the create dialog. */
export function AddStudentDialog() {
  const [open, setOpen] = useState(false);
  const create = useCreateStudent();
  const form = useForm<StudentFormValues>({
    resolver: zodResolver(studentSchema),
    defaultValues: { fullName: '', phone: '', groupId: '' },
  });

  const onSubmit = async (values: StudentFormValues) => {
    await create.mutateAsync(values);
    form.reset();
    setOpen(false);
  };

  return (
    <NmDialog
      open={open}
      onOpenChange={setOpen}
      title="Yangi o'quvchi qo'shish"
      trigger={
        <NmButton size="lg" className="fixed bottom-8 right-8 z-40 rounded-[18px] shadow-nm-primary">
          <Plus className="size-5" strokeWidth={2.4} />
          O&apos;quvchi qo&apos;shish
        </NmButton>
      }
    >
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <StudentFormFields form={form} />
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
