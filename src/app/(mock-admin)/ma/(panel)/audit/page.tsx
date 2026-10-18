import type { Metadata } from 'next';
import { Suspense } from 'react';
import { AdminPage } from '@/components/mock-admin/shell/admin-page';
import { AuditScreen } from '@/components/mock-admin/screens/audit';

export const metadata: Metadata = { title: 'Audit jurnali' };

export default function Page() {
  return (
    <AdminPage active="audit" title="Audit jurnali">
      <Suspense>
        <AuditScreen />
      </Suspense>
    </AdminPage>
  );
}
