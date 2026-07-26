import { AuthGuard } from '@/components/layout/auth-guard';
import { Topbar } from '@/components/layout/topbar';
import { Sidebar } from '@/components/layout/sidebar';
import { PageTitle } from '@/components/layout/page-title';
import { ImpersonationBanner } from '@/components/owner/impersonation-banner';
import { MobileNavProvider } from '@/components/layout/mobile-nav';
import { ModuleGateSync } from '@/components/layout/module-gate-sync';
import { ModuleRouteGuard } from '@/components/layout/module-route-guard';

/** Dashboard shell: protected, with the floating top bar + sidebar (drawer on mobile). */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <MobileNavProvider>
        <ModuleGateSync />
        <div className="flex h-screen flex-col overflow-hidden">
          <ImpersonationBanner />
          <div className="flex min-h-0 flex-1 flex-col gap-3.5 p-3 md:gap-5 md:p-[22px]">
            <Topbar />
            <div className="flex min-h-0 flex-1 gap-[22px]">
              <Sidebar />
              <div className="flex h-full min-w-0 flex-1 flex-col gap-3 md:gap-[18px]">
                <PageTitle />
                <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden pr-1 md:pr-1.5">
                  <ModuleRouteGuard>{children}</ModuleRouteGuard>
                </main>
              </div>
            </div>
          </div>
        </div>
      </MobileNavProvider>
    </AuthGuard>
  );
}
