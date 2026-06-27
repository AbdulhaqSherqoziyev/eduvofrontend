import { AuthGuard } from '@/components/layout/auth-guard';
import { Topbar } from '@/components/layout/topbar';
import { Sidebar } from '@/components/layout/sidebar';
import { PageTitle } from '@/components/layout/page-title';
import { ImpersonationBanner } from '@/components/owner/impersonation-banner';

/** Dashboard shell: protected, with the floating top bar + sidebar. */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="flex h-screen flex-col overflow-hidden">
        <ImpersonationBanner />
        <div className="flex min-h-0 flex-1 flex-col gap-5 p-[22px]">
          <Topbar />
          <div className="flex min-h-0 flex-1 gap-[22px]">
            <Sidebar />
            <div className="flex h-full min-w-0 flex-1 flex-col gap-[18px]">
              <PageTitle />
              <main className="min-h-0 flex-1 overflow-y-auto pr-1.5">{children}</main>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
