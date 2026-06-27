import { UsersPanel } from './_components/users-panel';

/** OWNER cross-tenant user management — every center's login accounts. */
export default function OwnerUsersPage() {
  return (
    <section className="flex flex-col gap-5">
      <div>
        <h1 className="text-[24px] font-extrabold tracking-[-0.4px] text-foreground">Foydalanuvchilar</h1>
        <p className="text-[14px] text-muted">
          Barcha markazlardagi login akkauntlar — qo&apos;shish, tahrirlash, parolni tiklash, o&apos;chirish
        </p>
      </div>
      <UsersPanel />
    </section>
  );
}
