'use client';

import { Clock, WifiOff } from 'lucide-react';
import { NmCard } from '@/components/ui/nm-card';
import { NmButton } from '@/components/ui/nm-button';
import { cachedAtLabel, type FailKind } from '../_lib/api';

/**
 * Shown while the screen is drawn from the cached copy. Neutral, no animation,
 * never red: the person did not do anything wrong, and the data is still true —
 * it just has a timestamp. When the connection returns the screen refreshes
 * silently and this row disappears; no toast, no "connected!" celebration.
 */
export function OfflineBar({ at, kind = 'network' }: { at: string; kind?: Exclude<FailKind, 'auth'> }) {
  const label = cachedAtLabel(at);
  const offline = kind === 'network';
  return (
    <div
      role="status"
      className="sticky top-0 z-20 flex items-center gap-2 rounded-ctl bg-background px-3 py-2 shadow-nm-inset-sm"
    >
      {offline ? <WifiOff className="size-3.5 shrink-0 text-muted" /> : <Clock className="size-3.5 shrink-0 text-muted" />}
      <span className="truncate text-[12.5px] font-semibold text-muted">
        {/* The server being unwell is not the same as the phone having no
            signal. Saying "Internet yo'q" when the connection is fine sends
            people to restart a router that was never the problem — so only the
            freshness half of the sentence is claimed here. */}
        {offline ? `Internet yo'q${label ? ` · ma'lumot ${label} holatiga ko'ra.` : '.'}` : `Ma'lumot ${label} holatiga ko'ra.`}
      </span>
    </div>
  );
}

/**
 * The only error card in the portal. It never offers "Chiqish" — signing the
 * family out is not a fix for a lost connection, and the login came from the
 * centre.
 */
export function PortalErrorCard({ kind, onRetry }: { kind: Exclude<FailKind, 'auth'>; onRetry: () => void }) {
  const offline = kind === 'network';
  return (
    <NmCard className="p-6 text-center">
      <WifiOff className="mx-auto size-7 text-muted" strokeWidth={2} />
      <h2 className="mt-3 text-[17px] font-extrabold text-foreground">
        {offline ? "Internet bilan aloqa yo'q" : "Ma'lumotni yuklab bo'lmadi"}
      </h2>
      <p className="mt-2 text-[13px] font-semibold leading-[1.55] text-muted">
        {offline ? "Ulanishni tekshirib, qayta urinib ko'ring." : "Birozdan keyin qayta urinib ko'ring."}
      </p>
      <NmButton className="mt-5 w-full" onClick={onRetry}>
        Qayta urinish
      </NmButton>
    </NmCard>
  );
}
