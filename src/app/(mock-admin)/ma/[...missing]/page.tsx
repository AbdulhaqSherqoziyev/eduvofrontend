/**
 * Unknown paths on the admin host (the middleware rewrites them here with HTTP 404). Rendered
 * directly: Next 14.2 with several root layouts cannot SSR notFound().
 */
import type { Metadata } from 'next';
import { NotFoundState } from '@/components/mock-admin/ui/state';

export const metadata: Metadata = { title: '404' };

export default function AdminMissing() {
  return (
    <div className="ma-center">
      <NotFoundState title="Sahifa topilmadi" backHref="/" backLabel="Bosh sahifaga" />
    </div>
  );
}
