import type { Metadata } from 'next';
import { AdminPage } from '@/components/mock-admin/shell/admin-page';
import { DashboardScreen } from '@/components/mock-admin/screens/dashboard';

export const metadata: Metadata = { title: 'Bosh sahifa' };

export default function Page() {
  return (
    <AdminPage active="dash" title="Bosh sahifa" gap={24}>
      <DashboardScreen />
    </AdminPage>
  );
}
