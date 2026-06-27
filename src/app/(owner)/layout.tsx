import { OwnerGuard } from '@/components/owner/owner-guard';
import { OwnerSidebar } from '@/components/owner/owner-sidebar';

/** Platform OWNER shell — separate from the per-center dashboard. */
export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  return (
    <OwnerGuard>
      <div className="flex h-screen gap-[22px] overflow-hidden p-[22px]">
        <OwnerSidebar />
        <main className="min-h-0 flex-1 overflow-y-auto pr-1.5">{children}</main>
      </div>
    </OwnerGuard>
  );
}
