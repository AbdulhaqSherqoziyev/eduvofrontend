'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/auth-provider';

/** Owner-area protection: only platform OWNER users; others bounce away. */
export function OwnerGuard({ children }: { children: React.ReactNode }) {
  const { user, ready } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!ready) return;
    if (!user) router.replace('/login');
    else if (!user.isPlatform) router.replace('/dashboard');
  }, [ready, user, router]);

  if (!ready || !user || !user.isPlatform) {
    return (
      <div className="flex h-screen items-center justify-center text-[14px] font-semibold text-muted">
        Yuklanmoqda...
      </div>
    );
  }
  return <>{children}</>;
}
