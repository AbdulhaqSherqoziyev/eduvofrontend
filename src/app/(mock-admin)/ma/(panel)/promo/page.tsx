import type { Metadata } from 'next';
import { AdminPage } from '@/components/mock-admin/shell/admin-page';
import { PromoScreen } from '@/components/mock-admin/screens/promo';

export const metadata: Metadata = { title: 'Promo-kodlar' };

export default function Page() {
  return (
    <AdminPage active="promo" title="Promo-kodlar">
      <PromoScreen />
    </AdminPage>
  );
}
