'use client';
/** Small building blocks shared by the owner-mock pages (tabs, sections, key/value rows, load more). */
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { UseInfiniteQueryResult, InfiniteData } from '@tanstack/react-query';
import { NmButton } from '@/components/ui/nm-button';
import { NmCard } from '@/components/ui/nm-card';
import { EmptyState } from '@/components/shared/empty-state';
import { ErrorCard } from '@/components/shared/error-card';
import { RowsSkeleton } from '@/components/shared/skeleton';
import type { KeysetPage } from '@/lib/types/owner-mock';
import { cn } from '@/lib/utils/cn';

const TABS = [
  { href: '/owner/mock', label: 'Buyurtmalar' },
  { href: '/owner/mock/learners', label: "O'quvchilar" },
  { href: '/owner/mock/promo', label: 'Promo kodlar' },
  { href: '/owner/mock/tickets', label: 'Murojaatlar' },
  { href: '/owner/mock/stats', label: 'Statistika' },
];

export function MockTabs() {
  const path = usePathname();
  const active = (h: string) => (h === '/owner/mock' ? path === h || path.startsWith('/owner/mock/orders') : path.startsWith(h));
  return (
    <nav className="flex gap-2 overflow-x-auto pb-1" aria-label="Mock bo'limlari">
      {TABS.map((t) => (
        <Link key={t.href} href={t.href} aria-current={active(t.href) ? 'page' : undefined}
          className={cn('h-[40px] flex-shrink-0 rounded-ctl px-4 text-[13px] font-bold leading-[40px] whitespace-nowrap',
            active(t.href) ? 'bg-background text-primary shadow-nm-inset-sm' : 'bg-background text-muted shadow-nm-sm hover:text-foreground')}>
          {t.label}
        </Link>
      ))}
    </nav>
  );
}

export function Section({ title, children, action, className }: { title: string; children: React.ReactNode; action?: React.ReactNode; className?: string }) {
  return (
    <NmCard className={cn('flex flex-col gap-3 p-5', className)}>
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-[15px] font-extrabold text-foreground">{title}</h2>
        {action}
      </div>
      {children}
    </NmCard>
  );
}

/** Two-column key/value grid (label muted, value bold). */
export function KV({ rows }: { rows: Array<[string, React.ReactNode]> }) {
  return (
    <dl className="grid grid-cols-1 gap-x-6 gap-y-2.5 sm:grid-cols-2">
      {rows.map(([k, v]) => (
        <div key={k} className="flex min-w-0 flex-col">
          <dt className="text-[11px] font-bold uppercase tracking-[0.8px] text-muted">{k}</dt>
          <dd className="break-words text-[13.5px] font-semibold text-foreground">{v ?? '—'}</dd>
        </div>
      ))}
    </dl>
  );
}

export const Muted = ({ children }: { children: React.ReactNode }) => <p className="text-[13px] font-medium text-muted">{children}</p>;

/** Keyset list: skeleton → error (retry) → empty → rows + "Ko'proq". */
export function KeysetList<T>({ query, empty, emptyHint, children }: {
  query: UseInfiniteQueryResult<InfiniteData<KeysetPage<T>>>;
  empty: string; emptyHint?: string;
  children: (items: T[]) => React.ReactNode;
}) {
  if (query.isLoading) return <NmCard className="px-4 py-3.5"><RowsSkeleton rows={6} /></NmCard>;
  if (query.isError && !query.data) return <ErrorCard onRetry={() => query.refetch()} />;
  const items = query.data?.pages.flatMap((p) => p.items) ?? [];
  if (!items.length) return <EmptyState title={empty} hint={emptyHint} />;
  return (
    <div className="flex flex-col gap-3">
      {children(items)}
      {query.hasNextPage ? (
        <div className="flex justify-center">
          <NmButton variant="soft" size="sm" disabled={query.isFetchingNextPage} onClick={() => query.fetchNextPage()}>
            {query.isFetchingNextPage ? 'Yuklanmoqda…' : "Ko'proq"}
          </NmButton>
        </div>
      ) : null}
    </div>
  );
}

/** Horizontally scrollable table shell for phones. */
export function TableCard({ head, children, cols }: { head: string[]; children: React.ReactNode; cols: string }) {
  return (
    <NmCard className="overflow-x-auto px-4 py-3.5">
      <div className="min-w-[760px]">
        <div className={cn('grid gap-3 px-3 pb-3 pt-1 text-[10.5px] font-bold uppercase tracking-[0.8px] text-[#9aa6b8]', cols)}>
          {head.map((h) => <div key={h}>{h}</div>)}
        </div>
        {children}
      </div>
    </NmCard>
  );
}
export const rowCls = (cols: string) => cn('grid items-center gap-3 rounded-[14px] px-3 py-3 text-[13px] hover:bg-[rgba(46,107,230,0.05)]', cols);
