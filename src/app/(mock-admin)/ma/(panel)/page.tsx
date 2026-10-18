import type { Metadata } from 'next';
import { AdminPage } from '@/components/mock-admin/shell/admin-page';
import { PendingScreen } from '@/components/mock-admin/shell/pending';

export const metadata: Metadata = { title: 'Bosh sahifa' };

export default function Page() {
  return (
    <AdminPage active="dash" title="Bosh sahifa" gap={24}>
      <PendingScreen />
    </AdminPage>
  );
}
