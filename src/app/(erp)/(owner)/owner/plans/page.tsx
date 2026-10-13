import { PlansList } from './_components/plans-list';
import { SetupFeeCard } from './_components/setup-fee-card';

/** Global plan catalogue — OWNER sets the setup price + optional tariffs. */
export default function OwnerPlansPage() {
  return (
    <section className="flex flex-col gap-5">
      <div>
        <h1 className="text-[24px] font-extrabold tracking-[-0.4px] text-foreground">Tariflar</h1>
        <p className="text-[14px] text-muted">O&apos;rnatish narxi + ixtiyoriy tariflar (o&apos;quvchi soni, filial, modullar)</p>
      </div>
      <SetupFeeCard />
      <PlansList />
    </section>
  );
}
