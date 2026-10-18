import type { Metadata } from 'next';
import { Suspense } from 'react';
import { InvitePage } from '@/components/mock-admin/login/invite-page';

export const metadata: Metadata = { title: 'Taklif' };

export default function Page() {
  return (
    <Suspense>
      <InvitePage />
    </Suspense>
  );
}
