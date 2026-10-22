import type { Metadata } from 'next';
import { Suspense } from 'react';
import { AdminPage } from '@/components/mock-admin/shell/admin-page';
import { AnalyticsScreen } from '@/components/mock-admin/screens/analytics';

export const metadata: Metadata = { title: 'Analitika' };

export default function Page() {
  return (
    <AdminPage active="analytics" title="Analitika">
      <Suspense>
        <AnalyticsScreen />
      </Suspense>
    </AdminPage>
  );
}
