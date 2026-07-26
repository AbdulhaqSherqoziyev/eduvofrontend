import { cn } from '@/lib/utils/cn';

/**
 * Loading placeholder. A cheap phone renders the word "Yuklanmoqda..." slower
 * than it renders the shape of the screen, and the shape also tells the person
 * what is about to appear.
 */
export function NmSkeleton({ h, className }: { h?: number; className?: string }) {
  return (
    <div
      aria-hidden
      className={cn('animate-pulse rounded-ctl bg-[#dfe5ee] dark:bg-[#2e343e]', className)}
      style={h ? { height: h } : undefined}
    />
  );
}

/** Home screen: one tall card, two medium, three lines (spec §5.5). */
export function HomeSkeleton() {
  return (
    <div className="flex flex-col gap-3" aria-busy="true">
      <NmSkeleton h={72} />
      <NmSkeleton h={56} />
      <NmSkeleton h={56} />
      <NmSkeleton h={16} className="w-3/4" />
      <NmSkeleton h={16} className="w-2/3" />
      <NmSkeleton h={16} className="w-1/2" />
    </div>
  );
}

/** Lists: four 44px rows (spec §5.5). */
export function RowsSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-3" aria-busy="true">
      {Array.from({ length: rows }, (_, i) => (
        <NmSkeleton key={i} h={44} />
      ))}
    </div>
  );
}
