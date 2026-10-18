/** Every signed-in admin screen: shell data (env pill from the host; session, badges, notifications from the API later). */
import { headers } from 'next/headers';
import { AdminPanel } from '@/components/mock-admin/shell/admin-panel';
import { adminMockEnv } from '@/lib/routing/hosts';

export const dynamic = 'force-dynamic';

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  const host = (headers().get('host') ?? '').toLowerCase().replace(/:\d+$/, '');
  return <AdminPanel env={adminMockEnv(host)}>{children}</AdminPanel>;
}
