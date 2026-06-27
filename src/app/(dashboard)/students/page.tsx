import { Can } from '@/components/shared/can';
import { StudentsBoard } from './_components/students-board';
import { AddStudentDialog } from './_components/add-student-dialog';

/** Students screen — searchable table, status filters, soft-delete + trash. */
export default function StudentsPage() {
  return (
    <section>
      <StudentsBoard />
      <Can permission="student.create">
        <AddStudentDialog />
      </Can>
    </section>
  );
}
