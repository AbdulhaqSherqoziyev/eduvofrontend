import type { Metadata } from 'next';
import { Suspense } from 'react';
import { AdminPage } from '@/components/mock-admin/shell/admin-page';
import { PricesScreen } from '@/components/mock-admin/screens/prices';

export const metadata: Metadata = { title: 'Narxlar' };

export default function Page() {
  return (
    <AdminPage active="prices" title="Narxlar">
      <Suspense>
        <PricesScreen />
      </Suspense>
    </AdminPage>
  );
}
