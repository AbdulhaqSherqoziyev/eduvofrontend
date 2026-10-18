import type { Metadata } from 'next';
import { Suspense } from 'react';
import { AdminPage } from '@/components/mock-admin/shell/admin-page';
import { AttemptsScreen } from '@/components/mock-admin/screens/attempts';

export const metadata: Metadata = { title: 'Urinishlar' };

export default function Page() {
  return (
    <AdminPage active="attempts" title="Urinishlar">
      <Suspense>
        <AttemptsScreen />
      </Suspense>
    </AdminPage>
  );
}
