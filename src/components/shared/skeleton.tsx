import { cn } from '@/lib/utils/cn';

/** Inset pulsing placeholder block. */
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-[12px] bg-background shadow-nm-inset-sm', className)} />;
}

/** Repeated full-width rows for table loading states. */
export function RowsSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-2.5">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-[52px] w-full" />
      ))}
    </div>
  );
}

/** Grid of card placeholders. */
export function CardGridSkeleton({ count = 4, className }: { count?: number; className?: string }) {
  return (
    <div className={cn('grid gap-[22px]', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-[150px] w-full" />
      ))}
    </div>
  );
}
