/**
 * admin-mock.eduvo.uz root layout — the third root layout (next to (erp) and (mock)/m/[lang]).
 * The admin host rewrites `/x` → `/ma/x` (src/middleware.ts); `/ma/*` is a 404 on every other host.
 * Never indexed: meta robots here + `X-Robots-Tag` from the middleware + robots.txt `Disallow: /`.
 */
import type { Metadata, Viewport } from 'next';
import { Manrope } from 'next/font/google';
import { ADMIN_THEME_SCRIPT } from '@/components/mock-admin/shell/theme';
import { ToastProvider } from '@/components/mock-admin/ui/toast';
import { QueryProvider } from '@/providers/query-provider';
import '../mock-admin.css';

const manrope = Manrope({ subsets: ['latin', 'cyrillic'], weight: ['400', '500', '600', '700', '800'], variable: '--ma-font', display: 'swap' });

export const metadata: Metadata = {
  title: { default: 'Eduvo Mock Admin', template: 'Eduvo Mock Admin — %s' },
  applicationName: 'Eduvo Mock Admin',
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
  icons: {
    icon: [{ url: '/brand/favicon.svg?v=2', type: 'image/svg+xml' }, { url: '/brand/favicon.ico?v=2', sizes: '16x16 32x32 48x48' }],
    apple: [{ url: '/brand/apple-touch-icon.png?v=2', sizes: '180x180' }],
  },
  formatDetection: { telephone: false, email: false },
  referrer: 'same-origin',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#E8ECF3',
};

export default function AdminMockRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz" data-theme="light" className={manrope.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: ADMIN_THEME_SCRIPT }} />
      </head>
      <body>
        <QueryProvider>
          <ToastProvider>{children}</ToastProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
