'use client';

import { usePathname } from 'next/navigation';
import { ModuleLockedView } from '@/components/shared/module-locked-view';
import { moduleForPath } from '@/lib/nav/items';
import { moduleOn } from '@/lib/auth/module-gate';
import { useModuleGateVersion } from '@/lib/hooks/use-module-gate';

/**
 * Replaces a whole screen when its module is off.
 *
 * QueryBoundary already turns the backend's 403 MODULE_DISABLED into the lock
 * view, but that only covers the data area — a page's own chrome (the "Yangi
 * lid" button, filter tabs) would still sit above it, offering actions the
 * center cannot perform. Doing it here swaps the entire content area instead.
 *
 * The two layers are complementary, not redundant: this one needs the gate to
 * be populated, and the gate answers "on" until the first GET /modules lands
 * (deliberately — see module-gate.ts). Until then the boundary's 403 path is
 * what catches it.
 */
export function ModuleRouteGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  useModuleGateVersion();
  const key = moduleForPath(pathname);
  if (key && !moduleOn(key)) return <ModuleLockedView moduleKey={key} />;
  return <>{children}</>;
}
