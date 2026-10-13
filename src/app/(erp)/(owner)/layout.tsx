import { OwnerGuard } from '@/components/owner/owner-guard';
import { OwnerSidebar } from '@/components/owner/owner-sidebar';
import { OwnerMobileBar } from '@/components/owner/owner-mobile-bar';
import { MobileNavProvider } from '@/components/layout/mobile-nav';

/** Platform OWNER shell — separate from the per-center dashboard (drawer on mobile). */
export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  return (
    <OwnerGuard>
      <MobileNavProvider>
        <div className="flex h-screen flex-col gap-3 overflow-hidden p-3 md:flex-row md:gap-[22px] md:p-[22px]">
          <OwnerMobileBar />
          <OwnerSidebar />
          <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden pr-1 md:pr-1.5">{children}</main>
        </div>
      </MobileNavProvider>
    </OwnerGuard>
  );
}
