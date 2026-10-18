import type { Metadata } from 'next';
import { AdminPage } from '@/components/mock-admin/shell/admin-page';
import { PendingScreen } from '@/components/mock-admin/shell/pending';

export const metadata: Metadata = { title: 'Sozlamalar' };

export default function Page() {
  return (
    <AdminPage active="settings" title="Sozlamalar" maxWidth={1100}>
      <PendingScreen />
    </AdminPage>
  );
}
