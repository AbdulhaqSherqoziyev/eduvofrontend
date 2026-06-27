'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus } from 'lucide-react';
import { NmDialog } from '@/components/ui/nm-dialog';
import { NmButton } from '@/components/ui/nm-button';
import { useCreateGroup } from '@/lib/hooks/use-groups';
import type { GroupLevel } from '@/lib/types/group';
import { CreateGroupFields } from './create-group-fields';
import { groupSchema, type GroupFormValues } from './group-schema';

/** Dialog that creates a new group via useCreateGroup(). */
export function CreateGroupDialog() {
  const [open, setOpen] = useState(false);
  const create = useCreateGroup();
  const form = useForm<GroupFormValues>({
    resolver: zodResolver(groupSchema),
    defaultValues: { name: '', subjectId: '', teacherId: '', schedule: 'Du · Cho · Ju', startTime: '18:00', level: 'BEGINNER', price: '' },
  });

  const onSubmit = async (values: GroupFormValues) => {
    await create.mutateAsync({
      name: values.name,
      subjectId: values.subjectId || undefined,
      teacherId: values.teacherId || undefined,
      schedule: values.schedule,
      startTime: values.startTime,
      price: Number(values.price),
      level: values.level as GroupLevel,
    });
    form.reset();
    setOpen(false);
  };

  return (
    <NmDialog
      open={open}
      onOpenChange={setOpen}
      title="Yangi guruh"
      trigger={
        <NmButton>
          <Plus className="size-[18px]" strokeWidth={2.4} />
          Yangi guruh
        </NmButton>
      }
    >
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CreateGroupFields form={form} />
        <div className="mt-6 flex gap-3">
          <NmButton type="button" variant="soft" className="flex-1" onClick={() => setOpen(false)}>
            Bekor qilish
          </NmButton>
          <NmButton type="submit" className="flex-[1.4]" disabled={create.isPending}>
            {create.isPending ? '...' : 'Saqlash'}
          </NmButton>
        </div>
      </form>
    </NmDialog>
  );
}
