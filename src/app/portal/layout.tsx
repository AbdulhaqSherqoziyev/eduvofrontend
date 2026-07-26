import type { Metadata } from 'next';
import { SwRegister } from './_components/sw-register';

/**
 * The portal installs as its OWN app.
 *
 * The root manifest starts at /dashboard — the ERP admin panel. A parent who
 * pressed "install" from here would get an icon that opens a staff login
 * screen, decide the thing is broken, and delete it. There is no second
 * chance at a deleted icon, so the portal ships its own manifest and scope.
 *
 * Students and parents share one installable app on purpose: a phone is often
 * shared inside a family, and a browser cannot place two icons for one
 * start_url anyway. The login decides which of the two the person sees.
 *
 * iOS ignores `name` in the manifest and reads only apple-mobile-web-app-title,
 * so `appleWebApp.title` is not optional here.
 */
export const metadata: Metadata = {
  title: 'Eduvo — kabinet',
  manifest: '/manifest-portal.json',
  appleWebApp: { capable: true, title: 'Eduvo', statusBarStyle: 'default' },
  icons: { icon: '/favicon.svg', apple: '/icon-512.png' },
};

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SwRegister />
      {children}
    </>
  );
}
