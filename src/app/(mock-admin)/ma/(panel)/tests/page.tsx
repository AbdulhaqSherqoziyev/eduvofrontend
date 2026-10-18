import type { Metadata } from 'next';
import { Suspense } from 'react';
import { AdminPage } from '@/components/mock-admin/shell/admin-page';
import { TestsScreen } from '@/components/mock-admin/screens/tests';

export const metadata: Metadata = { title: 'Testlar' };

export default function Page() {
  return (
    <AdminPage active="tests" title="Testlar">
      <Suspense>
        <TestsScreen />
      </Suspense>
    </AdminPage>
  );
}
