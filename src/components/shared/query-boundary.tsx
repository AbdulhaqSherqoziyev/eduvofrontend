'use client';

import type { UseQueryResult } from '@tanstack/react-query';
import { ErrorCard } from './error-card';
import { ModuleLockedView } from './module-locked-view';
import { moduleDisabledKey } from '@/lib/utils/api-error';

interface QueryBoundaryProps<T> {
  query: UseQueryResult<T>;
  loading: React.ReactNode;
  /** Render once data has loaded successfully. */
  children: (data: T) => React.ReactNode;
  /** Treat this as empty (renders `empty` instead of children). */
  isEmpty?: (data: T) => boolean;
  empty?: React.ReactNode;
}

/** Consistent loading / error / empty / success handling for a single query. */
export function QueryBoundary<T>({ query, loading, children, isEmpty, empty }: QueryBoundaryProps<T>) {
  if (query.isLoading) return <>{loading}</>;
  if (query.isError || query.data === undefined) {
    // A screen whose module is off answers 403 MODULE_DISABLED. Catching it in
    // the one boundary every screen already goes through covers all of them at
    // once — and "Ma'lumotni yuklab bo'lmadi" would be a lie: nothing is broken,
    // the section simply was not bought (§B.6).
    const locked = query.isError ? moduleDisabledKey(query.error) : null;
    if (locked !== null) return <ModuleLockedView moduleKey={locked} />;
    return <ErrorCard onRetry={() => query.refetch()} />;
  }
  if (isEmpty?.(query.data) && empty !== undefined) return <>{empty}</>;
  return <>{children(query.data)}</>;
}
