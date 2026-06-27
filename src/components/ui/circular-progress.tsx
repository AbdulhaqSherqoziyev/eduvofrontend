import { cn } from '@/lib/utils/cn';

interface CircularProgressProps {
  /** 0–100. */
  value: number;
  size?: number;
  stroke?: number;
  className?: string;
  children?: React.ReactNode;
}

/** Blue progress ring (attendance %, group completion). */
export function CircularProgress({ value, size = 70, stroke = 7, children, className }: CircularProgressProps) {
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div className={cn('relative flex-shrink-0', className)} style={{ width: size, height: size }}>
      <svg viewBox="0 0 64 64" width={size} height={size}>
        <circle cx="32" cy="32" r="27" fill="none" stroke="#d4dbe6" strokeWidth={stroke} />
        <circle
          cx="32"
          cy="32"
          r="27"
          fill="none"
          stroke="var(--primary)"
          strokeWidth={stroke}
          strokeLinecap="round"
          pathLength={100}
          strokeDasharray={`${pct} 100`}
          transform="rotate(-90 32 32)"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {children ?? <span className="text-[15px] font-extrabold text-primary">{pct}%</span>}
      </div>
    </div>
  );
}
