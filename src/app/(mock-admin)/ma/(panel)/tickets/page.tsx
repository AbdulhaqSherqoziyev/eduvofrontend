import type { Metadata } from 'next';
import { Suspense } from 'react';
import { AdminPage } from '@/components/mock-admin/shell/admin-page';
import { TicketsScreen } from '@/components/mock-admin/screens/tickets';

export const metadata: Metadata = { title: 'Murojaatlar' };

export default function Page() {
  return (
    <AdminPage active="tickets" title="Murojaatlar">
      <Suspense>
        <TicketsScreen />
      </Suspense>
    </AdminPage>
  );
}
