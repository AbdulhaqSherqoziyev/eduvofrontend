import type { Metadata } from 'next';
import { AdminPage } from '@/components/mock-admin/shell/admin-page';
import { StatsScreen } from '@/components/mock-admin/screens/stats';

export const metadata: Metadata = { title: 'Statistika' };

export default function Page() {
  return (
    <AdminPage active="stats" title="Statistika">
      <StatsScreen />
    </AdminPage>
  );
}
