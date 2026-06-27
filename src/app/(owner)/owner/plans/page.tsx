import { PlansList } from './_components/plans-list';

/** Global plan catalogue — OWNER sets default monthly/setup fees + trial days. */
export default function OwnerPlansPage() {
  return (
    <section className="flex flex-col gap-5">
      <div>
        <h1 className="text-[24px] font-extrabold tracking-[-0.4px] text-foreground">Tariflar</h1>
        <p className="text-[14px] text-muted">Standart oylik/o&apos;rnatish to&apos;lovlari va sinov muddati</p>
      </div>
      <PlansList />
    </section>
  );
}
