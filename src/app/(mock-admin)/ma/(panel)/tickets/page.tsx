import type { Metadata } from 'next';
import { AdminPage } from '@/components/mock-admin/shell/admin-page';
import { PendingScreen } from '@/components/mock-admin/shell/pending';

export const metadata: Metadata = { title: 'Murojaatlar' };

export default function Page() {
  return (
    <AdminPage active="tickets" title="Murojaatlar">
      <PendingScreen />
    </AdminPage>
  );
}
