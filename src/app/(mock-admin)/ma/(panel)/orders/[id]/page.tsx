import type { Metadata } from 'next';
import { OrderDetailScreen } from '@/components/mock-admin/screens/order-detail';

export const metadata: Metadata = { title: 'Buyurtma' };

export default function Page({ params }: { params: { id: string } }) {
  return <OrderDetailScreen id={params.id} />;
}
