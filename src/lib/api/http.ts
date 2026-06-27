/** Shared API response shapes used across resources. */

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize?: number;
}

export type ListParams = Record<string, string | number | boolean | undefined>;

/** Strip undefined/empty params so axios doesn't send empty query keys. */
export function cleanParams<T extends object>(params: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== ''),
  ) as Partial<T>;
}
