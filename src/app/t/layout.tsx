import type { Metadata } from 'next';
import { SwRegister } from '../portal/_components/sw-register';

/**
 * The teacher's app is a third installable app, not a shrunken ERP.
 *
 * Without its own `id` and `scope` a browser treats all three manifests as one
 * application, and a teacher who installed from here would land on the staff
 * dashboard — revenue charts and debtor lists — instead of today's lessons.
 * iOS reads only apple-mobile-web-app-title, hence `appleWebApp.title`.
 */
export const metadata: Metadata = {
  title: 'Eduvo Ustoz',
  manifest: '/manifest-teacher.json',
  appleWebApp: { capable: true, title: 'Eduvo Ustoz', statusBarStyle: 'default' },
  icons: { icon: '/favicon.svg', apple: '/icon-512.png' },
};

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SwRegister />
      {children}
    </>
  );
}
