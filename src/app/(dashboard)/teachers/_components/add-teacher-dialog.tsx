'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus } from 'lucide-react';
import { NmDialog } from '@/components/ui/nm-dialog';
import { NmButton } from '@/components/ui/nm-button';
import { CompensationBlock } from '@/components/payroll/compensation-block';
import { useCompensationBlock } from '@/components/payroll/use-compensation-block';
import { useCreateTeacher } from '@/lib/hooks/use-teachers';
import { TeacherFormFields } from './teacher-form-fields';
import { teacherSchema, type TeacherFormValues } from './teacher-schema';

/** Dialog to create a new teacher (teacher.create). */
export function AddTeacherDialog() {
  const [open, setOpen] = useState(false);
  const [createdId, setCreatedId] = useState<string | null>(null);
  const create = useCreateTeacher();
  const comp = useCompensationBlock('TEACHER', createdId);
  const form = useForm<TeacherFormValues>({
    resolver: zodResolver(teacherSchema),
    defaultValues: { fullName: '', phone: '', directions: '' },
  });

  const onSubmit = async (values: TeacherFormValues) => {
    // Qoida saqlanmay qolsa dialog ochiq turadi — takroriy bosishda o'qituvchi
    // ikkinchi marta yaratilmasin.
    const id =
      createdId ??
      (
        await create.mutateAsync({
          fullName: values.fullName,
          phone: values.phone,
          directions: values.directions || undefined,
        })
      ).id;
    setCreatedId(id);
    if (!(await comp.submit(id))) return;
    form.reset();
    setCreatedId(null);
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
        {/* Blok formaning eng ostida va yig'ilgan turadi — o'qituvchi qo'shish
            uch maydonlik ish bo'lib qolsin (§A.1). */}
        <CompensationBlock ctl={comp} subjectType="TEACHER" subjectId={createdId} subjectName={form.watch('fullName')} />
        <div className="mt-6 flex gap-3">
          <NmButton type="button" variant="soft" className="flex-1" onClick={() => setOpen(false)}>
            Bekor qilish
          </NmButton>
          <NmButton type="submit" className="flex-[1.4]" disabled={create.isPending || comp.pending}>
            {create.isPending || comp.pending ? 'Saqlanmoqda…' : "Qo'shish"}
          </NmButton>
        </div>
      </form>
    </NmDialog>
  );
}
