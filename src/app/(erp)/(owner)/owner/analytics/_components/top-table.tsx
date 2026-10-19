'use client';
/**
 * Analytics table (spec §3.4): header row in the existing style, sticky first column, 4px share bar
 * under the name, right-aligned tabular numbers, ≤ 6 columns, horizontal scroll on phones.
 */
import { ArrowDown, ArrowUp } from 'lucide-react';
import { ProgressBar } from '@/components/ui/progress-bar';
import { cn } from '@/lib/utils/cn';

export interface Col<T> {
  key: string;
  label: string;
  /** Header `title` (e.g. a column explanation). */
  title?: string;
  num?: boolean;
  render: (row: T) => React.ReactNode;
  /** Sortable header (button + aria-sort). */
  sortKey?: string;
}

interface TopTableProps<T> {
  cols: Col<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  /** 0..1 share drawn under the first column. */
  share?: (row: T) => number | null;
  /** Phone scroll width: '560' (≤5 cols) / '680' (6 cols) / none (3-col top-5, truncate instead). */
  minW?: '560' | '680';
  sort?: { key: string; order: 'asc' | 'desc'; onSort: (key: string) => void };
}

export function TopTable<T>({ cols, rows, rowKey, share, minW, sort }: TopTableProps<T>) {
  return (
    <div className="-mx-1 overflow-x-auto px-1">
      <table className={cn('w-full border-separate border-spacing-0 text-[13px]', minW === '680' ? 'min-w-[680px]' : minW === '560' ? 'min-w-[560px]' : 'table-fixed')}>
        <thead>
          <tr className="text-[10.5px] font-bold uppercase tracking-[0.8px] text-[#9aa6b8]">
            {cols.map((c, i) => {
              const active = sort && c.sortKey && sort.key === c.sortKey;
              return (
                <th key={c.key} scope="col" title={c.title}
                  aria-sort={c.sortKey && sort ? (active ? (sort.order === 'asc' ? 'ascending' : 'descending') : 'none') : undefined}
                  className={cn('px-3 pb-2.5 pt-1 font-bold', c.num ? 'text-right' : 'text-left',
                    i === 0 ? cn('sticky left-0 z-[1] bg-background', minW ? '' : 'w-[44%] sm:w-[55%]') : '')}>
                  {c.sortKey && sort ? (
                    <button type="button" onClick={() => sort.onSort(c.sortKey!)}
                      className={cn('inline-flex items-center gap-1 uppercase tracking-[0.8px] hover:text-primary', active ? 'text-primary' : '')}>
                      {c.label}
                      {active ? (sort.order === 'asc' ? <ArrowUp className="size-3" aria-hidden /> : <ArrowDown className="size-3" aria-hidden />) : null}
                    </button>
                  ) : c.label}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const s = share?.(r);
            return (
              <tr key={rowKey(r)} className="group">
                {cols.map((c, i) => (
                  <td key={c.key}
                    className={cn('px-3 py-2.5 align-middle text-foreground group-hover:bg-[rgba(46,107,230,0.05)]',
                      c.num ? 'text-right tabular-nums font-semibold' : '',
                      i === 0 ? 'sticky left-0 z-[1] rounded-l-[12px] bg-background' : '',
                      i === cols.length - 1 ? 'rounded-r-[12px]' : '')}>
                    {i === 0 ? (
                      <div className="flex min-w-0 flex-col gap-1.5">
                        <div className="min-w-0 truncate">{c.render(r)}</div>
                        {s !== undefined && s !== null ? <ProgressBar value={s * 100} className="h-[4px]" /> : null}
                      </div>
                    ) : c.render(r)}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/** Bold human name + muted path under it (Sahifalar). */
export function PathCell({ name, path }: { name: string | null; path: string }) {
  if (!name) return <span className="block max-w-[180px] truncate font-semibold sm:max-w-none" title={path}>{path}</span>;
  return (
    <span className="flex min-w-0 max-w-[180px] flex-col sm:max-w-none" title={`${name} — ${path}`}>
      <span className="truncate font-bold">{name}</span>
      <span className="truncate text-[11.5px] font-medium text-muted">{path}</span>
    </span>
  );
}
