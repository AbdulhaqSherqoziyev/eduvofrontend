import type { Metadata } from 'next';
import { Suspense } from 'react';
import { AdminPage } from '@/components/mock-admin/shell/admin-page';
import { LearnersScreen } from '@/components/mock-admin/screens/learners';

export const metadata: Metadata = { title: "O'quvchilar" };

export default function Page() {
  return (
    <AdminPage active="learners" title="O'quvchilar">
      <Suspense>
        <LearnersScreen />
      </Suspense>
    </AdminPage>
  );
}
