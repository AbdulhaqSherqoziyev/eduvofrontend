'use client';

import { Trash2 } from 'lucide-react';
import { Can } from '@/components/shared/can';
import { NmIconButton } from '@/components/ui/nm-icon-button';
import { useDeleteAssignment } from '@/lib/hooks/use-assignments';

/** Per-row delete action for an assignment (assignment.update). */
export function AssignmentRowActions({ id, title }: { id: string; title: string }) {
  const remove = useDeleteAssignment();
  const onDelete = () => {
    if (window.confirm(`"${title}" — o'chirilsinmi?`)) remove.mutate(id);
  };
  return (
    <Can permission="assignment.update">
      <NmIconButton tone="danger" aria-label="O'chirish" onClick={onDelete} disabled={remove.isPending}>
        <Trash2 className="size-[15px]" strokeWidth={2} />
      </NmIconButton>
    </Can>
  );
}
