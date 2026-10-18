import type { Metadata } from 'next';
import { AdminPage } from '@/components/mock-admin/shell/admin-page';
import { SettingsScreen } from '@/components/mock-admin/screens/settings';

export const metadata: Metadata = { title: 'Sozlamalar' };

export default function Page() {
  return (
    <AdminPage active="settings" title="Sozlamalar" maxWidth={1100}>
      <SettingsScreen />
    </AdminPage>
  );
}
