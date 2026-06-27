import { cn } from '@/lib/utils/cn';

/** Ustoz logo lockup — soft square mark + wordmark. */
export function Brand({ compact }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={cn(
          'flex flex-shrink-0 items-center justify-center rounded-[14px] bg-background shadow-nm-sm',
          compact ? 'size-11' : 'size-12',
        )}
      >
        <div className="size-4 rotate-45 rounded-[5px] bg-grad-primary shadow-[0_3px_6px_rgba(46,107,230,0.45)]" />
      </div>
      <div>
        <div className="text-[18px] font-extrabold leading-none tracking-[-0.4px] text-foreground">Ustoz</div>
        <div className="mt-[3px] text-[10.5px] font-semibold text-muted">Ta&apos;lim markazi</div>
      </div>
    </div>
  );
}
