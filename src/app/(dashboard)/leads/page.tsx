import { Can } from '@/components/shared/can';
import { LeadsBoard } from './_components/leads-board';
import { AddLeadDialog } from './_components/add-lead-dialog';

/** Leads (Lidlar) screen — interested people, staged until they become students. */
export default function LeadsPage() {
  return (
    <section className="flex flex-col gap-5">
      <div className="flex justify-end">
        <Can permission="student.create">
          <AddLeadDialog />
        </Can>
      </div>
      <LeadsBoard />
    </section>
  );
}
