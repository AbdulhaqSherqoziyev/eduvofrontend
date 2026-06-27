import { Card } from './card';
import { cn } from '@/lib/utils/cn';

interface NmCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Pressed-in surface (used for nested wells, selected items). */
  inset?: boolean;
}

/** Raised (or inset) neomorphic surface — the base container for every screen. */
export function NmCard({ className, inset, ...props }: NmCardProps) {
  return (
    <Card
      className={cn('rounded-card', inset ? 'shadow-nm-inset' : 'shadow-nm', className)}
      {...props}
    />
  );
}
