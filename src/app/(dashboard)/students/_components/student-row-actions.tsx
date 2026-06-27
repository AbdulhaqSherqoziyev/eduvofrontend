'use client';

import { Trash2 } from 'lucide-react';
import { Can } from '@/components/shared/can';
import { NmIconButton } from '@/components/ui/nm-icon-button';
import { useDeleteStudent } from '@/lib/hooks/use-students';
import type { Student } from '@/lib/types/student';
import { EditStudentDialog } from './edit-student-dialog';

/** Row actions: edit (student.update) and soft-delete (student.delete). */
export function StudentRowActions({ student }: { student: Student }) {
  const remove = useDeleteStudent();
  const onDelete = () => {
    if (window.confirm(`${student.fullName} — o'chirilsinmi? (keyin tiklash mumkin)`)) {
      remove.mutate(student.id);
    }
  };

  return (
    <div className="flex justify-end gap-2">
      <Can permission="student.update">
        <EditStudentDialog student={student} />
      </Can>
      <Can permission="student.delete">
        <NmIconButton tone="danger" aria-label="O'chirish" onClick={onDelete} disabled={remove.isPending}>
          <Trash2 className="size-[15px]" strokeWidth={2} />
        </NmIconButton>
      </Can>
    </div>
  );
}
