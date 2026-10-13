import { Can } from '@/components/shared/can';
import { TeacherTable } from './_components/teacher-table';
import { AddTeacherDialog } from './_components/add-teacher-dialog';

/** Teachers screen — table of teachers with create + soft-delete. */
export default function TeachersPage() {
  return (
    <section className="flex flex-col gap-5">
      <div className="flex justify-end">
        <Can permission="teacher.create">
          <AddTeacherDialog />
        </Can>
      </div>
      <TeacherTable />
    </section>
  );
}
