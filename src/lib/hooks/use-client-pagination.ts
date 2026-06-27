import { useState } from 'react';

/** Client-side pagination for an already-loaded array (small in-memory lists).
 *  Pairs with <Pagination /> so array lists page exactly like server lists. */
export function useClientPagination<T>(items: T[], defaultSize = 10) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultSize);

  const total = items.length;
  const maxPage = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, maxPage);
  const pageItems = items.slice((safePage - 1) * pageSize, safePage * pageSize);
  const onPageSizeChange = (s: number) => {
    setPageSize(s);
    setPage(1);
  };

  return { page: safePage, pageSize, total, pageItems, setPage, onPageSizeChange };
}
