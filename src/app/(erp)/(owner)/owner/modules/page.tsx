import { ModulesPanel } from './_components/modules-panel';

/** Platform module catalogue — the OWNER sets price, texts and sale state. */
export default function OwnerModulesPage() {
  return (
    <section className="flex flex-col gap-5">
      <div>
        <h1 className="text-[24px] font-extrabold tracking-[-0.4px] text-foreground">Modullar</h1>
        <p className="text-[14px] text-muted">
          Katalog narxi va sotuvdagi holati — o&apos;zgarish faqat yangi tanlovlarga ta&apos;sir qiladi
        </p>
      </div>
      <ModulesPanel />
    </section>
  );
}
