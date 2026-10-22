'use client';
/**
 * Paged tracker tables (§3.2): top-10 first; "Hammasini ko'rish" asks for 50; then "Ko'proq" follows
 * `nextCursor`. The filter change keeps the old rows dimmed until the new answer arrives.
 */
import { useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import type { Query } from '@/lib/admin-mock/http';
import { T } from './texts';

export function usePaged<R>(key: string, fetcher: (q: Query) => Promise<R>, query: Query | null, mob: boolean, next: (r: R) => string | null | undefined = (r) => (r as { nextCursor?: string | null }).nextCursor) {
  const [expanded, setExpanded] = useState(false);
  const limit = mob ? 5 : expanded ? 50 : 10;
  const q = useInfiniteQuery({
    queryKey: ['am', 'an', key, query, limit],
    queryFn: ({ pageParam }) => fetcher({ ...query, limit, cursor: pageParam ?? undefined }),
    initialPageParam: null as string | null,
    getNextPageParam: (last) => next(last) ?? null,
    enabled: !!query,
    placeholderData: (p) => p,
  });
  const lastPage = q.data?.pages[q.data.pages.length - 1];
  const hasMore = !!(lastPage && next(lastPage));
  const more = mob || !hasMore ? null
    : !expanded ? { label: T.table.showAll, onClick: () => setExpanded(true) }
    : { label: T.table.more, onClick: () => void q.fetchNextPage(), busy: q.isFetchingNextPage };
  return { q, first: q.data?.pages[0], pages: q.data?.pages ?? [], more, hasMore, dim: q.isFetching && q.isPlaceholderData && !q.isFetchingNextPage };
}
