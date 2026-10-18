import type { Metadata } from 'next';
import { Suspense } from 'react';
import { AdminPage } from '@/components/mock-admin/shell/admin-page';
import { OrdersScreen } from '@/components/mock-admin/screens/orders';

export const metadata: Metadata = { title: "To'lovlar" };

export default function Page() {
  return (
    <AdminPage active="orders" title="To'lovlar">
      <Suspense>
        <OrdersScreen />
      </Suspense>
    </AdminPage>
  );
}
