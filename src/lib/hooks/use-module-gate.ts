'use client';

import { useSyncExternalStore } from 'react';
import { moduleGateVersion, subscribeModuleGate } from '../auth/module-gate';

/**
 * Re-render when the module gate changes.
 *
 * The gate itself is read synchronously (`moduleOn()`), so components only need
 * to know *that* it moved — hence a version counter rather than the data. The
 * server snapshot is a constant, which matches the shell: everything that reads
 * the gate is client-only, behind AuthGuard.
 */
export function useModuleGateVersion(): number {
  return useSyncExternalStore(subscribeModuleGate, moduleGateVersion, () => 0);
}
