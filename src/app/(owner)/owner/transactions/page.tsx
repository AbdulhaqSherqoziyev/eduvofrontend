import { TransactionsPanel } from './_components/transactions-panel';

/** OWNER cross-tenant transaction oversight — both money worlds, all centers. */
export default function OwnerTransactionsPage() {
  return (
    <section className="flex flex-col gap-5">
      <div>
        <h1 className="text-[24px] font-extrabold tracking-[-0.4px] text-foreground">Tranzaksiyalar</h1>
        <p className="text-[14px] text-muted">
          Barcha markazlar bo&apos;yicha pul harakati — owner bilan markaz va markaz bilan o&apos;quvchi orasida
        </p>
      </div>
      <TransactionsPanel />
    </section>
  );
}
