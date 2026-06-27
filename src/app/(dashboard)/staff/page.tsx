import { Can } from '@/components/shared/can';
import { StaffTable } from './_components/staff-table';
import { AddStaffDialog } from './_components/add-staff-dialog';

/** Staff (employees) screen — the director creates staff, assigns roles,
 *  resets passwords and soft-deletes. */
export default function StaffPage() {
  return (
    <section className="flex flex-col gap-5">
      <div className="flex justify-end">
        <Can permission="user.create">
          <AddStaffDialog />
        </Can>
      </div>
      <StaffTable />
    </section>
  );
}
