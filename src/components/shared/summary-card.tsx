import { NmCard } from '@/components/ui/nm-card';
import { cn } from '@/lib/utils/cn';

type Tone = 'success' | 'danger' | 'primary' | 'muted';

const toneText: Record<Tone, string> = {
  success: 'text-success',
  danger: 'text-danger',
  primary: 'text-primary',
  muted: 'text-foreground',
};

interface SummaryCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  tone?: Tone;
}

/** Icon-left summary card used in the payments & transactions strips. */
export function SummaryCard({ label, value, icon, tone = 'primary' }: SummaryCardProps) {
  return (
    <NmCard className="flex items-center gap-4 p-[22px]">
      <div
        className={cn(
          'flex size-[50px] flex-shrink-0 items-center justify-center rounded-[15px] bg-background shadow-nm-inset-sm',
          toneText[tone],
        )}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <div className="mb-[5px] text-[11px] font-bold uppercase tracking-[0.7px] text-muted">{label}</div>
        <div className={cn('whitespace-nowrap text-[21px] font-extrabold tracking-[-0.5px]', toneText[tone])}>
          {value}
        </div>
      </div>
    </NmCard>
  );
}
