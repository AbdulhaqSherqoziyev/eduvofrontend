'use client';

import { Eye, Trash2 } from 'lucide-react';
import { Can } from '@/components/shared/can';
import { NmIconButton } from '@/components/ui/nm-icon-button';
import { useDeleteStudent } from '@/lib/hooks/use-students';
import { impersonateApi } from '@/lib/api/impersonate';
import { enterAsStudent } from '@/lib/auth/impersonation';
import type { Student } from '@/lib/types/student';
import { EditStudentDialog } from './edit-student-dialog';
import { StudentCredentialsDialog } from './student-credentials-dialog';

/** Row actions: edit (student.update) and soft-delete (student.delete). */
export function StudentRowActions({ student }: { student: Student }) {
  const remove = useDeleteStudent();
  const onDelete = () => {
    if (window.confirm(`${student.fullName} — o'chirilsinmi? (keyin tiklash mumkin)`)) {
      remove.mutate(student.id);
    }
  };
  const onView = async () => {
    try { const r = await impersonateApi.student(student.id); enterAsStudent(r.accessToken); }
    catch { window.alert("O'quvchi kabinetini ochib bo'lmadi"); }
  };

  return (
    <div className="flex justify-end gap-2">
      <Can permission="user.update">
        <NmIconButton aria-label="Kabinetini ko'rish" onClick={onView}>
          <Eye className="size-[15px]" strokeWidth={2} />
        </NmIconButton>
      </Can>
      <Can permission="student.update">
        <StudentCredentialsDialog student={student} />
      </Can>
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
