import { forwardRef } from 'react';
import { cn } from '@/lib/utils/cn';

/** shadcn-style base card surface. Feature code uses the NmCard wrapper. */
export const Card = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('bg-background', className)} {...props} />
  ),
);
Card.displayName = 'Card';
