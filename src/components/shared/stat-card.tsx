import { NmCard } from '@/components/ui/nm-card';
import { cn } from '@/lib/utils/cn';

interface StatCardProps {
  label: string;
  value: string;
  unit?: string;
  icon: React.ReactNode;
  accent?: boolean;
  footer?: React.ReactNode;
}

/** Dashboard metric card: uppercase label, soft icon, big number, footer pill. */
export function StatCard({ label, value, unit, icon, accent, footer }: StatCardProps) {
  return (
    <NmCard className="p-[22px]">
      <div className="mb-[18px] flex items-start justify-between">
        <div className="max-w-[120px] text-[11px] font-bold uppercase leading-[1.4] tracking-[0.7px] text-muted">
          {label}
        </div>
        <div className="flex size-10 flex-shrink-0 items-center justify-center rounded-[12px] bg-background text-primary shadow-nm-sm">
          {icon}
        </div>
      </div>
      <div className="flex items-baseline gap-1.5">
        <span
          className={cn(
            'text-[34px] font-extrabold leading-none tracking-[-1px]',
            accent ? 'text-primary' : 'text-foreground',
          )}
        >
          {value}
        </span>
        {unit ? <span className="text-[14px] font-bold text-[#5b6b82]">{unit}</span> : null}
      </div>
      {footer ? <div className="mt-3.5">{footer}</div> : null}
    </NmCard>
  );
}
