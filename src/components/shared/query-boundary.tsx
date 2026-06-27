'use client';

import type { UseQueryResult } from '@tanstack/react-query';
import { ErrorCard } from './error-card';

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
    return <ErrorCard onRetry={() => query.refetch()} />;
  }
  if (isEmpty?.(query.data) && empty !== undefined) return <>{empty}</>;
  return <>{children(query.data)}</>;
}
