import { cn } from '@/lib/utils/cn';

export type PillTone = 'success' | 'danger' | 'warning' | 'muted' | 'primary' | 'ai';

const tones: Record<PillTone, string> = {
  success: 'text-success bg-[rgba(43,182,115,0.14)]',
  danger: 'text-danger bg-[rgba(228,87,76,0.14)]',
  warning: 'text-warning bg-[rgba(232,161,58,0.17)]',
  muted: 'text-[#5b6b82] bg-[rgba(122,134,153,0.16)]',
  primary: 'text-primary bg-[rgba(46,107,230,0.12)]',
  /** AI grading (mock exams): violet, never red. */
  ai: 'text-[#5B3FD1] bg-[#EEE9FF]',
};

interface StatusPillProps {
  label: string;
  tone: PillTone;
  /** Optional leading glyph, so the state never rests on colour alone. */
  icon?: React.ReactNode;
  className?: string;
}

/** Small rounded status badge, colored by tone. */
export function StatusPill({ label, tone, icon, className }: StatusPillProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-[13px] py-[5px] text-[12px] font-bold',
        tones[tone],
        className,
      )}
    >
      {icon}
      {label}
    </span>
  );
}
