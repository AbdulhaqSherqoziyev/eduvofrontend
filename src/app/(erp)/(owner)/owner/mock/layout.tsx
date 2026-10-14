'use client';
import { ShieldOff } from 'lucide-react';
import { EmptyState } from '@/components/shared/empty-state';
import { useAuth } from '@/providers/auth-provider';
import { canManageMock } from '@/lib/auth/can-mock';
import { MockTabs } from './_components/ui';

/** mock.eduvo.uz owner section: header + tabs; only for `mock.manage` (the API answers 403 otherwise). */
export default function OwnerMockLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  return (
    <section className="flex flex-col gap-5">
      <div>
        <h1 className="text-[24px] font-extrabold tracking-[-0.4px] text-foreground">Mock (mock.eduvo.uz)</h1>
        <p className="text-[14px] text-muted">Buyurtmalar, o&apos;quvchilar, kreditlar, promo kodlar va murojaatlar</p>
      </div>
      {canManageMock(user) ? (
        <>
          <MockTabs />
          {children}
        </>
      ) : (
        <EmptyState icon={<ShieldOff className="size-6" />} title="Ruxsat yo'q" hint="Bu bo'lim uchun mock.manage huquqi kerak." />
      )}
    </section>
  );
}
