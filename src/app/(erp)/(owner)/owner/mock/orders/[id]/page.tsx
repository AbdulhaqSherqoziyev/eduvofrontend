import { OrderDetail } from '../../_components/order-detail';

/** /owner/mock/orders/{id} — one mock.eduvo.uz order with its webhook log, admin actions and credit lots. */
export default function OwnerMockOrderPage({ params }: { params: { id: string } }) {
  return <OrderDetail id={params.id} />;
}
