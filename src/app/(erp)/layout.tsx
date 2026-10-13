import type { Metadata } from 'next';
import './globals.css';
import { QueryProvider } from '@/providers/query-provider';
import { AuthProvider } from '@/providers/auth-provider';

export const metadata: Metadata = {
  title: 'Eduvo — ERP',
  description: "Ta'lim markazlari uchun ERP tizimi",
  manifest: '/manifest.json',
  themeColor: '#2E6BE6',
  appleWebApp: { capable: true, title: 'Eduvo', statusBarStyle: 'default' },
  icons: { icon: '/favicon.svg', apple: '/icon-512.png' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html: "try{if(localStorage.getItem('eduvo_theme')==='dark')document.documentElement.classList.add('dark')}catch(e){}",
          }}
        />
        <QueryProvider>
          <AuthProvider>{children}</AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
