import type { Metadata } from 'next';
import { Suspense } from 'react';
import { AdminLoginPage } from '@/components/mock-admin/login/login-page';

export const metadata: Metadata = { title: 'Kirish' };

export default function LoginPage() {
  return (
    <Suspense>
      <AdminLoginPage />
    </Suspense>
  );
}
