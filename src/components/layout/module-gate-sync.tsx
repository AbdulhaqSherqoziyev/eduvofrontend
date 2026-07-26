'use client';

import { useModulesOverview } from '@/lib/hooks/use-modules';

/**
 * Loads GET /api/modules once per shell mount so the synchronous nav gate is
 * populated. Renders nothing.
 *
 * It lives here rather than inside the sidebar because the answer is shared:
 * the sidebar filters on it, the dashboard's trial notice reads it, and the
 * /modules page reuses the same cached query.
 */
export function ModuleGateSync() {
  useModulesOverview();
  return null;
}
