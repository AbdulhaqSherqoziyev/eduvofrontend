import { initials as toInitials } from '@/lib/utils/initials';
import { cn } from '@/lib/utils/cn';

interface AvatarProps {
  name: string;
  size?: number;
  tone?: 'primary' | 'danger' | 'muted';
  className?: string;
}

const tones = {
  primary: 'text-primary',
  danger: 'text-danger',
  muted: 'text-muted',
};

/** Soft circular avatar showing initials. */
export function Avatar({ name, size = 42, tone = 'primary', className }: AvatarProps) {
  return (
    <div
      className={cn(
        'flex flex-shrink-0 items-center justify-center rounded-full bg-background font-bold shadow-nm-sm',
        tones[tone],
        className,
      )}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.33) }}
    >
      {toInitials(name)}
    </div>
  );
}
