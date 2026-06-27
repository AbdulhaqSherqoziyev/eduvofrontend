import { Slot } from '@radix-ui/react-slot';
import { forwardRef } from 'react';
import { cn } from '@/lib/utils/cn';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

const base =
  'inline-flex items-center justify-center gap-2 font-bold border-0 cursor-pointer font-sans ' +
  'disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none ' +
  'focus-visible:ring-2 focus-visible:ring-primary/40 transition-all';

/** shadcn-style base button. Feature code uses the NmButton wrapper instead. */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ asChild, className, type, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp ref={ref} className={cn(base, className)} type={asChild ? undefined : type ?? 'button'} {...props} />
    );
  },
);
Button.displayName = 'Button';
