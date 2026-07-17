import { Can } from "@/components/shared/can";
import { OwnerOnly } from "@/components/shared/owner-only";
import { StudentsBoard } from "./_components/students-board";
import { AddStudentDialog } from "./_components/add-student-dialog";
import { ImportStudentsDialog } from "./_components/import-students-dialog";
import { CredentialsDialog } from "./_components/credentials-dialog";

/** Students screen — table, filters, bulk import + credential generation, soft-delete. */
export default function StudentsPage() {
  return (
    <section className="flex flex-col gap-5">
      <OwnerOnly>
        <div className="flex flex-wrap justify-end gap-3">
          <ImportStudentsDialog />
          <CredentialsDialog />
        </div>
      </OwnerOnly>
      <StudentsBoard />
      <Can permission="student.create">
        <AddStudentDialog />
      </Can>
    </section>
  );
}
