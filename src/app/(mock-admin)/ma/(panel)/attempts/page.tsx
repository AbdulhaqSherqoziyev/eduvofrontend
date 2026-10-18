import type { Metadata } from 'next';
import { AdminPage } from '@/components/mock-admin/shell/admin-page';
import { PendingScreen } from '@/components/mock-admin/shell/pending';

export const metadata: Metadata = { title: 'Urinishlar' };

export default function Page() {
  return (
    <AdminPage active="attempts" title="Urinishlar">
      <PendingScreen />
    </AdminPage>
  );
}
