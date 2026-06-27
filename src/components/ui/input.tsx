import { forwardRef } from 'react';
import { cn } from '@/lib/utils/cn';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

/** shadcn-style base input. Feature code uses the NmInput wrapper. */
export const Input = forwardRef<HTMLInputElement, InputProps>(({ className, type, ...props }, ref) => (
  <input
    ref={ref}
    type={type ?? 'text'}
    className={cn('font-sans outline-none border-0', className)}
    {...props}
  />
));
Input.displayName = 'Input';
