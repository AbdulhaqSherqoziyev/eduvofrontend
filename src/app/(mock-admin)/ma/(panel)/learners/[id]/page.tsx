import type { Metadata } from 'next';
import { AdminPage } from '@/components/mock-admin/shell/admin-page';
import { ROOT_CRUMB, segText } from '@/components/mock-admin/shell/nav';
import { PendingScreen } from '@/components/mock-admin/shell/pending';

type P = { params: { id: string } };

export function generateMetadata({ params }: P): Metadata {
  return { title: segText(params.id) };
}

/** Title = the record's own name/number once the API is wired; the URL id until then. */
export default function Page({ params }: P) {
  return (
    <AdminPage active="learners" title={segText(params.id)} crumbs={[ROOT_CRUMB, { label: "O'quvchilar", href: '/learners' }]}>
      <PendingScreen />
    </AdminPage>
  );
}
