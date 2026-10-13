/**
 * ERP 404. With two root layouts ((erp) + (mock)) there is no app-level layout, and Next 14.2
 * SSR-renders notFound() as a bare `__next_error__` shell. So unknown ERP URLs land here (static
 * routes always win over this catch-all), the 404 UI is rendered directly inside the ERP root
 * layout, and src/middleware.ts sets the HTTP 404 status from the generated route manifest.
 */
import type { Metadata } from 'next';
import ErpNotFound from './erp-not-found';

export const metadata: Metadata = { title: '404: This page could not be found.', robots: { index: false } };

export default function ErpMissing() {
  return <ErpNotFound />;
}
