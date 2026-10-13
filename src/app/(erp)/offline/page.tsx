'use client';

import { GraduationCap } from 'lucide-react';
import { NmCard } from '@/components/ui/nm-card';
import { NmButton } from '@/components/ui/nm-button';

/**
 * Last resort: the connection is gone AND the shell was never cached. Neutral
 * on purpose — losing signal is not the person's mistake, so nothing here is
 * red and nothing blames them.
 */
export default function OfflinePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4">
      <NmCard className="w-full max-w-sm p-6 text-center">
        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-[18px] bg-background text-primary shadow-nm-sm">
          <GraduationCap className="size-7" />
        </div>
        <div className="text-[13px] font-extrabold uppercase tracking-[1px] text-muted">Eduvo</div>
        <h1 className="mt-2 text-[17px] font-extrabold text-foreground">Internet bilan aloqa yo&apos;q</h1>
        <p className="mt-2 text-[13px] font-semibold leading-[1.55] text-muted">
          Ulanish tiklanganda sahifa o&apos;zi ochiladi.
        </p>
        <NmButton className="mt-5 w-full" onClick={() => window.location.reload()}>
          Qayta urinish
        </NmButton>
      </NmCard>
    </main>
  );
}
