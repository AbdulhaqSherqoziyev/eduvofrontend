'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus } from 'lucide-react';
import { NmDialog } from '@/components/ui/nm-dialog';
import { NmButton } from '@/components/ui/nm-button';
import { useCreateAssignment } from '@/lib/hooks/use-assignments';
import { AssignmentFormFields } from './assignment-form-fields';
import { assignmentSchema, type AssignmentFormValues } from './assignment-schema';

/** Dialog to create a new assignment with attachments. */
export function CreateAssignmentDialog() {
  const [open, setOpen] = useState(false);
  const [fileIds, setFileIds] = useState<string[]>([]);
  const create = useCreateAssignment();
  const form = useForm<AssignmentFormValues>({
    resolver: zodResolver(assignmentSchema),
    defaultValues: { title: '', groupId: '', dueDate: '', description: '' },
  });

  const onSubmit = async (values: AssignmentFormValues) => {
    await create.mutateAsync({ ...values, fileIds });
    form.reset();
    setFileIds([]);
    setOpen(false);
  };

  return (
    <NmDialog
      open={open}
      onOpenChange={setOpen}
      title="Yangi vazifa"
      trigger={
        <NmButton>
          <Plus className="size-[18px]" strokeWidth={2.4} />
          Yangi vazifa
        </NmButton>
      }
    >
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <AssignmentFormFields form={form} fileIds={fileIds} onFiles={setFileIds} />
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
