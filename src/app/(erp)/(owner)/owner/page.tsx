import { CentersTable } from './_components/centers-table';
import { CreateCenterDialog } from './_components/create-center-dialog';

/** Owner home — all education centers with their subscription status + balance. */
export default function OwnerCentersPage() {
  return (
    <section className="flex flex-col gap-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[24px] font-extrabold tracking-[-0.4px] text-foreground">Markazlar</h1>
          <p className="text-[14px] text-muted">Barcha o&apos;quv markazlari, obuna holati va balansi</p>
        </div>
        <CreateCenterDialog />
      </div>
      <CentersTable />
    </section>
  );
}
