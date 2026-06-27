import { Can } from '@/components/shared/can';
import { ManageGroupsTable } from './_components/manage-groups-table';
import { CreateGroupDialog } from './_components/create-group-dialog';
import { AssignStudentDialog } from './_components/assign-student-dialog';

/** Manage groups — create/delete groups and assign students to them. */
export default function ManageGroupsPage() {
  return (
    <section className="flex flex-col gap-5">
      <div className="flex justify-end gap-3">
        <Can permission="group.update">
          <AssignStudentDialog />
        </Can>
        <Can permission="group.create">
          <CreateGroupDialog />
        </Can>
      </div>
      <ManageGroupsTable />
    </section>
  );
}
