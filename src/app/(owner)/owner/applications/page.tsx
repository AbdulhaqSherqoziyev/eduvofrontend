import { ApplicationsList } from './_components/applications-list';

/** Pending self-signup applications — OWNER approves (provisions a center) or rejects. */
export default function OwnerApplicationsPage() {
  return (
    <section className="flex flex-col gap-5">
      <div>
        <h1 className="text-[24px] font-extrabold tracking-[-0.4px] text-foreground">Arizalar</h1>
        <p className="text-[14px] text-muted">Yangi markaz ochish uchun kelgan arizalar</p>
      </div>
      <ApplicationsList />
    </section>
  );
}
