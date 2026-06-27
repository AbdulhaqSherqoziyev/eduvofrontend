import { cn } from '@/lib/utils/cn';

interface ProgressBarProps {
  /** 0–100. */
  value: number;
  className?: string;
}

/** Inset track with a blue gradient fill. */
export function ProgressBar({ value, className }: ProgressBarProps) {
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div className={cn('h-[11px] overflow-hidden rounded-full bg-background shadow-nm-inset-sm', className)}>
      <div className="h-full rounded-full bg-grad-bar" style={{ width: `${pct}%` }} />
    </div>
  );
}
