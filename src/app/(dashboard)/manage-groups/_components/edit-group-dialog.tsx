'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Pencil } from 'lucide-react';
import { NmDialog } from '@/components/ui/nm-dialog';
import { NmButton } from '@/components/ui/nm-button';
import { NmIconButton } from '@/components/ui/nm-icon-button';
import { useUpdateGroup } from '@/lib/hooks/use-groups';
import type { Group, GroupLevel } from '@/lib/types/group';
import { CreateGroupFields } from './create-group-fields';
import { groupSchema, type GroupFormValues } from './group-schema';

/** Edit an existing group (group.update). */
export function EditGroupDialog({ group }: { group: Group }) {
  const [open, setOpen] = useState(false);
  const update = useUpdateGroup(group.id);
  const form = useForm<GroupFormValues>({
    resolver: zodResolver(groupSchema),
    defaultValues: {
      name: group.name,
      subjectId: group.subjectId ?? '',
      teacherId: group.teacherId ?? '',
      roomId: group.roomId ?? '',
      schedule: group.schedule,
      startTime: group.startTime,
      endTime: group.endTime ?? '',
      level: group.level,
      price: String(group.price),
    },
  });

  const onSubmit = async (values: GroupFormValues) => {
    await update.mutateAsync({
      name: values.name,
      subjectId: values.subjectId || undefined,
      teacherId: values.teacherId || undefined,
      roomId: values.roomId || undefined,
      schedule: values.schedule,
      startTime: values.startTime,
      endTime: values.endTime || undefined,
      price: Number(values.price),
      level: values.level as GroupLevel,
    });
    setOpen(false);
  };

  return (
    <NmDialog
      open={open}
      onOpenChange={setOpen}
      title="Guruhni tahrirlash"
      trigger={
        <NmIconButton aria-label="Tahrirlash">
          <Pencil className="size-[15px]" strokeWidth={2} />
        </NmIconButton>
      }
    >
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CreateGroupFields form={form} />
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
